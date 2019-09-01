const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

const version = moment().format('MM/DD/YYYY hh:mm:ss a');

fs.writeFileSync(path.resolve(__dirname, 'version.ts'), `export const VERSION = '${version}';`);

console.log('Building CodeLM Platform (build ' + version + ')');