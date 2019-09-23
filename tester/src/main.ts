import * as fetchHttp from 'node-fetch';

console.log('Starting CodeLM tester...');

fetchHttp.default('http://localhost:8080/api/debug/init').then(resp => resp.json()).then(resp => {
    if (resp.success) {
        console.log('Ready!');
    }

    else {
        console.log('Initialization failed.');
    }
});
