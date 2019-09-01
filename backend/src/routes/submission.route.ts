import { Router, Request, Response } from 'express';
import { sanitizeSubmission, SubmissionDao } from '../daos/submission.dao';
import { PermissionsUtil } from '../permissions.util';
import { SubmissionModel } from '../../../common/src/models/submission.model';

const router = Router();

router.get('/', PermissionsUtil.requireTeam, async (req: Request, res: Response) => {
  const submissions = await SubmissionDao.getSubmissionsForTeam(req.params.team._id);
  res.json(submissions.map(submission => sanitizeSubmission(submission)));
});

router.get('/grouped', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  const submissions = await SubmissionDao.getSubmissionsGrouped();
  res.json(submissions);
});

router.get('/team/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await SubmissionDao.getSubmissionsForTeam(req.params.id));
});

router.get('/disputes', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await SubmissionDao.getDisputedSubmissions());
});

router.get('/:id', PermissionsUtil.requireAuth, async (req: Request, res: Response) => {
  const submission = await SubmissionDao.getSubmission(req.params.id);

  if (req.params.team) {
    // The toString() calls are needed because both _ids are objects.
    if (submission.team._id.toString() === req.params.team._id.toString()) {
      res.json(sanitizeSubmission(submission));
    }

    else {
      res.sendStatus(403);
    }
  }

  else if (req.params.admin) {
    res.json(submission);
  }

  else {
    res.sendStatus(403);
  }
});

// TODO: Protect this route.
// router.get('/:id/file/:fileName', async (req: Request, res: Response) => {
//   const submission: SubmissionModel = await SubmissionDao.getSubmission(req.params.id);
//
//   if (isUploadSubmission(submission)) {
//     const file = submission.files.find(f => f.name === req.params.fileName);
//
//     if (file) {
//       // TODO: Set Content-Type appropriately (because Safari appends .txt, but at least Chrome works).
//       res.set({
//         'Content-Disposition': `attachment; filename="${file.name}"`,
//         'Content-Type': 'text/plain',
//         'Content-Length': file.contents.length
//       });
//
//       res.send(file.contents);
//     }
//
//     else {
//       res.sendStatus(403);
//     }
//   }
//
//   else {
//     res.sendStatus(403);
//   }
// });

router.put('/:id', PermissionsUtil.requireAuth, async (req: Request, res: Response) => {
  if (req.params.team) {
    const submission = await SubmissionDao.getSubmissionRaw(req.params.id);
    // Only allow teams to set the dispute message.
    submission.set('dispute.message', req.body.dispute.message);
    submission.set('dispute.open', true);

    res.json(sanitizeSubmission(await SubmissionDao.updateSubmission(req.params.id, submission as SubmissionModel)));
  }

  else if (req.params.admin) {
    res.json(await SubmissionDao.updateSubmission(req.params.id, req.body as SubmissionModel));
  }

  else {
    res.sendStatus(403);
  }
});

router.delete('/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  await SubmissionDao.deleteSubmission(req.params.id);
  res.json(true);
});

export default router;
