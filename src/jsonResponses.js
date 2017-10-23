const myKey = '9a0d8b4145c3e4ec3a2212c9335dc57f';

const crypto = require('crypto');

const mdb = require('moviedb')(myKey);

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
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(posts));

  return respondJSON(request, response, 200, posts);
};


const getPostsMeta = (request, response) => respondJSONMeta(request, response, 200);

const addPost = (request, response, body) => {
  let updated = false;

  if (!body.title || !body.name || !body.details || !body.runtime) {
    console.log('Parameters missing');
  } else {
    if (posts[body.title]) {
      updated = true;
    }
    posts[body.title] = body;
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(posts));
  digest = etag.digest('hex');
  console.dir(posts[body.title]);

  if (updated) {
    return respondJSONMeta(request, response, 204);
  }
  return respondJSONMeta(request, response, 201);
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

const search = (request, response, searchQuery) => {
  if (!searchQuery.query) {
    console.log('missing params for search');
  } else {
    console.log('searchQuery.query:');
    console.dir(searchQuery.query);

    mdb.searchMovie({
      query: searchQuery.query,
    }, (err, res) => {
      etag = crypto.createHash('sha1').update(JSON.stringify(posts));
      digest = etag.digest('hex');


      return respondJSON(request, response, 200, res.results);
    });
  }
};

module.exports = {
  respondJSON,
  respondJSONMeta,
  getPosts,
  getPostsMeta,
  addPost,
  notFound,
  notFoundMeta,
  search,
};
