# codelm-backend

The backend for CodeLM.
See the `deployment` directory for information on deploying CodeLM.

## Setup

In `src/`, rename `env.sample.ts` to `env.ts`.
To use the built-in email feature, enter your Mailgun API key and domain.

## Usage

```shell script
node bundle.js [--debug]
```

If `--debug` is passed, the server will be run in debug mode.

## Debug mode

When the server is running in debug mode, the following changes take effect:

- Teams can log in with any password.
- The `/api/debug` endpoints used by the tester are enabled.
