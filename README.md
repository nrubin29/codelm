# codelm

This repository contains six components that together make up the platform used to run the CodeLM programming competition.

## Components

All components are written in TypeScript and run either on Node.js or in the browser.

- `backend`: The server backend. Uses Express and Mongoose. Requires a MongoDB database.
- `coderunner`: Runs inside of a Docker container spawned by the backend. Receives a user's code submission, runs it, and reports the results.
- `common`: Type definitions and utilities used by multiple components.
- `email`: A script that handles emailing competitors.
- `frontend`: The frontend. Contains the competitor dashboard and the admin dashboard. Uses Angular.
- `test`: An automated stress test suite.

## Previous versions of the CodeLM platform:

- [codelm-2015](https://github.com/nrubin29/codelm-2015): Used in the first competition in 2015. Written in PHP/jQuery. I think that I used an improved version of the same codebase in the 2016 competition, but I guess I didn't upload it to GitHub.
- [codelm-2017](https://github.com/nrubin29/codelm-2017): Used in the 2017 competition. Written in Django.
- [codelm-2018](https://github.com/nrubin29/codelm-2018): Used in the 2018 competition. Written in Express/Angular.
- This repo: An improved version of the 2018 dashboard. Used in the 2019 competition and will be used in all future competitions. The commit history for this version prior to September 1, 2019 is in a private Bitbucket project.
