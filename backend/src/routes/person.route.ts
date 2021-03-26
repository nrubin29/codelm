import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { PersonDao, sanitizePerson } from '../daos/person.dao';
import { DivisionDao } from '../daos/division.dao';
import { TeamDao } from '../daos/team.dao';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { sendEmail } from '../email';

const router = Router();

router.get('/', AuthUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await PersonDao.getPeople());
});

router.get(
  '/group/:groupId',
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await PersonDao.getPeopleForGroup(req.params.groupId));
  }
);

router.put('/', async (req: Request, res: Response) => {
  // TODO: If the person is being updated, we don't want to create new teams
  //  and stuff.
  try {
    const person = await PersonDao.addOrUpdatePerson(req.body);

    // Create a practice team and a competition team for the new person.
    const divisions = await DivisionDao.getDivisionsByExperience(
      person.experience
    );

    await Promise.all([
      TeamDao.addOrUpdateTeam({
        members: [person],
        division: divisions.find(
          division => division.type === DivisionType.Practice
        ),
      }),
      TeamDao.addOrUpdateTeam({
        members: [person],
        division: divisions.find(
          division => division.type === DivisionType.Competition
        ),
      }),
    ]);

    await sendEmail([person], 'registered');

    res.json(sanitizePerson(person));
  } catch {
    // TODO: Standardize, type, and properly handle errors.
    res
      .status(403)
      .send('This email address and/or username is already registered.');
  }
});

router.delete(
  '/:id',
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await PersonDao.deletePerson(req.params.id);
    res.json(true);
  }
);

export default router;
