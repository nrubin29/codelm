import * as Router from 'koa-router';
import { SettingsDao } from '../daos/settings.dao';
import { DivisionDao } from '../daos/division.dao';

const router = new Router();

router.get('/startercode/:division', async ctx => {
  const settings = await SettingsDao.getSettings();
  const division = await DivisionDao.getDivision(ctx.params.division);
  const starterCode = division.starterCode.find(
    sc => sc.state === settings.state
  );

  if (starterCode) {
    ctx.redirect(`/files/startercode/${starterCode.file}.zip`);
  } else {
    ctx.status = 404;
  }
});

export default router;
