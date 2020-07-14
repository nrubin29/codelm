import {GroupModel} from './group.model';

export enum PersonYear {
    Freshman = 'Freshman',
    Sophomore = 'Sophomore',
    Junior = 'Junior',
    Senior = 'Senior'
}

export enum PersonExperience {
    Intermediate = 'Intermediate',
    Advanced = 'Advanced',
    Expert = 'Expert'
}

export interface PersonModel {
    _id?: string;
    name: string;
    email: string;
    year: PersonYear;
    experience: PersonExperience;
    group: GroupModel;
}
