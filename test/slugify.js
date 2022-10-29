/* global describe, it */
import slugify from "../src/slugify.js"
import {assert} from "chai";

describe( "slugify()", () =>
{
	it( "should replace all spaces with delimiter", () =>
	{
		assert.equal( slugify("hello world"), "hello-world" );
	});

	it( "should replace multiple consecutive space characters with a single delimiter", () =>
	{
		assert.equal( slugify("hello      world"), "hello-world" );
	});

	it( "should lowercase all letters", () =>
	{
		assert.equal( slugify("Hello World"), "hello-world" );
	});

	it( "should remove all non-alphanumeric characters", () =>
	{
		assert.equal( slugify("Hello `~!@#$%^&*()-=[]\\;',./_+{}|:\"<>?) world"), "hello-world" );
	});
});
