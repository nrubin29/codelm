import express = require('express');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import path = require('path');
import fileUpload = require('express-fileupload');
import mongoose = require('mongoose');
import { SettingsDao } from './daos/settings.dao';
import { SocketManager } from './socket.manager';
import { VERSION } from '../../common/version';
import './daos/dao';
import apiRoutes from './routes/route';

process.on('uncaughtException', (e: Error) => {
  console.error(e);
});

process.on('unhandledRejection', (reason: object) => {
  console.error(reason);
});

const app = express();
app.set('trust proxy', true);
const expressWs = require('express-ws')(app);

app.use(morgan('[:date[clf]] :method :url :status :response-time ms :remote-addr'));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '5mb'})); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json', limit: '5mb'})); // Parse application/vnd.api+json as json
app.use(fileUpload());
app.use(express.static(path.join('.', 'dist', 'frontend')));
app.use('/api', apiRoutes);

console.log(`Starting CodeLM server build ${VERSION}`);

mongoose.connect('mongodb://localhost/codelm', {useNewUrlParser: true}).then(() => {
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
