import express = require('express');
import {Router} from 'express';
import morgan = require('morgan');
import bodyParser = require('body-parser');
import path = require('path');
import fileUpload = require('express-fileupload');
import mongoose = require('mongoose');
import { SettingsDao } from './daos/settings.dao';
import { SocketManager } from './socket.manager';
import { VERSION } from '../../common/version';
import {objectFromEntries} from "../../common/src/utils/submission.util";
import './daos/dao';
import apiRoutes from './routes/route';

export const DEBUG = process.argv.includes('--debug');

process.on('uncaughtException', (e: Error) => {
  console.error('uncaughtException:', e);
});

process.on('unhandledRejection', (reason: object) => {
  console.error('unhandledRejection:', reason);
});

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

app.use(morgan('[:date[clf]] :method :url :status :response-time ms :remote-addr'));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '5mb'})); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json', limit: '5mb'})); // Parse application/vnd.api+json as json
app.use(fileUpload({createParentPath: true}));
app.use('/api', apiRoutes);

if (process.env.NODE_ENV == 'development') {
  app.use(express.static(path.join('.', 'dist', 'frontend')));
}

else {
  app.use('/', Router().get('/', (req, res) => res.redirect('/index.html')));
}

console.log(`Starting CodeLM server build ${VERSION}${DEBUG ? ' in debug mode' : ''}`);

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/codelm', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
  console.log('Connected to MongoDB');

  SettingsDao.getSettings().then(settings => {
    console.log('Scheduled ' + SettingsDao.scheduleJobs(settings) + ' events');

    SocketManager.init(app);
    console.log('Set up socket manager');

    app.listen(8080, () => {
      console.log('Listening on http://localhost:8080');
    });
  });
}).catch(console.error);
