import { Router } from 'express';
import settingsRoute from './settings.route';
import divisionRoute from './division.route';
import fileRoute from './file.route';
import problemRoute from './problem.route';
import teamRoute from './team.route';
import adminRoute from './admin.route';
import submissionRoute from './submission.route';
import socketsRoute from './sockets.route';
import debugRoute from './debug.route';

const router = Router();

router.use('/settings', settingsRoute);
router.use('/divisions', divisionRoute);
router.use('/files', fileRoute);
router.use('/problems', problemRoute);
router.use('/teams', teamRoute);
router.use('/admins', adminRoute);
router.use('/submissions', submissionRoute);
router.use('/sockets', socketsRoute);
router.use('/debug', debugRoute);

export default router;
