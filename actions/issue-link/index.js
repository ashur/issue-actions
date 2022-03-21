/* eslint-disable require-jsdoc, camelcase */
// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {writeFile, mkdir} from "node:fs/promises";
import path from "node:path";

import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {parseIssueBody} from "./parse-issue-body.js";

function getFileName(url) {
	const {hostname, pathname} = new URL(url);

	let filename = hostname;
	filename += pathname.length > 1 ? `-${pathname.replace(/\//g, "-")}` : '';
	filename = filename.replace(/\./g, "-");
	filename += ".json";

	return filename;
}

export async function issueToJson() {
	try {
		if (!github.context.payload.issue) {
			setFailed("Cannot find GitHub issue");
			return;
		}

		/* Parse issue */
		let {title, number, body} = github.context.payload.issue;

		if (!title || !body) {
			throw new Error("Unable to parse GitHub issue.");
		}

		let issueTemplatePath = path.join("./.github/ISSUE_TEMPLATE/", getInput("issue-template"));
		let issueData = await parseIssueBody(issueTemplatePath, body);
		issueData.title = title;

		exportVariable("IssueNumber", number);

		/* Write to disk */
		const date = new Date();
		const outputDir = path.join(
			getInput("folder"),
			date.getFullYear().toString(),
			(date.getMonth() + 1).toString().padStart(2, "0"),
		);

		await mkdir(outputDir, {recursive: true});

		let fileName = getFileName(issueData.url);
		await writeFile(path.join(outputDir, fileName), JSON.stringify(issueData, null, 2));
	}
	catch (error) {
		setFailed(error.message);
	}
}

export default issueToJson();
