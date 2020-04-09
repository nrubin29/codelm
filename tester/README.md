# codelm-tester

A fully-automated stress tester for CodeLM.
The tester will simulate a large number of teams and spam the server with requests and submissions.
The server must be run in debug mode for the tester to work.

## Usage

```shell script
node tester.js [--remote]
```

If `--remote` is passed, the tester will connect to `newwavecomputers.com`. Otherwise, it will connect to `localhost:8080`.
