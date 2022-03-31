import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { SocketManager } from '../socket.manager';
import { SocketConnection } from '@codelm/common/src/models/sockets.model';

const router = Router();

router.get(
  '/:type',
  AuthUtil.requireSuperUser,
  (req: Request, res: Response) => {
    const sockets: SocketConnection[] = [];

    if (req.params.type === 'teams') {
      SocketManager.instance.sockets
        .filter(socket => socket.teamId)
        .forEach(socket => sockets.push({ _id: socket._id }));
    } else {
      SocketManager.instance.sockets
        .filter(socket => socket.adminId)
        .forEach(socket => sockets.push({ _id: socket._id }));
    }

    res.json(sockets);
  },
);

router.delete(
  '/:id',
  AuthUtil.requireSuperUser,
  (req: Request, res: Response) => {
    SocketManager.instance.kick(req.params.id);
    res.sendStatus(200);
  },
);

export default router;
