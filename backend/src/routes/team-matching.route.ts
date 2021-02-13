import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { TeamDao } from '../daos/team.dao';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { PersonModel } from '@codelm/common/src/models/person.model';
import {
  TeamMatchingRequest,
  TeamMatchingResponse,
  TeamMatchingResult,
} from '@codelm/common/src/models/team-matching.model';

const router = Router();

router.get('/', AuthUtil.requireAuth, async (req: Request, res: Response) => {
  const person = req.params.person as PersonModel;
  const teams = await TeamDao.getTeamsForPerson(person._id.toString());
  res.json(teams.find(team => team.division.type === DivisionType.Competition));
});

router.post('/', AuthUtil.requireAuth, async (req: Request, res: Response) => {
  const person = req.params.person as PersonModel;
  const targetTeamId = (req.body as TeamMatchingRequest).targetTeamId;
  const targetTeam = await TeamDao.getTeam(targetTeamId);
  const currentTeam = (
    await TeamDao.getTeamsForPerson(person._id.toString())
  ).find(team => team.division.type === DivisionType.Competition);

  if (targetTeam) {
    if (targetTeam._id.toString() === currentTeam._id.toString()) {
      res.json({ result: TeamMatchingResult.SameTeam } as TeamMatchingResponse);
      return;
    } else if (targetTeam.division.experience !== person.experience) {
      res.json({
        result: TeamMatchingResult.WrongExperience,
      } as TeamMatchingResponse);
      return;
    } else if (targetTeam.members.length >= 3) {
      res.json({ result: TeamMatchingResult.TeamFull } as TeamMatchingResponse);
      return;
    }

    if (currentTeam.members.length === 1) {
      // The team will be empty so we delete it
      await TeamDao.deleteTeam(currentTeam._id);
    } else {
      // Remove this person from their current team
      currentTeam.members = currentTeam.members.filter(
        member => member._id.toString() !== person._id.toString()
      );
      await TeamDao.addOrUpdateTeam(currentTeam);
    }

    // Add this person to the new team
    targetTeam.members.push(person);
    const updatedTeam = await TeamDao.addOrUpdateTeam(targetTeam);

    res.json({
      result: TeamMatchingResult.Success,
      team: updatedTeam,
    } as TeamMatchingResponse);
  } else {
    res.json({
      result: TeamMatchingResult.InvalidTeam,
    } as TeamMatchingResponse);
  }
});

export default router;
