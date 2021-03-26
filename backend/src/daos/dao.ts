import './admin.dao';
import './alert.dao';
import './division.dao';
import './group.dao';
import './person.dao';
import './problem.dao';
import './settings.dao';
import './submission.dao';
import './team.dao';

/**
 * Returns true if the error is due to a uniqueness constraint being violated.
 */
export function isUniquenessError(err: any) {
  return err.code !== undefined && err.code === 11000;
}
