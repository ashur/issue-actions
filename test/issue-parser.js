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

		it('should not include values whose heading is undefined', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\nLorem ipsum _dolor_ **sit amet**.\n\n### Added Later\n\nThis section was added manually.';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.hasAllKeys(bodyData, ['description']);
		});

		it('should not include empty sections', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### URL\n\n### Description\n\nLorem ipsum _dolor_ **sit amet**';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.doesNotHaveAnyKeys(bodyData, ['url']);
		});

		it('should not include "no response" values', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\n_No response_';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.doesNotHaveAnyKeys(bodyData, ['description']);
		});

		it('should support image markup', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Image\n\n![image_alt](https://user-images.githubusercontent.com/1234/5678-90abc-def.jpg)';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.isObject(bodyData);
			assert.hasAllKeys(bodyData, ['image']);
			assert.equal(bodyData.image, '![image_alt](https://user-images.githubusercontent.com/1234/5678-90abc-def.jpg)');
		});
	});
});

