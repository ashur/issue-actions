import {unlink} from "node:fs/promises";
import path from "node:path";

import {getInput, exportVariable, setFailed} from "@actions/core";
import * as github from "@actions/github";

import {readData} from "../../src/read-data.js";
import {writeData} from "../../src/write-data.js";

(async() => {
	try {
		const issue = github.context.payload.issue;

		const indexFilename = path.join( getInput("folder"), "index.json" );
		const indexData = await readData( indexFilename );

		/* Delete data file */
		const dataFilename = indexData[issue.number];
		unlink( dataFilename );

		/* Update data index */
		delete indexData[issue.number];
		writeData( getInput("folder"), "index.json", indexData );

		exportVariable( "IssueNumber", issue.number );
		exportVariable( "IssueTitle", issue.title );
	}
	catch( error )
	{
		console.log( error );
		setFailed( error.message );
	}
})();
