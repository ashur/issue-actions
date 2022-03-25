import fs from 'fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import {fromMarkdown} from 'mdast-util-from-markdown';

export class IssueParser
{
	/**
	 * @param {string} [issueTemplatesDir='./.github/ISSUE_TEMPLATE']
	 */
	constructor(issueTemplatesDir)
	{
		this.issueTemplatesDir = issueTemplatesDir || './.github/ISSUE_TEMPLATE';
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
		const inputMap = {};
		templateDefinition.body.forEach(input => {
			inputMap[input.attributes.label] = input.id;
		});

		// Parse body nodes
		const body = {};

		let children = [];
		let section = {};

		let nodes = fromMarkdown(issueBody);
		nodes.children.forEach((node, index) => {
			if (node.type === 'heading') {
				section.label = getNodeValue(node, textFormatter);
			}
			else {
				children.push(getNodeValue(node, markdownFormatter).trim());
			}

			let nextNode = nodes.children[index+1];
			if ((nextNode && nextNode.type === 'heading') || index === nodes.children.length - 1)
			{
				if (inputMap[section.label]) {
					body[inputMap[section.label]] = children.join("\n\n");
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
 * Convert node contents to string using formatter
 * @param {Object} node
 * @param {Function} formatter - ex., 'markdown'
 * @returns {string}
 */
const getNodeValue = (node, formatter) =>
{
	if (node.value) {
		return formatter(node);
	}

	if (node.children) {
		node.children.forEach( (child) => child.parent = node );
		return formatter(node);
	}
}

/**
 * @param {Object} node
 * @returns {string}
 */
const markdownFormatter = (node) => {
	const MAP = {
		blockquote: '> %v',
		code: '```\n%v\n```\n',
		emphasis: '_%v_',
		heading: '%d %v\n',
		inlineCode: '`%v`',
		link: '[%v](%u)',
		list: '%v',
		listItem: '%i %v',
		paragraph: '%v\n',
		strong: '**%v**',
		text: '%v',
	};

	return MAP[node.type]
		.replace('%v', node.value ?
			node.value :
			node.children
				.map(node => getNodeValue(node, markdownFormatter))
				.join('')
		)
		.replace(/\%d/g, ''.padStart(node.depth, '#'))
		.replace(/\%u/g, node.url)
		.replace(/\%i/g, node.parent?.ordered ? '1.' : '-' )
}

/**
 * @param {Object} node
 * @returns {string}
 */
const textFormatter = (node) => {
	return node.value ?
		node.value :
		node.children
			.map(node => getNodeValue(node, textFormatter))
			.join('')
}
