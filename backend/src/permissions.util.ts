import { TeamDao } from './daos/team.dao';
import { AdminDao } from './daos/admin.dao';
import { DEBUG } from './server';
import { MyContext } from './typings';

export class PermissionsUtil {
  static async requestAuth(ctx: MyContext) {
    if (!ctx.headers.authorization) {
      throw new Error('No Authorization header.');
    }

    const _id = ctx.headers.authorization.split(' ')[1];
    const team = await TeamDao.getTeam(_id);

    if (team) {
      ctx.state.team = team;
    } else {
      const admin = await AdminDao.getAdmin(_id);

      if (admin) {
        ctx.state.admin = admin;
      }
    }
  }

  static async requireAuth(ctx: MyContext) {
    await PermissionsUtil.requestAuth(ctx);

    if (!ctx.state.team && !ctx.state.admin) {
      throw new Error('No authorization.');
    }
  }

  static async requireTeam(ctx: MyContext) {
    await PermissionsUtil.requestAuth(ctx);

    if (!ctx.state.team) {
      throw new Error('No team.');
    }
  }

  static async requireAdmin(ctx: MyContext) {
    await PermissionsUtil.requestAuth(ctx);

    if (!ctx.state.admin) {
      throw new Error('No admin.');
    }
  }

  static async requireSuperUser(ctx: MyContext) {
    await PermissionsUtil.requireAdmin(ctx);

    if (!ctx.state.admin.superUser) {
      throw new Error('Admin does not have superuser permissions.');
    }
  }

  static requireDebugMode(ctx: MyContext) {
    if (!DEBUG) {
      throw new Error('Debug mode is disabled.');
    }
  }
}
