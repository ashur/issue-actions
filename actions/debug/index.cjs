const fs = require("fs");
const path = require("path");

let directoryPaths = [
	path.join(__dirname, '../../'),
	path.join(__dirname, '../'),
	path.join(__dirname, './'),
];

directoryPaths.forEach( directoryPath => lsDir(directoryPath) );

function lsDir(directoryPath) {
	fs.readdir(directoryPath, function (err, files) {
		console.log(directoryPath);

		if (err) {
			return console.log('Unable to scan directory: ' + err);
		}

		files.forEach(function (file) {
			console.log(` - ${file}`);
		});
	});
}

