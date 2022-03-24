import {IssueParser} from '../src/issue-parser.js';
import {assert} from 'chai';

describe('IssueParser', () =>
{
	const issueTemplatesDir = './test/fixtures/ISSUE_TEMPLATE';

	describe('.parseBody()', () =>
	{
		it('should return object', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### URL\n\nhttps://example.com\n\n### Description\n\n> This domain is for use in illustrative examples in documents.';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.equal(bodyData.url, 'https://example.com', 'url');
			assert.equal(bodyData.description, '> This domain is for use in illustrative examples in documents.', 'description');
		});

		it('should support multiple paragraphs in a section', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\nI have eaten\nthe plums\nthat were in\nthe icebox\n\nand which\nyou were probably\nsaving\nfor breakfast';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.equal(bodyData.description, 'I have eaten\nthe plums\nthat were in\nthe icebox\n\nand which\nyou were probably\nsaving\nfor breakfast', 'description');
		});

		it('should support formatted text', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\nLorem ipsum _dolor_ **sit amet**.';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.equal(bodyData.description, 'Lorem ipsum _dolor_ **sit amet**.', 'description');
		});
	});
});
