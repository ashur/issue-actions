import {readFile} from "node:fs/promises";
import path from "node:path";

/**
 * @param {string} inputFilename
 * @return {Promise<Object>}
 */
export async function readData(inputFilename) {
	try
	{
		const contents = await readFile(inputFilename);
		return JSON.parse(contents);
	}
	catch( error )
	{
		console.error( error );
		return {};
	}
}
