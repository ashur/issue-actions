import {writeFile, mkdir} from "node:fs/promises";

/**
 * @param {string} outputDir
 * @param {string} outputFilename
 * @param {Object} data
 */
export async function writeData(outputDir, outputFilename, data) {
	await mkdir(outputDir, {recursive: true});
	await writeFile(path.join(outputDir, outputFilename), JSON.stringify(data, null, 2));
}
