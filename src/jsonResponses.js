const crypto = require('crypto');

const posts = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(posts));

let digest = etag.digest('hex');

const respondJSON = (request, response, status, body) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(body));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.end();
};

const getPosts = (request, response) => {
  console.log('Get request got to getPosts');


  const responseJSON = {
    posts,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(posts));

  
  
  return respondJSON(request, response, 200, posts);
};


const addPost = (request, response, body) => {
  console.log('Arrived at addPost');

  const responseJSON = {
    posts,
  };

  if (!body.title || !body.name || !body.details || !body.runtime) {
    console.log('Parameters missing');
  } else {
    posts[body.title] = body;
    responseJSON.posts = posts;
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(posts));
  digest = etag.digest('hex');

  console.dir(posts[body.title]);
  return respondJSON(request, response, 200, posts[body.title]);
};

const notFound = (request, response) => {
  const responseJSON = {
    posts,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(posts));
  digest = etag.digest('hex');

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 304);

module.exports = {
  respondJSON,
  respondJSONMeta,
  getPosts,
  addPost,
  notFound,
  notFoundMeta,
};
