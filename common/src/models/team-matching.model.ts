import { TeamModel } from './team.model';

export const enum TeamMatchingResult {
  Success = 'Your team has been successfully updated!',
  InvalidTeam = 'Invalid team code.',
  TeamFull = "The team you're attempting to join is full. Teams can only have up to three members.",
  SameTeam = "You're already on this team!",
  WrongExperience = "The team you're attempting to join is in the wrong division.",
}

export interface TeamMatchingRequest {
  targetTeamId: string;
}

export interface TeamMatchingResponse {
  result: TeamMatchingResult;
  team?: TeamModel;
}
