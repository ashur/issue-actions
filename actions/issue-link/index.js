// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {createHash} from "node:crypto";
import path from "node:path";

import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {parseIssueBody} from "../../src/parse-issue-body.js";
import {writeData} from "../../src/write-data.js";

(async() => {
	try {
		/* Parse issue */
		const issue = github.context.payload.issue;
		const issueData = await parseIssueBody(getInput("issue-template"), issue.body);
		const {hostname, pathname} = new URL(issueData.url);

		/* Write to disk*/
		const date = new Date(issue['created_at']);
		const outputDir = path.join(
			getInput("folder"),
			date.getFullYear().toString(),
			(date.getMonth() + 1).toString().padStart(2, "0"),
		);

		let hash = createHash("sha256");
		hash.update(pathname);

		let outputFilename = hostname;
		outputFilename += pathname.length > 1 ? `-${hash.digest("base64url").substr(0, 10)}` : '';
		outputFilename += ".json";

		writeData(outputDir, outputFilename, issueData);

		exportVariable("IssueNumber", issue.number);
	}
	catch (error) {
		console.log(error);
		setFailed(error.message);
	}
})();
