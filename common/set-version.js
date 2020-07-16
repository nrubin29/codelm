const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

const now = moment();

const version = now.format('MM/DD/YYYY hh:mm:ss a');
const year = now.month() > 5 ? now.year() + 1 : now.year();

fs.writeFileSync(
  path.resolve(__dirname, 'version.ts'),
  `export const VERSION = '${version}';\nexport const YEAR = ${year};`
);

console.log('Building CodeLM Platform (build ' + version + ')');
