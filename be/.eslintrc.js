module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"project": "tsconfig.json",
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		"@typescript-eslint/await-thenable": "error",
		"@typescript-eslint/dot-notation": "off",
		"@typescript-eslint/indent": "off",
		"@typescript-eslint/member-delimiter-style": [
			"error",
			{
				"multiline": {
					"delimiter": "semi",
					"requireLast": true
				},
				"singleline": {
					"delimiter": "semi",
					"requireLast": false
				}
			}
		],
		"@typescript-eslint/member-ordering": "off",
		"@typescript-eslint/naming-convention": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-empty-interface": "off",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-unused-expressions": [
			"off",
			{
				"allowShortCircuit": true
			}
		],
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/quotes": [
			"error",
			"single",
			{
				"avoidEscape": true
			}
		],
		"@typescript-eslint/semi": [
			"error",
			"always"
		],
		"@typescript-eslint/type-annotation-spacing": "error",
		"@typescript-eslint/no-shadow": ["error"],
		"brace-style": [
			"off",
			"1tbs"
		],
		"comma-dangle": [
			"off",
			"always-multiline"
		],
		"eqeqeq": [
			"error",
			"smart"
		],
		"id-blacklist": [
			"off",
			"any",
			"Number",
			"number",
			"String",
			"string",
			"Boolean",
			"boolean",
			"Undefined",
			"undefined"
		],
		"id-match": "off",
		// At this moment, mosts are off to support import legacy typescript modules
		"import/no-deprecated": "off",
		"import/order": "off",
		"jsdoc/check-alignment": "off",
		"jsdoc/check-indentation": "off",
		"jsdoc/newline-after-description": "off",
		"jsdoc/no-types": "off",
		"max-len": [
			"error",
			{
				"ignorePattern": "//",
				"code": 120
			}
		],
		"no-console": [
			"off",
			{
				"allow": [
					"log",
					"warn",
					"dir",
					"timeLog",
					"assert",
					"clear",
					"count",
					"countReset",
					"group",
					"groupEnd",
					"table",
					"debug",
					"info",
					"dirxml",
					"error",
					"groupCollapsed",
					"Console",
					"profile",
					"profileEnd",
					"timeStamp",
					"context"
				]
			}
		],
		"no-empty": "off",
		"no-fallthrough": "error",
		"no-return-await": "error",
		// no-shadow gives false-positive error for all enum at typescript.
		"no-shadow": "off",
		/* "no-shadow": [
			"error",
			{
				"hoist": "all"
			}
		], */
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-underscore-dangle": "off",
		"no-var": "error",
		"prefer-arrow/prefer-arrow-functions": "off",
		"prefer-const": "error",
		"spaced-comment": [
			"off",
			"always",
			{
				"markers": [
					"/"
				]
			}
		]
	}
};
