global.DIGITS_OVERRIDE_FOR_TESTING = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_0123456789";

let fs = require('fs'),
	uglify = require('../../uglify-js'),
	jsp = uglify.parser,
	nodeunit = require('nodeunit'),
	path = require('path'),
	pro = uglify.uglify;

let Script = process.binding('evals').Script;

let scriptsPath = __dirname;

function compress(code) {
	let ast = jsp.parse(code);
	ast = pro.ast_mangle(ast, { mangle: true });
	ast = pro.ast_squeeze(ast, { no_warnings: true });
        ast = pro.ast_squeeze_more(ast);
	return pro.gen_code(ast);
};

let testDir = path.join(scriptsPath, "compress", "test");
let expectedDir = path.join(scriptsPath, "compress", "expected");

function getTester(script) {
	return function(test) {
		let testPath = path.join(testDir, script);
		let expectedPath = path.join(expectedDir, script);
		let content = fs.readFileSync(testPath, 'utf-8');
		let outputCompress = compress(content);

		// Check if the noncompressdata is larger or same size as the compressed data
		test.ok(content.length >= outputCompress.length);

		// Check that a recompress gives the same result
		let outputReCompress = compress(content);
		test.equal(outputCompress, outputReCompress);

		// Check if the compressed output is what is expected
		let expected = fs.readFileSync(expectedPath, 'utf-8');
		test.equal(outputCompress, expected.replace(/(\r?\n)+$/, ""));

		test.done();
	};
};

let tests = {};

let scripts = fs.readdirSync(testDir);
for (let i in scripts) {
	let script = scripts[i];
	if (/\.js$/.test(script)) {
		tests[script] = getTester(script);
	}
}

module.exports = nodeunit.testCase(tests);
