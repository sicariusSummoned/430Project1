const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);


  const res = response;
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);


    if (request.method === 'GET') {
      // NEEDS TO RETURN POSTS
      switch (parsedUrl.pathname) {
        case '/':
          htmlHandler.getIndex(request, response);
          break;
        case '/style.css':
          htmlHandler.getCSS(request, response);
          break;
        case '/bundle.js':
          htmlHandler.getBundle(request, response);
          break;
        case '/getPosts':
          jsonHandler.getPosts(request, response);
          break;
        case '/search':
          console.log('Search bodystring:');
          console.log(bodyString);
          console.log('Search bodyParams:');
          console.dir(bodyParams);
          jsonHandler.search(request, response, bodyParams);
          break;
        default:
          jsonHandler.notFound(request, response);
          break;
      }
    } else if (request.method === 'HEAD') {
      switch (parsedUrl.pathname) {
        case '/search':
          jsonHandler.searchMeta(request, response);
          break;
        default:
          jsonHandler.notFound(request, response);
          break;
      }
    } else if (request.method === 'POST') {

      // NEEDS TO POST NEW INFO
      switch (parsedUrl.pathname) {
        case '/addPost':
          jsonHandler.addPost(request, res, bodyParams);
          break;
        default:
          jsonHandler.notFound(request, res);
      }

    } else {
      // ERROR send 404
      jsonHandler.notFound(request, response);
    }
  });
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
