import {Request, Response, Router} from 'express';
import {TeamDao} from "../daos/team.dao";
import {DivisionDao} from "../daos/division.dao";
import {DivisionType} from "../../../common/src/models/division.model";
import {PermissionsUtil} from "../permissions.util";
import {debugTeamUsernames} from "../../../common/src/debug";

const router = Router();

router.use(PermissionsUtil.requireDebugMode);

router.get('/', (req: Request, res: Response) => {
    res.send('Debug mode is enabled!');
});

router.get('/init', async (req: Request, res: Response) => {
    let division = await DivisionDao.getDivisionByName('Debug');

    if (!division) {
        division = await DivisionDao.addOrUpdateDivision({
            _id: undefined,
            name: 'Debug',
            type: DivisionType.Special,
            starterCode: []
        });
    }

    await TeamDao.deleteTeams(debugTeamUsernames);
    await TeamDao.createTeams(debugTeamUsernames.map(username => ({
        members: '$DEBUG$',
        division,
        username,
        password: '',
        salt: ''
    })));

    res.send({success: true});
});

router.get('/deinit', async (req: Request, res: Response) => {
    await TeamDao.deleteTeams(debugTeamUsernames);
    res.send({success: true});
});

export default router;
