import { NextFunction, Request, Response } from 'express';
import { TeamDao } from './daos/team.dao';
import { AdminDao } from './daos/admin.dao';
import { TeamModel } from '../../common/src/models/team.model';
import { SettingsDao } from './daos/settings.dao';
import { SettingsState } from '../../common/src/models/settings.model';
import { DivisionType } from '../../common/src/models/division.model';
import { DEBUG } from './server';
import { TeamUtil } from '../../common/src/utils/team.util';

export class PermissionsUtil {
  static async hasAccess(team: TeamModel): Promise<boolean> {
    const settings = await SettingsDao.getSettings();

    return (
      TeamUtil.isSpecial(team) ||
      settings.state === SettingsState.Debug ||
      ((settings.state === SettingsState.Graded ||
        settings.state === SettingsState.Upload) &&
        ((!settings.preliminaries &&
          team.division.type === DivisionType.Competition) ||
          (settings.preliminaries &&
            team.division.type === DivisionType.Preliminaries)))
    );
  }

  static async requireTeam(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      next(new Error('No Authorization header.'));
      return;
    }

    req.params.team = await TeamDao.getTeam(
      req.headers.authorization.split(' ')[1]
    );

    if (req.params.team) {
      next();
    } else {
      next(new Error('No team found for given authorization.'));
    }
  }

  static async requireAccess(req: Request, res: Response, next: NextFunction) {
    if (!req.params.team) {
      next(new Error('No team found. Did you forget to use requireTeam?'));
    } else {
      if (await PermissionsUtil.hasAccess(req.params.team)) {
        next();
      } else {
        next(new Error('Team does not have access.'));
      }
    }
  }

  static async requireAdmin(req: Request, res: Response, next: NextFunction) {
    await PermissionsUtil.requestAdmin(req, res, err => {
      if (err) {
        next(err);
      } else if (req.params.admin) {
        next();
      } else {
        next(new Error('No admin found for given authorization.'));
      }
    });
  }

  static async requestAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      next(new Error('No Authorization header.'));
      return;
    }

    const id = req.headers.authorization.split(' ')[1];

    if (id === 'undefined') {
      next();
      return;
    }

    const admin = await AdminDao.getAdmin(id);

    if (admin) {
      req.params.admin = admin;
    }

    next();
  }

  static async requireSuperUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await PermissionsUtil.requireAdmin(req, res, err => {
      if (err) {
        throw err;
      }

      if (req.params.admin.superUser) {
        next();
      } else {
        next(new Error('Admin does not have superuser permissions.'));
      }
    });
  }

  static async requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      next(new Error('No Authorization header.'));
      return;
    }

    const team = await TeamDao.getTeam(req.headers.authorization.split(' ')[1]);

    if (team) {
      req.params.team = team;
      next();
    } else {
      await PermissionsUtil.requestAdmin(req, res, () => {
        if (req.params.admin) {
          next();
        } else {
          next(new Error('No authentication.'));
        }
      });
    }
  }

  static requireDebugMode(req: Request, res: Response, next: NextFunction) {
    if (DEBUG) {
      next();
    } else {
      next(new Error('Debug mode is disabled.'));
    }
  }
}
