import { TeamModel } from '../models/team.model';
import { ProblemModel } from '../models/problem.model';
import { DivisionModel } from '../models/division.model';

export class ProblemUtil {
  static getProblemDivisionForTeam(problem: ProblemModel, team: TeamModel) {
    return problem.divisions.find(division => division.division._id.toString() === team.division._id.toString());
  }

  static getProblemDivisionForDivision(problem: ProblemModel, division: DivisionModel) {
    return problem.divisions.find(div => div.division._id.toString() === division._id.toString());
  }

  static getProblemNumberForTeam(problem: ProblemModel, team: TeamModel) {
    return ProblemUtil.getProblemDivisionForTeam(problem, team).problemNumber;
  }

  static getProblemNumberForDivision(problem: ProblemModel, division: DivisionModel) {
    return ProblemUtil.getProblemDivisionForDivision(problem, division).problemNumber;
  }

  static getPoints(problem: ProblemModel, team: TeamModel) {
    return ProblemUtil.getProblemDivisionForTeam(problem, team).points;
  }
}