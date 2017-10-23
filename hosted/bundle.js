//Generic method for all responses from server
const handleResponse = (xhr, parseResponse, responseType) => {
  const postContainer = document.querySelector('#postContainer');
  const type = xhr.getResponseHeader('content-type');

  console.log(`Status code from server: ${xhr.status}`);

  if (parseResponse) {
    //For searching movies/ clients? 
    //Still need to decide on this one.
    if (responseType === 'search') {
      console.log('search');

      if (type === 'application/json') {
        let obj = JSON.parse(xhr.response);
      }
      //For populating the sidebar.
    } else if (responseType === 'getPosts') {
      console.log('getPosts');
      if (type === 'application/json') {
        postContainer.innerHTML = "";

        let body = JSON.parse(xhr.response);

        let keys = Object.keys(body);

        for (let i = 0; i < keys.length; i++) {
          let post = body[keys[i]];

          if (post.name && post.title && post.runtime) {
            const postContent = document.createElement('div');
            postContent.className = "postedContent";

            let userName = document.createElement('h4');
            let marathonTitle = document.createElement('p');
            let marathonLength = document.createElement('p');

            userName.innerHTML = post.name;
            marathonTitle.innerHTML = post.title;
            marathonLength.innerHTML = post.runtime;

            postContent.appendChild(userName);
            postContent.appendChild(marathonTitle);
            postContent.appendChild(marathonLength);

            postContainer.appendChild(postContent);
          }
        }
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

const requestPosts = e => {
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
  //e.preventDefault();
  return false;
};

const searchMovies = (e, searchForm) => {
  console.log('searching clientside');
  const action = searchForm.getAttribute('action');
  const method = searchForm.getAttribute('method');
  const query = document.querySelector('#searchField').value;

  const xhr = new XMLHttpRequest();
  xhr.open(method, action);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleResponse(xhr, true, 'search');

  const searchInfo = `query=${query}`;

  console.log('Search Info:');
  console.log(searchInfo);

  xhr.send(searchInfo);
  e.preventDefault();
  return false;
};

const init = () => {
  const submissionForm = document.querySelector('#submissionForm');
  const searchForm = document.querySelector('#searchForm');
  const getPosts = e => requestPosts(e);
  const sendPost = e => sendMarathon(e, submissionForm);
  const sendSearch = e => searchMovies(e, searchForm);

  submissionForm.addEventListener('submit', sendPost);
  searchForm.addEventListener('submit', sendSearch);

  setInterval(getPosts, 3000);
};

window.onload = init;
