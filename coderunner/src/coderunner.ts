import { execFile, spawn } from 'child_process';
import { TestCaseModel } from '../../common/src/models/problem.model';
import { TestCaseSubmissionModel } from '../../common/src/models/submission.model';
import { Subject } from 'rxjs';
import Game from "./games/game";
import {Language} from "./language";
import {CodeFile} from "./codefile";
import * as fs from "fs-extra";

const TIMEOUT = 10 * 1000;

interface RunResult {
  output: string;
}

interface ProcessRunResult {
  output: string;
  error: string;
}

export type TestCaseRunResult = TestCaseSubmissionModel & RunResult;

export interface RunError {
  stage: 'compile' | 'run';
  testCase?: number;
  error: string;
}

export class CodeRunner {
  public output: Subject<object>;

  constructor(private language: Language, public folder: string, public files: CodeFile[]) {
    this.output = new Subject<object>();
    this.files.concat(this.language.files || []);
  }

  private runProcessSync(cmd: string, args: string[], input?: string): Promise<ProcessRunResult> {
    return new Promise<ProcessRunResult>((resolve, reject) => {
      const process = execFile(cmd, args, { cwd: this.folder, timeout: TIMEOUT }, (err: Error & {signal: string}, stdout, stderr) => {
        if (err && err.signal === 'SIGTERM') {
          reject({error: 'Timed out'});
        }

        else {
          resolve({output: stdout.replace(/^\s+|\s+$/g, ''), error: stderr.replace(/^\s+|\s+$/g, '')});
        }
      });

      if (input) {
        process.stdin.write(input + '\n');
        process.stdin.end();
      }
    });
  }

  protected runProcessAsync(cmd: string, args: ReadonlyArray<string>, game: Game): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // TODO: If no output, event never triggers.
      const proc = spawn(cmd, args, {cwd: this.folder});

      const timeout = setTimeout(() => {
        // process.kill(-proc.pid, 'SIGKILL');
        proc.kill();
        proc.stdout.removeAllListeners('data');
        proc.stderr.removeAllListeners('data');
        reject({error: 'Timed out'});
      }, TIMEOUT);

      let buf = '';
      proc.stdout.on('data', (data: Buffer) => {
        buf += data.toString();
        let guess: string;

        if (buf.indexOf('\n') !== -1) {
          guess = buf.substring(0, buf.indexOf('\n') + 1);
          buf = buf.substring(buf.indexOf('\n') + 1);
        }

        if (guess) {
          const result = game.onInput(guess);
          this.output.next({input: result, output: guess});

          if (game.isFinished()) {
            this.output.next({input: game.getResult(), output: guess});

            // process.kill(-proc.pid, 'SIGKILL');
            clearTimeout(timeout);
            proc.kill();
            proc.stdout.removeAllListeners('data');
            proc.stderr.removeAllListeners('data');
            resolve();
          }

          else {
            if (typeof result === 'string') {
              proc.stdin.write(result + '\n');
            }

            else {
              // process.kill(-proc.pid, 'SIGKILL');
              clearTimeout(timeout);
              proc.kill();
              proc.stdout.removeAllListeners('data');
              proc.stderr.removeAllListeners('data');
              reject({error: result.error});
            }
          }
        }
      });

      // TODO: Handle stderr correctly.
      proc.stderr.on('data', (data: Buffer) => {
        // process.kill(-proc.pid, 'SIGKILL');
        clearTimeout(timeout);
        proc.kill();
        proc.stdout.removeAllListeners('data');
        proc.stderr.removeAllListeners('data');
        reject({error: data.toString()});
      });

      // proc.on('exit', () => {
      //   resolve();
      // });
    });
  }

  protected async compile(): Promise<RunResult> {
    const compileCmd = this.language.compile(this.files.map(file => file.name));

    const {output, error} = await this.runProcessSync(compileCmd[0], compileCmd.slice(1));

    if (error.length > 0) {
      throw {
        stage: 'compile',
        error: error
      };
    }

    else {
      return {
        output: output
      };
    }
  }

  protected async runTestCase(testCase: TestCaseModel): Promise<TestCaseRunResult> {
    const runCmd = this.language.run(this.files.map(file => file.name));

    const {output, error} = await this.runProcessSync(runCmd[0], runCmd.slice(1), testCase.input);

    if (error.length > 0) {
      throw {
        stage: 'run',
        error: error
      };
    }

    else {
      return {
        hidden: testCase.hidden,
        input: testCase.input,
        output: output,
        correctOutput: testCase.output
      };
    }
  }

  async setup() {
    await fs.mkdir(this.folder);

    await Promise.all(this.files.map(file => file.mkfile(this.folder)));

    this.output.next({status: 'Compiling'});

    await this.compile();
    this.output.next({status: 'Setup complete'});
  }

  async run(testCases: TestCaseModel[]): Promise<void> {
    this.output.next({status: 'Running'});

    for (let testCase of testCases) {
      const result = await this.runTestCase(testCase);
      this.output.next({testCase: result});
    }
  }

  async runGame(game: Game): Promise<void> {
    const runCmd = this.language.run(this.files.map(file => file.name));

    this.output.next({status: 'Running'});
    await this.runProcessAsync(runCmd[0], runCmd.slice(1), game);
  }
}
