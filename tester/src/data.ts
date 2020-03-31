import {ClientProblemSubmission} from "../../common/src/problem-submission";

// TODO: Refer to problem by name here, have the server send a name-_id mapping in /init.

export const PROBLEM_SUBMISSIONS = Object.freeze({
    'basketball': {
        'python': {
            problemId: '5c9d3df5d0563d63039f09ae', // 5ad60bb0271402062867ee94 in the local database
            language: 'python',
            code: `print(int(input()) % 2 == 0)`,
            test: true,
        } as ClientProblemSubmission,
    },
});
