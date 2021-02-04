import * as pug from 'pug';
import * as fs from 'fs-extra';

function getData(template: string) {
  return JSON.parse(fs.readFileSync(`src/${template}.json`).toString());
}

function render(template: string, context?: object, output?: string) {
  fs.writeFile(
    `../dist/landing/${output ?? template}.html`,
    pug.renderFile(`templates/${template}.pug`, {
      pretty: true,
      ...context,
    })
  );
}

// Setup

if (!fs.existsSync('../dist/landing')) {
  fs.mkdirSync('../dist/landing');
}

// Copying static files

fs.copy('images', '../dist/landing/images');
fs.copy('static', '../dist/landing/static');

// FAQ

render('faq', getData('faq'));

// Past events

for (const yearData of getData('past-events').years) {
  render('past-event', yearData, yearData.year.toString());
}

// Staff

render('staff');

// Sponsor

render('sponsor');
