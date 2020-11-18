import { ParameterizedContext } from 'koa';
import { TeamModel } from '../../common/src/models/team.model';
import { AdminModel } from '../../common/src/models/admin.model';

type MyContext = ParameterizedContext<{
  team?: TeamModel;
  admin?: AdminModel;
}>;
