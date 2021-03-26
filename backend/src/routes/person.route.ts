import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { PersonDao, sanitizePerson } from '../daos/person.dao';
import { DivisionDao } from '../daos/division.dao';
import { TeamDao } from '../daos/team.dao';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { sendEmail } from '../email';
import { isUniquenessError } from '../daos/dao';
import { PersonModel } from '../../../common/src/models/person.model';
import { GroupDao } from '../daos/group.dao';

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
  let request = req.body as Omit<PersonModel, 'group'> & {
    group: string;
    groupName: string;
  };

  if (request.group === '-1') {
    if (request.groupName == null) {
      res.status(403).send('Please provide a school.');
      return;
    }

    const group = await GroupDao.addOrUpdateGroup({
      name: request.groupName,
      special: false,
    });
    request.group = group._id.toString();
  }

  let person: PersonModel;

  try {
    person = await PersonDao.addOrUpdatePerson((request as any) as PersonModel);
  } catch (err) {
    // TODO: Standardize, type, and properly handle errors.
    if (isUniquenessError(err)) {
      res
        .status(403)
        .send('This email address and/or username is already registered.');
      return;
    } else {
      throw err;
    }
  }

  // Create a practice team and a competition team for the new person.
  // TODO: If the person is being updated, we don't want to create new teams
  //  and stuff.
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
