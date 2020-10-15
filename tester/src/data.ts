import { ClientProblemSubmission } from '@codelm/common/src/problem-submission';

// TODO: Refer to problem by name here, have the server send a name-_id mapping in /init.

export const PROBLEM_SUBMISSIONS = Object.freeze({
  basketball: {
    correct: {
      python: {
        problemId: '5c9d3df5d0563d63039f09ae', // 5ad60bb0271402062867ee94 in the local database
        language: 'python',
        code: `print(int(input()) % 2 == 0)`,
        test: false,
      } as ClientProblemSubmission,
    },
    incorrect: {
      python: {
        problemId: '5c9d3df5d0563d63039f09ae',
        language: 'python',
        code: `print(int(input()) % 2 != 0)`,
        test: false,
      } as ClientProblemSubmission,
    },
    // 'spin': {
    //     'python': {
    //         problemId: '5c9d3df5d0563d63039f09ae',
    //         language: 'python',
    //         code: `while True:\n\tpass`,
    //         test: false,
    //     } as ClientProblemSubmission,
    // },
    divide_by_zero: {
      python: {
        problemId: '5c9d3df5d0563d63039f09ae',
        language: 'python',
        code: `print(int(input()) / 0)`,
        test: false,
      } as ClientProblemSubmission,
    },
  },
});
