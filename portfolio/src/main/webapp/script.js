// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const imgFilePath = '/images/album';
const images = [
  {
    filePath: `${imgFilePath}/LoveIsABeautifulThing_Vulfpeck.jpg`,
    link: 'https://youtu.be/x0vgMl6n7m0',
  },
  {
    filePath: `${imgFilePath}/Mayday_Crush.jpg`,
    link: 'https://youtu.be/29ycT6fA-Rs',
  },
  {
    filePath: `${imgFilePath}/OjitosSonados_Ramona.jpg`,
    link: 'https://youtu.be/-lJzIUniJOE',
  },
  {
    filePath: `${imgFilePath}/Rach2_AnnaFedorova.jpg`,
    link: 'https://youtu.be/rEGOihjqO9w',
  },
  {
    filePath: `${imgFilePath}/SeTeOlvida_Ramona.jpg`,
    link: 'https://youtu.be/PIndisFYGB8',
  },
  {
    filePath: `${imgFilePath}/TunnelOfLove_haroinfather.jpg`,
    link: 'https://youtu.be/cdlvLZqT3Ok',
  }];

class ImageAnchors {
  constructor() {
    this.index = 0;
    document.getElementById('prev').addEventListener('click', () => {
      this.changeImg(true);
    });
    document.getElementById('next').addEventListener('click', () => {
      this.changeImg(false);
    });
  }

  changeImg(isPrev = false) {
    if ( isPrev ) {
      if ( this.index === 0 ) {
        this.index = images.length - 1;
      } else {
        this.index--;
      }
    } else {
      if ( this.index === images.length - 1 ) {
        this.index = 0;
      } else {
        this.index++;
      }
    }
    document.albumSlide.src = images[this.index].filePath;
    document.getElementById('wrapper').href = images[this.index].link;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const imgAnchor = new ImageAnchors();
  document.albumSlide.src = images[0].filePath;
  document.getElementById('wrapper').href = images[0].link;
});

function createCommentElement(comment) {
  const commentElement = document.createElement('li');
  commentElement.className = 'comment-item';

  const commentUserNameElement = document.createElement('span');
  commentUserNameElement.innerText = comment.userName + ':';
  commentUserNameElement.className = 'comment-user-name';

  const commentUserEmailElement = document.createElement('span');
  commentUserEmailElement.innerText = comment.userEmail;
  commentUserEmailElement.className = 'comment-user-email';

  const commentContentElement = document.createElement('span');
  commentContentElement.innerText = comment.userComment;
  commentContentElement.className = 'comment-content';

  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.innerText = 'Delete';
  deleteButtonElement.addEventListener('click', () => {
    deleteComment(comment);
    commentElement.remove();
  });

  commentElement.appendChild(commentUserNameElement);
  commentElement.appendChild(commentContentElement);
  commentElement.appendChild(commentUserEmailElement);

  return commentElement;
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('maxNum').addEventListener('input', () => {
    let parentElement = document.getElementById('comments');
    while (parentElement.firstChild) {
      parentElement.removeChild(parentElement.lastChild);
    }
    cursorStr = null;
    displayComments(cursorStr);
  });
});

let cursorStr = null;
async function displayComments(cursorString) {
  maxNumberOfComments = document.getElementById('maxNum').value;

  const response = await fetch(`/data?max_num_of_comments=${maxNumberOfComments}&cursor=${cursorStr}`);
  const commentData = await response.json();

  const commentListElement = document.getElementById('comments');
  cursorStr = commentData['cursorString'];

  let commentList= commentListElement.children;

  for (let i = 0; i < commentList.length; i++) {
    commentList[i].style.display = "none";
  }

  if (commentData['commentList'].length < maxNumberOfComments) {
    document.getElementById('next-comments').style.display = "none";
    document.getElementById('end-of-comments-sign').style.display = "block";
  }

  let commentGroup = document.createElement('div');
  let numberOfCommentGroups = commentListElement.childElementCount;
  numberOfCommentGroups++;
  commentGroup.id = numberOfCommentGroups.toString();
  commentGroup.style.display = "block";
  commentData['commentList'].forEach((comment) => {
    commentGroup.appendChild(createCommentElement(comment));
  });
  commentListElement.appendChild(commentGroup);
}

document.addEventListener('DOMContentLoaded', () => {
  let lastPage = 0;
  document.getElementById('next-comments').addEventListener('click', (cursorStr) => {
    document.getElementById('prev-comments').style.display = "block";
    let commentList = document.getElementById('comments').children;

    let i;
    let needToSendNextRequest = true;
    for (i = 0; i < commentList.length; i++) {
      if (commentList[i].style.display === "block") {
        if (commentList.length-1 !== i) {
          commentList[i+1].style.display = "block";
          commentList[i].style.display = "none";
          needToSendNextRequest = false;
        } else {
          document.getElementById('end-of-comments-sign').style.display = "block";
          document.getElementById('next-comments').style.display = "none";
        }
      }
    }
    if (needToSendNextRequest) {
      lastPage++;
      displayComments(cursorStr);
      document.getElementById('end-of-comments-sign').style.display = "none";
      document.getElementById('next-comments').style.display = "block";
    }
  });

  document.getElementById('prev-comments').addEventListener('click', () => {
    document.getElementById('end-of-comments-sign').style.display = "none";
    document.getElementById('next-comments').style.display = "block";
    let commentList = document.getElementById('comments').children;

    let i;
    for (i = 0; i < commentList.length; i++) {
      if (commentList[i].style.display === "block") {
        commentList[i].style.display = "none";

        if (i === 1) {
          document.getElementById('prev-comments').style.display = "none";
        }
        if (commentList.length !== 1) {
          document.getElementById(i.toString()).style.display = "block";
        }
      }
    }
  });
})

function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-data', {method: 'POST', body: params});
}

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
});

async function checkLoginStatus() {
  const response = await fetch('/login');
  const loginStatus = await response.json();

  if (loginStatus === true) {
    document.getElementById('comment-form').style.display = "block";
  } else {
    document.getElementById('comment-form').style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mode').addEventListener('click', toggleMode);
})

function toggleMode() {
  document.body.classList.toggle("dark-mode");
}
