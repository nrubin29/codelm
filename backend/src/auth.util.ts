import { NextFunction, Request, Response } from 'express';
import { TeamDao } from './daos/team.dao';
import { AdminDao } from './daos/admin.dao';
import { DEBUG, JWT_PRIVATE_KEY } from './server';
import { isAdminJwt, isTeamJwt, Jwt } from '../../common/src/models/auth.model';
import * as jwt from 'jsonwebtoken';

export class AuthUtil {
  private static verifyJwt(req: Request): Promise<Jwt> {
    return new Promise<Jwt>((resolve, reject) => {
      jwt.verify(
        req.headers.authorization.split(' ')[1],
        JWT_PRIVATE_KEY,
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as Jwt);
          }
        }
      );
    });
  }

  static async requireTeam(req: Request, res: Response, next: NextFunction) {
    const jwt = await AuthUtil.verifyJwt(req);

    if (!jwt || !isTeamJwt(jwt)) {
      next(new Error('Not authorized.'));
      return;
    }

    req.params.team = await TeamDao.getTeam(jwt.teamId);

    if (req.params.team) {
      next();
    } else {
      next(new Error('No team found for given authorization.'));
    }
  }

  static async requireAdmin(req: Request, res: Response, next: NextFunction) {
    await AuthUtil.requestAdmin(req, res, err => {
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
    const jwt = await AuthUtil.verifyJwt(req);

    if (!jwt || !isAdminJwt(jwt)) {
      next(new Error('Not authorized.'));
      return;
    }

    const admin = await AdminDao.getAdmin(jwt.adminId);

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
    await AuthUtil.requireAdmin(req, res, err => {
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
    const jwt = await AuthUtil.verifyJwt(req);

    if (!jwt) {
      next(new Error('Not authorized.'));
      return;
    }

    if (isTeamJwt(jwt)) {
      const team = TeamDao.getTeam(jwt.teamId);

      if (team) {
        req.params.team = team;
        next();
        return;
      }
    } else {
      const admin = AdminDao.getAdmin(jwt.adminId);

      if (admin) {
        req.params.admin = admin;
        next();
        return;
      }
    }

    next(new Error('No authentication.'));
  }

  static requireDebugMode(req: Request, res: Response, next: NextFunction) {
    if (DEBUG) {
      next();
    } else {
      next(new Error('Debug mode is disabled.'));
    }
  }
}
