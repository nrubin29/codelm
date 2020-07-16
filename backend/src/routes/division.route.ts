import { Request, Response, Router } from 'express';
import { DivisionDao } from '../daos/division.dao';
import {
  DivisionModel,
  DivisionType,
} from '../../../common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';
import { FileArray, UploadedFile } from 'express-fileupload';
import { SettingsState } from '../../../common/src/models/settings.model';
import { SettingsDao } from '../daos/settings.dao';
import * as shortid from 'shortid';
import * as fs from 'fs-extra';

const router = Router();

router.get(
  '/',
  PermissionsUtil.requestAdmin,
  async (req: Request, res: Response) => {
    let divisions: DivisionModel[];

    if (req.params.admin) {
      divisions = await DivisionDao.getAll();
      // TODO: Only send the starterCode field when necessary.
    } else {
      const settings = await SettingsDao.getSettings();

      if (settings.preliminaries) {
        divisions = await DivisionDao.getAllByField(
          'type',
          DivisionType.Preliminaries
        );
      } else {
        divisions = await DivisionDao.getAllByField(
          'type',
          DivisionType.Competition
        );
      }

      divisions.forEach(division => {
        delete division.starterCode;
      });
    }
    res.json(divisions);
  }
);

router.put(
  '/',
  PermissionsUtil.requireSuperUser,
  async (req: Request & { files?: FileArray }, res: Response) => {
    const division: DivisionModel & { states: string[] } = req.body;

    if (!division.states) {
      division.states = [];
    }

    if ((typeof division.states as any) === 'string') {
      division.states = [division.states as any];
    }

    if (!division.starterCode) {
      division.starterCode = [];
    }

    if (!req.files) {
      req.files = {};
    }

    for (let state of Object.keys(req.files)) {
      const file = shortid();
      await (req.files[state] as UploadedFile).mv(
        `files/startercode/${file}.zip`
      );
      division.starterCode.push({ state: SettingsState[state], file });
    }

    if (division._id) {
      const oldDivision = await DivisionDao.getById(division._id);

      // We need to delete any files that...
      for (const sc of oldDivision.starterCode.filter(
        sc =>
          Object.keys(req.files).includes(sc.state) || // we are trying to overwrite, or
          !division.states.includes(sc.state) // we are trying to delete.
      )) {
        await fs.unlink(`files/startercode/${sc.file}.zip`);
      }

      // We want to keep all previously uploaded files that...
      division.starterCode = division.starterCode.concat(
        oldDivision.starterCode.filter(
          oldSC =>
            !Object.keys(req.files).includes(oldSC.state.toString()) && // we aren't trying to overwrite, and
            division.states.includes(oldSC.state.toString()) // we aren't trying to delete.
        )
      );
    }

    delete division.states;

    const updatedDivision = await DivisionDao.addOrUpdate(division);
    res.json(updatedDivision);
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await DivisionDao.deleteById(req.params.id);
    res.json(true);
  }
);

export default router;
