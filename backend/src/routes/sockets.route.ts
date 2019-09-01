import { Request, Response, Router } from 'express';
import { DivisionDao } from '../daos/division.dao';
import { DivisionModel, DivisionType } from '../../../common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';
import { FileArray, UploadedFile } from 'express-fileupload';
import {SettingsState} from "../../../common/src/models/settings.model";
import {SocketService} from "../../../frontend/src/app/services/socket.service";
import {SocketManager} from "../socket.manager";

const router = Router();

router.get('/', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  const teamSockets = [];
  const adminSockets = [];

  SocketManager.instance.teamSockets.forEach((_, id) => teamSockets.push(id));
  SocketManager.instance.adminSockets.forEach((_, id) => adminSockets.push(id));

  res.json({'team': teamSockets, 'admin': adminSockets});
});

router.delete('/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  SocketManager.instance.kick(req.params.id);
  res.status(200);
});

export default router
