let mostRecentETag = '';

//Generic method for all responses from server
const handleResponse = (xhr, parseResponse, responseType) => {
  const postContainer = document.querySelector('#postContainer');
  const searchContainer = document.querySelector('#searchContainer');
  const type = xhr.getResponseHeader('content-type');

  if (parseResponse) {
    //For searching movies/ clients? 
    //Still need to decide on this one.
    if (responseType === 'search') {
      console.log('search');

      if (type === 'application/json') {
        let obj = JSON.parse(xhr.response);
        searchContainer.innerHTML = "";

        let body = JSON.parse(xhr.response);
        console.dir(body);

        let keys = Object.keys(body);

        for (let i = 0; i < keys.length; i++) {

          let movie = body[keys[i]];
          console.dir(movie);

          if (movie.original_title && movie.overview) {
            const searchContent = document.createElement('div');
            searchContent.className = "searchedContent";

            let movieTitle = document.createElement('h4');
            let description = document.createElement('p');
            let rating = document.createElement('b');

            movieTitle.innerText = movie.original_title;
            description.innerText = movie.overview;
            rating.innerText = 'Rated: ' + movie.vote_average + '/10';
            //The api doesn't actually allow me to 
            //get the runtime through the same method that 
            //gets me all the movies.
            //So i'm going to fake the runtime for movies.

            searchContent.appendChild(movieTitle);
            searchContent.appendChild(description);
            searchContent.appendChild(rating);

            searchContainer.appendChild(searchContent);
          }
        }
      }
      //For populating the sidebar.
    } else if (responseType === 'getPosts') {

      console.log('getPosts');
      if (type === 'application/json') {
        postContainer.innerHTML = "";

        let body = JSON.parse(xhr.response);
        mostRecentETag = xhr.getResponseHeader('etag');

        let keys = Object.keys(body);

        for (let i = 0; i < keys.length; i++) {
          let post = body[keys[i]];

          if (post.name && post.title && post.runtime) {
            const postContent = document.createElement('div');
            postContent.className = "postedContent";

            let marathonTitle = document.createElement('h4');
            let userName = document.createElement('h3');
            let marathonDetails = document.createElement('p');
            let marathonLength = document.createElement('b');

            userName.innerHTML = 'By ' + post.name;
            marathonTitle.innerHTML = post.title;
            marathonDetails.innerHTML = post.details;
            marathonLength.innerHTML = post.runtime + ' minutes';

            postContent.appendChild(marathonTitle);
            postContent.appendChild(userName);
            postContent.appendChild(marathonDetails);
            postContent.appendChild(marathonLength);

            postContainer.appendChild(postContent);
          }
        }
      }
    } else if (responseType == 'checkPosts') {
      //If the etag says there's no new information
      //Don't call getPosts.

      const currentEtag = xhr.getResponseHeader('etag');
      if (currentEtag !== mostRecentETag) {
        console.log('new posts detected');
        requestPosts();
      }
    }
  }
};

const sendMarathon = (e, submissionForm) => {
  const action = submissionForm.getAttribute('action');
  const method = submissionForm.getAttribute('method');
  const title = document.querySelector('#titleField').value;
  const name = document.querySelector('#nameField').value;
  const details = document.querySelector('#detailsField').value;
  const runtime = document.querySelector('#timeField').value;

  const xhr = new XMLHttpRequest();

  xhr.open(method, action);

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleResponse(xhr, true, 'addPost');

  const formInfo = `title=${title}&name=${name}&details=${details}&runtime=${runtime}`;

  xhr.send(formInfo);
  e.preventDefault();
  return false;
};

const requestPosts = () => {
  const action = '/getPosts';
  const method = 'get';

  const xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Accept', 'application/json');

  if (method === 'get') {
    xhr.onload = () => handleResponse(xhr, true, 'getPosts');
  } else {
    xhr.onload = () => handleResponse(xhr, false, 'getPosts');
  }

  xhr.send();
};

const checkPosts = () => {

  const action = '/checkPosts';
  const method = 'head';

  const xhr = new XMLHttpRequest();

  xhr.open(method, action);
  xhr.setRequestHeader('Accept', 'application/json');

  if (method === 'head') {
    xhr.onload = () => handleResponse(xhr, true, 'checkPosts');
  } else {
    xhr.onload = () => handleResponse(xhr, false, 'checkPosts');
  }

  xhr.send();
};

const searchMovies = (e, searchForm) => {
  console.log('searching clientside');
  const method = searchForm.getAttribute('method');
  const query = document.querySelector('#searchField').value;
  let action = searchForm.getAttribute('action');

  const searchInfo = `?query=${query}`;

  console.log('Search Info:');
  console.log(searchInfo);

  action += searchInfo;

  const xhr = new XMLHttpRequest();
  xhr.open(method, action);

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleResponse(xhr, true, 'search');

  xhr.send();
  e.preventDefault();
  return false;
};

const init = () => {

  const submissionForm = document.querySelector('#submissionForm');
  const searchForm = document.querySelector('#searchForm');
  //const getPosts = (e) => requestPosts(e);
  const sendPost = e => sendMarathon(e, submissionForm);
  const sendSearch = e => searchMovies(e, searchForm);
  submissionForm.addEventListener('submit', sendPost);
  searchForm.addEventListener('submit', sendSearch);

  setInterval(checkPosts, 1000);
};

window.onload = init;
