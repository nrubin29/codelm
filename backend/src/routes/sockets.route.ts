import { Request, Response, Router } from 'express';
import { PermissionsUtil } from '../permissions.util';
import {SocketManager} from "../socket.manager";
import {SocketList} from "../../../common/src/models/sockets.model";

const router = Router();

router.get('/', PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  const teamSockets = [];
  const adminSockets = [];

  SocketManager.instance.teamSockets.forEach((_, id) => teamSockets.push(id));
  SocketManager.instance.adminSockets.forEach((_, id) => adminSockets.push(id));

  res.json({teams: teamSockets, admins: adminSockets} as SocketList);
});

router.delete('/:id', PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  SocketManager.instance.kick(req.params.id);
  res.status(200);
});

export default router
