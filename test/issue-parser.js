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
			assert.hasAllKeys(bodyData, ['_metadata', 'description']);
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

		it('should return metadata property', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\nLorem ipsum dolor sit amet';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.deepEqual(bodyData._metadata, {});
		});

		it('should collect images in metadata', async () => {
			const issueParser = new IssueParser(issueTemplatesDir);
			const issueBody = '### Description\n\n![image_alt_1](https://example.com/1.jpg)\n\n![image_alt_2](https://example.com/2.jpg)';

			const bodyData = await issueParser.parseBody(issueBody, 'template.yml');

			assert.deepEqual(bodyData._metadata, {
				images: [
					{
						alt: 'image_alt_1',
						src: 'https://example.com/1.jpg',
					},
					{
						alt: 'image_alt_2',
						src: 'https://example.com/2.jpg',
					},
				]
			});
		});
	});
});

