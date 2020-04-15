import {send} from './email';

async function main() {
    console.log(await send('nrubin29@gmail.com', '[Please read] Important information for CodeLM 2020', {
        templateName: 'info',
        firstName: 'Noah',
        username: 'nrubin',
        password: 'secret123',
    }));
}

main();
