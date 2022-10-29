/**
 * @param {string} string
 * @return {string}
 */
export default (string) => {
	string = string.toLowerCase();
	string = string
		.replace(/[`~!@#$%^&*()-=[\]\\;',./_+{}|:"<>?]/g, "")
		.replace(/\s+/g, "-");

	return string;
};
