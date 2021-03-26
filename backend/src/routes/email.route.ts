import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { EmailRequest } from '@codelm/common/src/models/email.model';
import { PersonDao } from '../daos/person.dao';
import { sendEmail } from '../email';

const router = Router();
router.use(AuthUtil.requireSuperUser);

router.post('/', async (req: Request, res: Response) => {
  const emailRequest = req.body as EmailRequest;
  const persons = await PersonDao.getPeopleByIds(emailRequest.to);
  await sendEmail(persons, emailRequest.template);
  res.sendStatus(200);
});

export default router;
