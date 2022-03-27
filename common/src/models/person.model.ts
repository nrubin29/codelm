import { GroupModel } from './group.model';
import { UserModel } from './user.model';

export enum PersonYear {
  Freshman = 'Freshman',
  Sophomore = 'Sophomore',
  Junior = 'Junior',
  Senior = 'Senior',
}

export enum PersonExperience {
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

export type BasicPersonModel = Omit<
  Exclude<PersonModel, null>,
  'photoRelease' | 'addressRelease' | 'salt'
>;

export interface PersonModel extends UserModel {
  name: string;
  email?: string;
  year?: PersonYear;
  experience: PersonExperience;
  group: GroupModel;
  teacherEmail?: string;
  photoRelease: boolean;
  addressRelease: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface AddOrUpdatePersonRequest {
  person: BasicPersonModel;
  autoCreateTeams: boolean;
  group?: string;
  groupName?: string;
}
