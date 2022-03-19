module.exports = {
	"parserOptions": {
		"sourceType": "module",
	},
	"env": {
		"browser": true,
		"es2021": true,
		"node": true,
	},
	"extends": "eslint:recommended",
	"rules": {
		"indent": ["error", "tab"],
		"require-jsdoc": [
			"error",
			{
				"require": {"FunctionDeclaration": true},
			},
		],
		"camelcase": "warn",
		"object-curly-spacing": ["error", "never"],
		"arrow-parens": ["error", "always"],
		"comma-dangle": ["error", "always-multiline"],
		"quotes": ["error", "double"],
		"no-negated-condition": "warn",
		"new-cap": "warn",
		"no-invalid-this": "error",
		"max-len": [
			0,
			{
				"ignoreComments": true,
				"ignoreTrailingComments": true,
				"ignoreUrls": true,
				"ignoreStrings": true,
				"ignoreTemplateLiterals": true,
				"ignoreRegExpLiterals": true,
				"ignorePattern": true,
			},
		],
	},
};
