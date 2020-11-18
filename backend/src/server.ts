import * as Koa from 'koa';
import * as websocketify from 'koa-websocket';

import * as path from 'path';
import * as mongoose from 'mongoose';
import { SettingsDao } from './daos/settings.dao';
import { SocketManager } from './socket.manager';
import { VERSION } from '@codelm/common/version';
import { objectFromEntries } from '@codelm/common/src/utils/submission.util';
import './daos/dao';
import apiRouter from './routes/route';
import { MyContext } from './typings';

export const DEBUG = process.argv.includes('--debug');

if (!DEBUG) {
  process.on('uncaughtException', (e: Error) => {
    console.error('uncaughtException:', e);
  });

  process.on('unhandledRejection', (reason: object) => {
    console.error('unhandledRejection:', reason);
  });
}

const app = websocketify(new Koa<MyContext>());

// app.use(
//   morgan('[:date[clf]] :method :url :status :response-time ms :remote-addr')
// );
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// if (process.env.NODE_ENV == 'development') {
//   app.use(express.static(path.join('.', 'dist', 'frontend')));
// } else {
//   app.use(
//     '/',
//     Router().get('/', (req, res) => res.redirect('/index.html'))
//   );
// }

console.log(
  `Starting CodeLM server build ${VERSION}${DEBUG ? ' in debug mode' : ''}`
);

mongoose.set('useFindAndModify', false);
mongoose
  .connect('mongodb://localhost/codelm', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
