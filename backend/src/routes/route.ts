import { Router } from 'express';
import adminRoute from './admin.route';
import alertRoute from './alert.route';
import debugRoute from './debug.route';
import divisionRoute from './division.route';
import fileRoute from './file.route';
import problemRoute from './problem.route';
import settingsRoute from './settings.route';
import socketsRoute from './sockets.route';
import submissionRoute from './submission.route';
import teamRoute from './team.route';

const router = Router();

router.use('/admins', adminRoute);
router.use('/alerts', alertRoute);
router.use('/debug', debugRoute);
router.use('/divisions', divisionRoute);
router.use('/files', fileRoute);
router.use('/problems', problemRoute);
router.use('/settings', settingsRoute);
router.use('/sockets', socketsRoute);
router.use('/submissions', submissionRoute);
router.use('/teams', teamRoute);

export default router;
