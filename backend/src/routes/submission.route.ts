import * as Router from 'koa-router';
import { sanitizeSubmission, SubmissionDao } from '../daos/submission.dao';
import { PermissionsUtil } from '../permissions.util';
import { SubmissionModel } from '@codelm/common/src/models/submission.model';
import * as koaBody from 'koa-body';

const router = new Router();

router.get('/', PermissionsUtil.requireTeam, async ctx => {
  const submissions = await SubmissionDao.getSubmissionsForTeam(
    ctx.params.team._id
  );
  ctx.body = submissions.map(submission => sanitizeSubmission(submission));
});

router.get('/overview/:divisionId', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await SubmissionDao.getSubmissionOverview(ctx.params.divisionId);
});

router.get('/team/:id', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await SubmissionDao.getSubmissionsForTeam(ctx.params.id);
});

router.get(
  '/problem/:problemId/team/:teamId',
  PermissionsUtil.requireAdmin,
  async ctx => {
    ctx.body = await SubmissionDao.getSubmissionsForTeamAndProblem(
      ctx.params.teamId,
      ctx.params.problemId
    );
  }
);

router.get('/disputes', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await SubmissionDao.getDisputedSubmissions();
});

router.get('/:id', PermissionsUtil.requireAuth, async ctx => {
  const submission = await SubmissionDao.getSubmission(ctx.params.id);

  if (ctx.state.team) {
    // The toString() calls are needed because both _ids are objects.
    if (submission.team._id.toString() === ctx.state.team._id.toString()) {
      ctx.body = sanitizeSubmission(submission);
    } else {
      ctx.status = 403;
    }
  } else {
    ctx.body = submission;
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

router.put('/:id', PermissionsUtil.requireAuth, koaBody(), async ctx => {
  if (ctx.state.team) {
    const submission = await SubmissionDao.getSubmissionRaw(ctx.params.id);
    // Only allow teams to set the dispute message.
    submission.set('dispute.message', ctx.request.body.dispute.message);
    submission.set('dispute.open', true);

    ctx.body = sanitizeSubmission(
      await SubmissionDao.updateSubmission(
        ctx.params.id,
        submission as SubmissionModel
      )
    );
  } else {
    ctx.body = await SubmissionDao.updateSubmission(
      ctx.params.id,
      ctx.request.body as SubmissionModel
    );
  }
});

router.delete('/:id', PermissionsUtil.requireAdmin, async ctx => {
  await SubmissionDao.deleteSubmission(ctx.params.id);
  ctx.body = true;
});

export default router;
