const express = require('express');

const app = express();
const https = require('https');
const http = require('http');
const dbmanager = require("./util/dbmanager")
// const { response } = require('express');

// const targetUrl = process.env.TARGET_URL || 'https://upwork.com'; // Run localtunnel like `lt -s rscraper -p 8080 --print-requests`; then visit https://yourname.loca.lt/todos/1 .

const proxyServerPort = process.env.PROXY_SERVER_PORT || 80;
let targetUrl = 'https://google.com'

// eslint-disable-next-line max-lines-per-function
app.use('/', async function (clientRequest, clientResponse) {    
    const parsedHost = targetUrl.split('/').splice(2).splice(0, 1).join('/');
    let parsedPort;
    let parsedSSL;
    if (targetUrl.startsWith('https://')) {
        parsedPort = 443;
        parsedSSL = https;
    } else if (targetUrl.startsWith('http://')) {
        parsedPort = 80;
        parsedSSL = http;
    }
    const options = {
        hostname: parsedHost,
        port: parsedPort,
        path: clientRequest.url,
        method: clientRequest.method,
        headers: {
            'User-Agent': clientRequest.headers['user-agent'],
        },
    };

    const serverRequest = parsedSSL.request(options, function (serverResponse) {
        let body = '';
        if (String(serverResponse.headers['content-type']).indexOf('text/html') !== -1) {
            serverResponse.on('data', function (chunk) {
                body += chunk;
            });

            serverResponse.on('end', function () {
                // Make changes to HTML files when they're done being read.
                // body = body.replace(`example`, `Cat!`);

                clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
                clientResponse.end(body);
            });
        } else {
            serverResponse.pipe(clientResponse, {
                end: true,
            });
            clientResponse.contentType(serverResponse.headers['content-type']);
        }
    });

    serverRequest.end();
});

let test = async () => {
    let dbState = await dbmanager.isConnected();
    if (!dbState) {
        logger('There is error in database connection-------->', '----server off------->')
        return;
    }
    targetUrl = await dbmanager.runQuery('select * from constant_list')
    console.log(targetUrl)
    targetUrl = targetUrl[0].redirect_url
    console.log(targetUrl)
}

test()

app.listen(proxyServerPort);