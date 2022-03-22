/* eslint-disable require-jsdoc */
// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {readFile} from "node:fs/promises";

import yaml from "js-yaml";

function removeNewLines(str) {
	return str.replace(/[\r\n]*/g, "");
}
function normalizeNewLines(str) {
	return str.replace(/\r\n/g, "\n");
}

/**
 * @param {string} issueTemplateName
 * @param {string} issueBody
 * @returns {Object}
 */
export async function parseIssueBody(issueTemplateName, issueBody) {
	const issueTemplatePath = path.join("./.github/ISSUE_TEMPLATE/", issueTemplateName);
	const issueTemplate = await readFile(issueTemplatePath, "utf8");
	const githubFormData = yaml.load(issueTemplate);

	// Markdown fields aren’t included in output body
	let fields = githubFormData.body.filter((field) => field.type !== "markdown");

	// Warning: this will likely not handle new lines in a textarea field input
	let bodyData = normalizeNewLines(issueBody).split("\n").filter((entry) => {
		return !!entry && !entry.startsWith("###")
	}).map((entry) => {
		entry = entry.trim();

		return entry === "_No response_" ? "" : entry;
	});

	let returnObject = {};
	for(let j = 0, k = bodyData.length; j<k; j++) {
		if(!fields[j]) {
			continue;
		}

		let entry = bodyData[j];
		let fieldLabel = fields[j] && fields[j].attributes && fields[j].attributes.label;

		if(fieldLabel && fieldLabel.toLowerCase() === "url" || fields[j].id === "url" || fields[j].id.endsWith("_url") || fields[j].id.startsWith("url_")) {
			entry = removeNewLines(entry);
		}

		// Only supports a single checkbox (for now)
		if(fields[j].type === "checkboxes") {
			entry = removeNewLines(entry);
			// Convert to Boolean
			entry = entry.startsWith("- [X]");
		}

		returnObject[fields[j].id] = entry;
	}

	return returnObject;
}
