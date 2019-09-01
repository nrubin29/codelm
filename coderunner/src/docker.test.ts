import * as _ from 'mocha';
import {spawn} from 'child_process';
import {ServerProblemSubmission} from '../../common/src/problem-submission';
import * as assert from 'assert';
import {TestCaseSubmissionModel} from '../../common/src/models/submission.model';
import {ProblemType} from "../../common/src/models/problem.model";

function spawnProcess(submission: ServerProblemSubmission, onData: (data: string) => void) {
  return new Promise<void>((resolve, reject) => {
    try {
      const process = spawn('docker', ['run', '-i', '--rm', '--cap-drop', 'ALL', '--net=none', 'coderunner']);

      process.stdout.on('data', (data: Buffer) => {
        onData(data.toString());
      });

      process.on('exit', () => resolve());

      process.stdin.write(JSON.stringify(submission) + '\n');
      process.stdin.end();
    }

    catch (e) {
      reject(e);
    }
  });
}

describe('Docker', () => {
  describe('#container', () => {
    it('should spawn a container', done => {
      const submission: ServerProblemSubmission = {
        problemTitle: 'Main',
        type: ProblemType.Graded,
        testCases: [
          {
            hidden: false,
            input: '',
            output: ''
          }
        ],
        language: 'python',
        code: 'print("Hello, Python!")'
      };

      spawnProcess(submission, data => {
        console.log(data);
        const obj = JSON.parse(data);

        if (obj.hasOwnProperty('status')) {
          console.log(`Status: ${obj['status']}`);
        }

        else {
          assert.strictEqual((obj['testCase'] as TestCaseSubmissionModel).output, 'Hello, Python!');
        }
      }).then(() => done());
    });

    it('should echo', done => {
      const submission: ServerProblemSubmission = {
        problemTitle: 'Main',
        type: ProblemType.Graded,
        testCases: [
          {
            hidden: false,
            input: 'Hello',
            output: 'Hello'
          }
        ],
        language: 'python',
        code: 'print(input())'
      };

      spawnProcess(submission, data => {
        // assert.equal((JSON.parse(data) as TestCaseSubmissionModel[])[0].output, 'Hello');
      }).then(() => done());
    });

    it('should give an error', done => {
      const submission: ServerProblemSubmission = {
        problemTitle: 'Main',
        type: ProblemType.Graded,
        testCases: [
          {
            hidden: false,
            input: '',
            output: ''
          }
        ],
        language: 'python',
        code: 'break'
      };

      spawnProcess(submission, data => {
        // assert.equal(stderr.length > 0, true);
      }).then(() => done());
    });

    it('should time out', done => {
      const submission: ServerProblemSubmission = {
        problemTitle: 'Main',
        type: ProblemType.Graded,
        testCases: [
          {
            hidden: false,
            input: '',
            output: ''
          }
        ],
        language: 'python',
        code: 'while True:\n\tpass'
      };

      spawnProcess(submission, data => {
        // assert.equal(stderr.length > 0, true);
      }).then(() => done());
    });
  });
});