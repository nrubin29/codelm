# codelm-email

A script that handles emailing CodeLM competitors.
The script uses Mailgun to send the emails and Mailgun templates to handle the formatting.

## Usage

- First, rename `mailgun.sample.json` to `mailgun.json` and enter your Mailgun API key and domain.
- Next, modify `main.ts` to include the correct information and template variables.
  If you want to load data to use in the emails, put them in the `data` folder.
  You can rename `data-sample` to `data` and follow the templates inside.
- Then, build with `yarn run build`.
- Finally, run the script:

```shell script
node email.js
```
