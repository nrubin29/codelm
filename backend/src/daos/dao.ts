import * as mongoose from 'mongoose';
import './admin.dao';
import './alert.dao';
import './division.dao';
import './group.dao';
import './person.dao';
import './problem.dao';
import './settings.dao';
import './submission.dao';
import './team.dao';

export type ModelDocument<T> = Omit<T, '_id'> & mongoose.Document;
