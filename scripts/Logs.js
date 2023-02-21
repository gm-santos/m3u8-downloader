const fs = require('node:fs');
const { Console } = require('node:console');

const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
const logger = new Console(output, errorOutput);

module.exports = logger;