import * as Router from 'koa-router';

import adminRoute from './admin.route';
import alertRoute from './alert.route';
import debugRoute from './debug.route';
import divisionRoute from './division.route';
import emailRoute from './email.route';
import fileRoute from './file.route';
import groupRoute from './group.route';
import personRoute from './person.route';
import problemRoute from './problem.route';
import settingsRoute from './settings.route';
import socketsRoute from './sockets.route';
import submissionRoute from './submission.route';
import teamRoute from './team.route';

const router = new Router();

router.use('/admins', adminRoute.routes(), adminRoute.allowedMethods());
router.use('/alerts', alertRoute.routes(), alertRoute.allowedMethods());
router.use('/debug', debugRoute.routes(), debugRoute.allowedMethods());
router.use(
  '/divisions',
  divisionRoute.routes(),
  divisionRoute.allowedMethods()
);
router.use('/email', emailRoute.routes(), emailRoute.allowedMethods());
router.use('/files', fileRoute.routes(), fileRoute.allowedMethods());
router.use('/groups', groupRoute.routes(), groupRoute.allowedMethods());
router.use('/people', personRoute.routes(), personRoute.allowedMethods());
router.use('/problems', problemRoute.routes(), personRoute.allowedMethods());
router.use('/settings', settingsRoute.routes(), settingsRoute.allowedMethods());
router.use('/sockets', socketsRoute.routes(), socketsRoute.allowedMethods());
router.use(
  '/submissions',
  submissionRoute.routes(),
  submissionRoute.allowedMethods()
);
router.use('/teams', teamRoute.routes(), teamRoute.allowedMethods());

export default router;
