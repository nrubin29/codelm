import { NextFunction, Request, Response } from 'express';
import { TeamDao } from './daos/team.dao';
import { AdminDao } from './daos/admin.dao';
import { DEBUG } from './server';

export class PermissionsUtil {
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
