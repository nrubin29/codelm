import {CodeRunner} from './coderunner';
import {ServerProblemSubmission} from '../../common/src/problem-submission';
import {ProblemType} from "../../common/src/models/problem.model";
import {Game} from "../../common/src/models/game.model";
import {HighLow} from "./games/high-low";
import {languages} from "./language";
import {CodeFile} from "./codefile";
import {Timesweeper} from "./games/timesweeper";

process.on('uncaughtException', (e: Error) => {
  if (!e) {
    console.error('uncaughtException:thisisbad: ' + JSON.stringify(e));
  }

  else {
    process.stdout.write(JSON.stringify(e) + '\n');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: object, p: Promise<any>) => {
  if (!reason) {
    console.error('unhandledRejection:thisisbad: ' + JSON.stringify(reason));
  }

  else {
    process.stdout.write(JSON.stringify(reason) + '\n');
    process.exit(1);
  }
});

const stdin = process.openStdin();
stdin.once('data', async data => {
  const submission = JSON.parse(data) as ServerProblemSubmission;
  const language = languages[submission.language];

  let runner = new CodeRunner(language, 'code', [
    new CodeFile(
      submission.problemTitle.replace(/ /g, '') + '.' + language.extension,
      submission.code
    )
  ]);

  runner.output.subscribe(next => {
    if (!next) {
      console.error('runneroutput:thisisbad: ' + JSON.stringify(next));
    }

    else {
      process.stdout.write(JSON.stringify(next) + '\n')
    }
  });

  await runner.setup();

  if (submission.type === ProblemType.OpenEnded) {
    if (submission.game === Game.HighLow) {
      await runner.runGame(new HighLow());
    }

    else if (submission.game === Game.Timesweeper) {
      await runner.runGame(new Timesweeper(submission.problemExtras));
    }

    else {
      process.stderr.write(JSON.stringify({error: 'Invalid game ' + submission.game}) + '\n');
    }
  }

  else {
    await runner.run(submission.testCases);
  }
});
