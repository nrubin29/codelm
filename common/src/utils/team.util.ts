import { TeamModel } from '../models/team.model';
import { DivisionType } from '../models/division.model';

export class TeamUtil {
  static isSpecial(team: TeamModel) {
    return (
      team.division.type === DivisionType.Special ||
      team.members.some(member => member.group.special)
    );
  }
}
