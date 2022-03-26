// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {createHash} from "node:crypto";
import path from "node:path";

import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {IssueParser} from "../../src/issue-parser.js";
import {writeData} from "../../src/write-data.js";

(async() => {
	try {
		/* Parse issue */
		const issue = github.context.payload.issue;

		const issueParser = new IssueParser();
		const bodyData = await issueParser.parseBody(issue.body, getInput("issue-template"));

		const link = {
			title: issue.title,
			createdAt: issue.created_at,
			...bodyData
		};

		/* Write to disk*/
		const date = new Date(issue['created_at']);
		const outputDir = path.join(
			getInput("folder"),
			date.getFullYear().toString(),
			(date.getMonth() + 1).toString().padStart(2, "0"),
		);

		const {hostname, pathname} = new URL(bodyData.url);

		let hash = createHash("sha256");
		hash.update(pathname);

		const filenameStem = hostname.replace('www.', '');
		let outputFilename = `${filenameStem}-${hash.digest("base64url").substr(0, 10)}.json`;

		writeData(outputDir, outputFilename, link);

		exportVariable("IssueNumber", issue.number);
	}
	catch (error) {
		console.log(error);
		setFailed(error.message);
	}
})();
