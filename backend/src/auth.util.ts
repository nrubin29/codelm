import { NextFunction, Request, Response } from 'express';
import { TeamDao } from './daos/team.dao';
import { AdminDao } from './daos/admin.dao';
import { DEBUG, JWT_PRIVATE_KEY } from './server';
import { isTeamJwt, Jwt } from '../../common/src/models/auth.model';
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

  static async requestAuth(req: Request, res: Response, next: NextFunction) {
    let jwt: Jwt;

    try {
      jwt = await AuthUtil.verifyJwt(req);
    } catch (err) {
      next();
      return;
    }

    if (!jwt) {
      next();
      return;
    }

    if (isTeamJwt(jwt)) {
      const team = await TeamDao.getTeam(jwt.teamId);

      if (team) {
        req.params.team = team;
      }
    } else {
      const admin = await AdminDao.getAdmin(jwt.adminId);

      if (admin) {
        req.params.admin = admin;
      }
    }

    next();
  }

  static async requireAuth(req: Request, res: Response, next: NextFunction) {
    await AuthUtil.requestAuth(req, res, () => {
      if (!req.params.team && !req.params.admin) {
        next(new Error('Not authorized.'));
      } else {
        next();
      }
    });
  }

  static async requireTeam(req: Request, res: Response, next: NextFunction) {
    await AuthUtil.requestAuth(req, res, () => {
      if (!req.params.team) {
        next(new Error('Not authorized.'));
      } else {
        next();
      }
    });
  }

  static async requireAdmin(req: Request, res: Response, next: NextFunction) {
    await AuthUtil.requestAuth(req, res, () => {
      if (!req.params.admin) {
        next(new Error('Not authorized.'));
      } else {
        next();
      }
    });
  }

  static async requireSuperUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await AuthUtil.requireAdmin(req, res, err => {
      if (err) {
        next(err);
      }

      if (req.params.admin.superUser) {
        next();
      } else {
        next(new Error('Admin does not have superuser permissions.'));
      }
    });
  }

  static requireDebugMode(req: Request, res: Response, next: NextFunction) {
    if (DEBUG) {
      next();
    } else {
      next(new Error('Debug mode is disabled.'));
    }
  }
}
