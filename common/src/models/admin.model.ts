import { UserModel } from './user.model';

export interface AdminModel extends UserModel {
  name: string;
  superUser: boolean;
}