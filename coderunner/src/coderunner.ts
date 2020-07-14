import { ExecException, execFile, spawn } from 'child_process';
import { TestCaseModel } from '../../common/src/models/problem.model';
import { TestCaseSubmissionModel } from '../../common/src/models/submission.model';
import { Language, languages } from './language';
import { CodeFile, FOLDER } from './codefile';
import * as fs from 'fs-extra';
import {
  CompilationResultPacket,
  GameOutputPacket,
  RunGamePacket,
  RunTestCasePacket,
  ServerProblemSubmissionPacket,
} from '../../common/src/packets/coderunner.packet';
import { StdioPacketManager } from '../../common/src/packet.manager';

process.on('uncaughtException', (e: Error) => {
  if (!e) {
    console.error('uncaughtException:thisisbad: ' + JSON.stringify(e));
  } else {
    process.stdout.write(JSON.stringify(e) + '\n');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: object, p: Promise<any>) => {
  if (!reason) {
    console.error('unhandledRejection:thisisbad: ' + JSON.stringify(reason));
  } else {
    process.stdout.write(JSON.stringify(reason) + '\n');
    process.exit(1);
  }
});

const TIMEOUT = 10 * 1000;

interface ProcessRunResult {
  output: string;
  error: string;
}

export class CodeRunner extends StdioPacketManager {
  language: Language;
  files: CodeFile[];

  constructor() {
    super(process.stdin, process.stdout);

    this.once<ServerProblemSubmissionPacket>(
      'serverProblemSubmission',
      async packet => {
        const submission = packet.serverProblemSubmission;
        this.language = languages[submission.language];
        this.files = [
          new CodeFile(
            submission.problemTitle.replace(/[ \W]/g, '') +
              '.' +
              this.language.extension,
            submission.code
          ),
          ...(this.language.files ?? []),
        ];

        await this.setup();
        this.emit(await this.compile());
      }
    );

    this.on<RunTestCasePacket>('runTestCase', async packet => {
      this.emit({
        name: 'runTestCaseResult',
        testCase: await this.runTestCase(packet.testCase),
      });
    });

    this.once<RunGamePacket>('runGame', async () => {
      await this.runGame();
    });
  }

  private runProcessSync(
    cmd: string,
    args: string[],
    input?: string
  ): Promise<ProcessRunResult> {
    return new Promise<ProcessRunResult>((resolve, reject) => {
      const process = execFile(
        cmd,
        args,
        { cwd: FOLDER, timeout: TIMEOUT },
        (err: ExecException, stdout, stderr) => {
          if (err && err.signal === 'SIGTERM') {
            reject({ error: 'Timed out' });
          } else {
            resolve({
              output: stdout.replace(/^\s+|\s+$/g, ''),
              error: stderr.replace(/^\s+|\s+$/g, ''),
            });
          }
        }
      );

      if (input) {
        process.stdin.write(input + '\n');
        process.stdin.end();
      }
    });
  }

  protected runProcessAsync(
    cmd: string,
    args: ReadonlyArray<string>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // TODO: If no output, event never triggers.
      const proc = spawn(cmd, args, { cwd: FOLDER });

      const timeout = setTimeout(() => {
        // process.kill(-proc.pid, 'SIGKILL');
        proc.kill();
        proc.stdout.removeAllListeners('data');
        proc.stderr.removeAllListeners('data');
        reject({ error: 'Timed out' });
      }, TIMEOUT);

      this.on<GameOutputPacket>('gameOutput', packet => {
        proc.stdin.write(packet.output + '\n');
      });

      let buf = '';
      proc.stdout.on('data', (data: Buffer) => {
        buf += data.toString();
        let guess: string;

        if (buf.indexOf('\n') !== -1) {
          guess = buf.substring(0, buf.indexOf('\n') + 1);
          buf = buf.substring(buf.indexOf('\n') + 1);
        }

        if (guess) {
          this.emit({ name: 'gameOutput', output: guess });
        }
      });

      // TODO: Handle stderr correctly.
      proc.stderr.on('data', (data: Buffer) => {
        // process.kill(-proc.pid, 'SIGKILL');
        clearTimeout(timeout);
        proc.kill();
        proc.stdout.removeAllListeners('data');
        proc.stderr.removeAllListeners('data');
        reject({ error: data.toString() });
      });

      // proc.on('exit', () => {
      //   resolve();
      // });
    });
  }

  protected async compile(): Promise<CompilationResultPacket> {
    const compileCmd = this.language.compile(this.files.map(file => file.name));
    const { error } = await this.runProcessSync(
      compileCmd[0],
      compileCmd.slice(1)
    );
    return { name: 'compilationResult', success: !error, error: error };
  }

  protected async runTestCase(
    testCase: TestCaseModel
  ): Promise<TestCaseSubmissionModel> {
    const runCmd = this.language.run(this.files.map(file => file.name));
    const { output, error } = await this.runProcessSync(
      runCmd[0],
      runCmd.slice(1),
      testCase.input
    );

    return {
      hidden: testCase.hidden,
      input: testCase.input,
      output,
      correctOutput: testCase.output,
      error: error || undefined, // If there's no error, error='', so we don't want it in our TestCaseSubmissionModel.
    };
  }

  async setup() {
    await fs.mkdir(FOLDER);
    await Promise.all(this.files.map(file => file.mkfile()));
  }

  async runGame(): Promise<void> {
    const runCmd = this.language.run(this.files.map(file => file.name));
    await this.runProcessAsync(runCmd[0], runCmd.slice(1));
  }
}

// This code gets called when the program runs.
process.openStdin();
new CodeRunner();
