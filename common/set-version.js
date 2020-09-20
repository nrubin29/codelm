const format = require('date-fns/format');
const fs = require('fs');
const path = require('path');

const now = new Date();
const version = format(now, 'MM/dd/yyyy hh:mm:ss a');
const year = now.getMonth() > 4 ? now.getFullYear() + 1 : now.getFullYear();

fs.writeFileSync(
  path.resolve(__dirname, 'version.ts'),
  `export const VERSION = '${version}';\nexport const YEAR = ${year};`
);

console.log(`Building CodeLM Platform (build ${version})`);
