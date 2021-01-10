import { Router } from 'express';
import adminRoute from './admin.route';
import alertRoute from './alert.route';
import authRoute from './auth.route';
import debugRoute from './debug.route';
import divisionRoute from './division.route';
import emailRoute from './email.route';
import groupRoute from './group.route';
import personRoute from './person.route';
import problemRoute from './problem.route';
import settingsRoute from './settings.route';
import socketsRoute from './sockets.route';
import submissionRoute from './submission.route';
import teamRoute from './team.route';

const router = Router();

router.use('/admins', adminRoute);
router.use('/alerts', alertRoute);
router.use('/auth', authRoute);
router.use('/debug', debugRoute);
router.use('/divisions', divisionRoute);
router.use('/email', emailRoute);
router.use('/groups', groupRoute);
router.use('/people', personRoute);
router.use('/problems', problemRoute);
router.use('/settings', settingsRoute);
router.use('/sockets', socketsRoute);
router.use('/submissions', submissionRoute);
router.use('/teams', teamRoute);

export default router;
