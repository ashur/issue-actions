// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {parseIssueBody} from "./parse-issue-body.js";
import {writeData} from "../../write-data.js";

try {
	/* Parse issue */
	const issue = github.context.payload.issue;
	const issueData = parseIssueBody(getInput("issue-template"), issue.body);
	const {hostname, pathname} = new URL(issueData);

	/* Write to disk*/
	const date = new Date(issue['created_date']);
	const outputDir = path.join(
		getInput("folder"),
		date.getFullYear().toString(),
		(date.getMonth() + 1).toString().padStart(2, "0"),
	);

	let outputFilename = hostname;
	outputFilename += pathname.length > 1 ? `-${pathname.replace(/\//g, "-")}` : '';
	outputFilename = outputFilename.replace(/\./g, "-");
	outputFilename += ".json";

	writeData(outputDir, outputFilename);

	exportVariable("IssueNumber", issue.number);
}
catch (error) {
	setFailed(error.message);
}
