import {ClientProblemSubmission} from "../../common/src/problem-submission";

export const PROBLEM_SUBMISSIONS = Object.freeze({
    'basketball': {
        'python': {
            problemId: '5ad60bb0271402062867ee94',
            language: 'python',
            code: `print(int(input()) % 2 == 0)`,
            test: false
        } as ClientProblemSubmission,
    },
});
