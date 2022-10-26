import camelcase from "camelcase";
import fs from "fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import {fromMarkdown} from "mdast-util-from-markdown";

export class IssueParser
{
	/**
	 * @param {string} [issueTemplatesDir='./.github/ISSUE_TEMPLATE']
	 */
	constructor(issueTemplatesDir)
	{
		this.ignoredValues = ["_No response_"];
		this.issueTemplatesDir = issueTemplatesDir || "./.github/ISSUE_TEMPLATE";
	}

	/**
	 * @param {string} templateName
	 * @returns {Promise<Object>}
	 */
	async parseTemplate(templateName)
	{
		const issuePath = path.join(this.issueTemplatesDir, templateName);
		const templateContents = await fs.readFile(issuePath);

		return yaml.load(templateContents.toString());
	}

	/**
	 * Parse issue body, return object with values matching template
	 * @async
	 * @param {string} issueBody
	 * @param {string} templateName
	 * @returns {Object}
	 */
	async parseBody(issueBody, templateName)
	{
		const templateDefinition = await this.parseTemplate(templateName);

		// Map input labels to IDs
		// ex., {'Contact Details': 'contact'}
		const inputMap = {};
		templateDefinition.body.forEach((input) => {
			inputMap[input.attributes.label] = input.id;
		});

		// Parse body nodes
		const body = {
			_metadata: {},
		};

		let children = [];
		let section = {};

		let nodes = fromMarkdown(issueBody);
		nodes.children.forEach((node, index) => {
			if (node.type === "heading") {
				section.label = getNodeValue(node, textFormatter);
			}
			else {
				const nodeValue = getNodeValue(node, markdownFormatter, (node) => {
					if (node.type === "image") {
						if (!node.alt) {
							throw new Error(`Image missing alt attribute: '${node.url}'`);
						}
						body._metadata.images = body._metadata.images || [];
						body._metadata.images.push({
							alt: node.alt,
							src: node.url,
						});
					}
				}).trim();
				if (!this.ignoredValues.includes(nodeValue)) {
					children.push(nodeValue);
				}
			}

			let nextNode = nodes.children[index+1];
			if ((nextNode && nextNode.type === "heading") || index === nodes.children.length - 1)
			{
				// Use template-defined `id` if available, otherwise fall back to camelcase heading
				const key = inputMap[section.label] || camelcase(section.label);
				if (children.length > 0) {
					body[key] = children.join("\n\n");
				}

				if (index < nodes.children.length)
				{
					children = [];
					section = {};
				}
			}
		});

		return body;
	}
}

/**
 * Synthesize value of node and its children to a single string using formatter
 * @param {Object} node
 * @param {Function} formatter - ex., 'markdown'
 * @param {Function} callback - Receives `node` and `nodeValue` as parameters, useful for accessing information about child nodes.
 * @returns {string}
 */
const getNodeValue = (node, formatter, callback) =>
{
	const nodeValue = formatter(node, callback);
	if (callback) {
		callback(node, nodeValue);
	}

	if (node.value || node.type === "image") {
		return nodeValue;
	}

	if (node.children) {
		node.children.forEach( (child) => child.parent = node );
		return nodeValue;
	}
}

/**
 * @param {Object} node
 * @param {Function} callback
 * @returns {string}
 */
const markdownFormatter = (node, callback) => {
	const MAP = {
		blockquote: "> %v",
		code: "```\n%v\n```\n",
		emphasis: "_%v_",
		heading: "%d %v\n",
		image: "![%a](%u)",
		inlineCode: "`%v`",
		link: "[%v](%u)",
		list: "%v",
		listItem: "%i %v",
		paragraph: "%v\n",
		strong: "**%v**",
		text: "%v",
	};

	return MAP[node.type]
		.replace("%v", node.value ?
			node.value :
			node.children
				?.map((node) => getNodeValue(node, markdownFormatter, callback))
				.join(""),
		)
		.replace(/%d/g, "".padStart(node.depth, "#"))
		.replace(/%u/g, node.url)
		.replace(/%i/g, node.parent?.ordered ? "1." : "-")
		.replace(/%a/g, node.alt)
}

/**
 * @param {Object} node
 * @returns {string}
 */
const textFormatter = (node) => {
	return node.value ?
		node.value :
		node.children
			.map((node) => getNodeValue(node, textFormatter))
			.join("")
}
