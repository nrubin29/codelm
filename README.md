# codelm

This repository contains six components that together make up the platform used to run the CodeLM programming competition.

## Components

All components are written in TypeScript and run either on Node.js or in the browser.

- `backend`: The server backend. Uses Express and Mongoose. Requires a MongoDB database.
- `coderunner`: Runs inside of a Docker container spawned by the backend. Receives a user's code submission, runs it, and reports the results.
- `common`: Type definitions and utilities used by multiple components.
- `frontend`: The frontend. Contains the competitor dashboard and the admin dashboard. Uses Angular.
- `landing`: The landing site containing general information about the event.
- `test`: An automated stress test suite.

## Previous versions of the CodeLM platform:

- [codelm-2015](https://github.com/nrubin29/codelm-2015): Used in the first competition in 2015. Written in PHP/jQuery.
- [codelm-2016](https://github.com/nrubin29/codelm-2016): Used in the 2016 competition. An improved version of the 2015 codebase.
- [codelm-2017](https://github.com/nrubin29/codelm-2017): Used in the 2017 competition. Written in Django.
- [codelm-2018](https://github.com/nrubin29/codelm-2018): Used in the 2018 competition. Written in Express/Angular.
- [codelm-2019](https://github.com/nrubin29/codelm-2019): Used in the 2019 competition. An improved version of the 2018 codebase.
- This repo: Used in the 2020 competition and will be used in all future competitions. An improved version of the 2019 codebase.
