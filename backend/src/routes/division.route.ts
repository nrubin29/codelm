import { Request, Response, Router } from 'express';
import { DivisionDao } from '../daos/division.dao';
import { DivisionModel, DivisionType } from '../../../common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';
import { FileArray, UploadedFile } from 'express-fileupload';
import {SettingsState} from "../../../common/src/models/settings.model";

const router = Router();

router.get('/', PermissionsUtil.requestAdmin, async (req: Request, res: Response) => {
  let divisions: DivisionModel[];

  if (req.params.admin) {
    divisions = await DivisionDao.getDivisions();
    // TODO: Only send the starterCode field when necessary.
  }

  else {
    divisions = await DivisionDao.getDivisionsOfType(DivisionType.Preliminaries);
    divisions.forEach(division => delete division.starterCode);
  }
  res.json(divisions);
});

router.put('/', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request & {files?: FileArray}, res: Response) => {
  const division: DivisionModel & {'states[]': string[]} = req.body;

  if (!division['states[]']) {
    division['states[]'] = [];
  }

  if (typeof division['states[]'] as any === 'string') {
    division['states[]'] = [division['states[]'] as any];
  }

  if (!division.starterCode) {
    division.starterCode = [];
  }

  if (!req.files) {
    req.files = {};
  }

  for (let state of Object.keys(req.files)) {
    division.starterCode.push({state: SettingsState[state], file: (req.files[state] as UploadedFile).data});
  }

  if (division._id) {
    const oldDivision = await DivisionDao.getDivision(division._id);

    // We want to keep all previously uploaded files that...
    division.starterCode = division.starterCode.concat(oldDivision.starterCode.filter(oldSC =>
      !Object.keys(req.files).includes(oldSC.state.toString()) && // we aren't trying to overwrite, and
      division['states[]'].includes(oldSC.state.toString()) // we aren't trying to delete.
    ));
  }

  delete division['states[]'];

  const updatedDivision = await DivisionDao.addOrUpdateDivision(division);
  res.json(updatedDivision);
});

router.delete('/:id', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  await DivisionDao.deleteDivision(req.params.id);
  res.json(true);
});

export default router
