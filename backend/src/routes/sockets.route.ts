import { Request, Response, Router } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { SocketManager } from '../socket.manager';
import { SocketConnection } from '../../../common/src/models/sockets.model';

const router = Router();

router.get(
  '/:type',
  PermissionsUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    const sockets: SocketConnection[] = [];

    if (req.params.type === 'teams') {
      SocketManager.instance.teamSockets.forEach((_, _id) =>
        sockets.push({ _id })
      );
    } else {
      SocketManager.instance.adminSockets.forEach((_, _id) =>
        sockets.push({ _id })
      );
    }

    res.json(sockets);
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    SocketManager.instance.kick(req.params.id);
    res.status(200);
  }
);

export default router;
