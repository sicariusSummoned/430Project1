//Generic method for all responses from server
const handleResponse = (xhr, parseResponse, responseType) => {
  const postContainer = document.querySelector('#postContainer');
  const type = xhr.getResponseHeader('content-type');

  if (parseResponse) {
    console.log('Parse response is true');

    //For searching movies/ clients? 
    //Still need to decide on this one.
    if (responseType === 'search') {
      console.log('responseType is search');

      if (type === 'application/json') {
        let obj = JSON.parse(xhr.response);
      }
      //For populating the sidebar.
    } else if (responseType === 'getPosts') {
      console.log('ResponseType is getPosts');
      if (type === 'application/json') {
        let body = JSON.parse(xhr.response);
        console.log('body:');
        console.dir(body);

        const postContent = document.createElement('div');
        postContent.className = "postedContent";

        let userName = document.createElement('h4');
        let marathonTitle = document.createElement('p');
        let marathonLength = document.createElement('p');

        userName.innerHTML = body.name;
        marathonTitle.innerHTML = body.title;
        marathonLength.innerHTML = body.runtime;

        postContent.appendChild(userName);
        postContent.appendChild(marathonTitle);
        postContent.appendChild(marathonLength);

        postContainer.appendChild(postContent);
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

  xhr.onload = () => handleResponse(xhr, true, 'getPosts');

  const formInfo = `title=${title}&name=${name}&details=${details}&runtime=${runtime}`;

  xhr.send(formInfo);
  e.preventDefault();
  return false;
};

requestPosts = e => {
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
  e.preventDefault();
  return false;
};

const init = () => {
  const submissionForm = document.querySelector('#submissionForm');
  const getPosts = e => requestPosts(e);
  const sendPost = e => sendMarathon(e, submissionForm);

  submissionForm.addEventListener('submit', sendPost);
  //submissionForm.addEventListener('submit', getPosts);

};

window.onload = init;
