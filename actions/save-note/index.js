// Adapted from https://github.com/zachleat/github-issue-to-json-file/
import {createHash} from "node:crypto";
import path from "node:path";

import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {IssueParser} from "../../src/issue-parser.js";
import {readData} from "../../src/read-data.js";
import {writeData} from "../../src/write-data.js";

(async() => {
	try {
		/* Parse issue */
		const issue = github.context.payload.issue;

		const issueParser = new IssueParser();
		const bodyData = await issueParser.parseBody(issue.body, getInput("issue-template"));

		const note = {
			createdAt: issue.created_at,
			issue: issue.number,
			title: issue.title,
			...bodyData,
		};

		/* Write to disk */
		const date = new Date(issue["created_at"]);
		const outputDir = path.join(
			getInput("folder"),
			date.getFullYear().toString(),
			(date.getMonth() + 1).toString().padStart(2, "0"),
		);

		let hash = createHash("sha256");
		hash.update(issue["created_at"]);

		const filenameStem = date.getDate().toString().padStart(2, "0");
		let outputFilename = `${filenameStem}-${hash.digest("base64url").substr(0, 10)}.json`;

		writeData(outputDir, outputFilename, note);

		/* Update data index */
		const indexFilename = path.join( getInput("folder"), "index.json" );
		const indexData = await readData( indexFilename );

		indexData[issue.number] = path.join( outputDir, outputFilename );
		writeData( getInput("folder"), "index.json", indexData );

		exportVariable("IssueNumber", issue.number);
		exportVariable("IssueTitle", issue.title);
	}
	catch (error) {
		console.log(error);
		setFailed(error.message);
	}
})();
