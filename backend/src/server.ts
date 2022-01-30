import * as express from 'express';
import { RequestHandler, Router } from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { SettingsDao } from './daos/settings.dao';
import { SocketManager } from './socket.manager';
import { VERSION } from '@codelm/common/version';
import { objectFromEntries } from '@codelm/common/src/utils/submission.util';
import './daos/dao';
import apiRoutes from './routes/route';
import * as fs from 'fs';

export const DEBUG = process.argv.includes('--debug');

if (!DEBUG) {
  process.on('uncaughtException', (e: Error) => {
    console.error('uncaughtException:', e);
  });

  process.on('unhandledRejection', (reason: object) => {
    console.error('unhandledRejection:', reason);
  });
}

export const JWT_PRIVATE_KEY = fs.readFileSync('jwt.key');

const app = express();
app.set('trust proxy', true);
app.set('json replacer', (key: string, value: any) => {
  // TODO: Ensure that this doesn't slow down `res#json` in the general case.
  if (key === 'rubric') {
    // `rubric` is stored as a Map in the database, but it must be converted to an Object for JSON.
    const rubric = value as Map<string, number>;
    return objectFromEntries(rubric);
  }

  return value;
});

const expressWs = require('express-ws')(app);

app.use(
  morgan('[:date[clf]] :method :url :status :response-time ms :remote-addr') as RequestHandler
);
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }) as RequestHandler); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '5mb' }) as RequestHandler); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json', limit: '5mb' }) as RequestHandler); // Parse application/vnd.api+json as json
app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'development') {
  app.use(
    '/',
    Router().get('/', (req, res) => res.redirect('/index.html'))
  );
}

console.log(
  `Starting CodeLM server build ${VERSION}${DEBUG ? ' in debug mode' : ''}`
);

// For some reason, using localhost instead of 127.0.0.1 doesn't work on my Mac.
mongoose
  .connect('mongodb://127.0.0.1/codelm')
  .then(() => {
    console.log('Connected to MongoDB');

    SettingsDao.getSettings().then(settings => {
      console.log(
        'Scheduled ' + SettingsDao.scheduleJobs(settings) + ' events'
      );

      SocketManager.init(app);
      console.log('Set up socket manager');

      app.listen(8080, () => {
        console.log('Listening on http://localhost:8080');
      });
    });
  })
  .catch(console.error);
