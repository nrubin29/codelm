import { Request, Response, Router } from 'express';
import { AdminDao } from '../daos/admin.dao';
import { PersonDao } from '../daos/person.dao';
import {
  LoginRequest,
  LoginResponse,
  LoginResponseType,
} from '@codelm/common/src/models/auth.model';
import { VERSION } from '@codelm/common/version';
import * as jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from '../server';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const request = req.body as LoginRequest;

  if (request.version !== VERSION) {
    res.json({ response: LoginResponseType.OutdatedClient } as LoginResponse);
    return;
  }

  try {
    const person = await PersonDao.login(request.username, request.password);
    const team = await PersonDao.getActiveTeam(person);

    res.json({
      response: LoginResponseType.SuccessTeam,
      jwt: jwt.sign(
        { personId: person._id, teamId: team._id },
        JWT_PRIVATE_KEY,
        { expiresIn: '6h' }
      ),
    } as LoginResponse);
  } catch (response) {
    if (response === LoginResponseType.NotFound) {
      try {
        const admin = await AdminDao.login(request.username, request.password);

        res.json({
          response: LoginResponseType.SuccessAdmin,
          jwt: jwt.sign({ adminId: admin._id }, JWT_PRIVATE_KEY, {
            expiresIn: '6h',
          }),
        } as LoginResponse);
      } catch (response) {
        if (response.stack !== undefined) {
          console.error(response);
          res.json({ response: LoginResponseType.Error } as LoginResponse);
        } else {
          res.json({
            response: response as LoginResponseType,
          } as LoginResponse);
        }
      }
    } else {
      if (response.stack !== undefined) {
        console.error(response);
        res.json({ response: LoginResponseType.Error } as LoginResponse);
      } else {
        res.json({ response: response as LoginResponseType } as LoginResponse);
      }
    }
  }
});

export default router;
