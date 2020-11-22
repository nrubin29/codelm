export interface LoginRequest {
  username: string;
  password: string;
  version: string;
}

export interface LoginResponse {
  response: LoginResponseType;
  jwt?: string;
}

export interface TeamJwt {
  personId: string;
  teamId: string;
}

export interface AdminJwt {
  adminId: string;
}

export type Jwt = TeamJwt | AdminJwt;

export function isTeamJwt(jwt: Jwt): jwt is TeamJwt {
  return (
    (jwt as TeamJwt).personId !== undefined &&
    (jwt as TeamJwt).teamId !== undefined
  );
}

export function isAdminJwt(jwt: Jwt): jwt is AdminJwt {
  return (jwt as AdminJwt).adminId !== undefined;
}

export const enum LoginResponseType {
  SuccessTeam = 'Success Team',
  SuccessAdmin = 'Success Admin',
  IncorrectPassword = 'Incorrect Password',
  NotFound = 'Account not found',
  SpecialPersonError = 'A person in a special group must have exactly one associated team',
  NoTeam = 'You cannot log in at this time',
  Closed = 'The dashboard is currently closed',
  AlreadyConnected = 'This account is already logged in',
  OutdatedClient = 'Please refresh the page. If this error persists, clear your browser cache',
  Error = 'An internal error occurred',
}
