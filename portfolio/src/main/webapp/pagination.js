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

document.addEventListener('DOMContentLoaded', () => {
  const commentButton = new CommentButton();
  commentButton.requestAndDisplayNewCommentsPage();
});

class CommentButton {
  constructor() {
    this.currentCommentsPageIndex = 0;
    this.totalNumberOfPagesRequested = 1;
    this.lastPage = -1;
    this.cursorString = null;
     
    document.getElementById('prev-comments-button').classList.add("hidden");
    document.getElementById('end-of-comments-sign').classList.add("hidden");
   
    document.getElementById('maxNum').addEventListener('input', () => {
      document.getElementById('comments').innerHTML = "";
      document.getElementById('prev-comments-button').classList.add("hidden");
      if (document.getElementById('next-comments-button').classList.contains("hidden")) {
        document.getElementById('next-comments-button').classList.remove("hidden");
      }
      document.getElementById('end-of-comments-sign').classList.add("hidden");
      this.currentCommentsPageIndex = 0;
      this.totalNumberOfPagesRequested = 1;
      this.lastPage = -1;
      this.requestAndDisplayNewCommentsPage();

    });

    document.getElementById('prev-comments-button').addEventListener('click', () => {
      this.displayPrevPage();
    });

    document.getElementById('next-comments-button').addEventListener('click', () => {
      this.displayNextPage();
    });
  }

  displayNextPage() {
    if (document.getElementById('prev-comments-button').classList.contains("hidden")) {
      document.getElementById('prev-comments-button').classList.remove("hidden");
    }

    let commentList = document.getElementById('comments').children;
    if (this.currentCommentsPageIndex + 1 === this.lastPage) {
        document.getElementById('next-comments-button').classList.add("hidden");
        document.getElementById('end-of-comments-sign').classList.remove("hidden");
    }
    if (this.currentCommentsPageIndex + 1 < this.totalNumberOfPagesRequested) {
      commentList[this.currentCommentsPageIndex+1].classList.remove("hidden");
      commentList[this.currentCommentsPageIndex].classList.add("hidden");
      
    } else {
      commentList[this.currentCommentsPageIndex].classList.add("hidden");
      this.requestAndDisplayNewCommentsPage(this.cursorString);
      this.totalNumberOfPagesRequested++;
    }
    this.currentCommentsPageIndex++;
  }

  displayPrevPage() {
    if (!document.getElementById('end-of-comments-sign').classList.contains("hidden")) {
      document.getElementById('end-of-comments-sign').classList.add("hidden");
    }
    if (document.getElementById('next-comments-button').classList.contains("hidden")) {
      document.getElementById('next-comments-button').classList.remove("hidden");
    }
    
    let commentList = document.getElementById('comments').children;
    commentList[this.currentCommentsPageIndex-1].classList.remove("hidden");
    commentList[this.currentCommentsPageIndex].classList.add("hidden");
    if (this.currentCommentsPageIndex-1 === 0) {
      document.getElementById('prev-comments-button').classList.add("hidden");
    }
    this.currentCommentsPageIndex--;
  }

  async requestAndDisplayNewCommentsPage(cursorStr = null) {
    let maxNumberOfComments = document.getElementById('maxNum').value;

    const response = await fetch(`/data?max_num_of_comments=${maxNumberOfComments}&cursor=${cursorStr}`);
    const commentData = await response.json();
    const commentListElement = document.getElementById('comments');
    this.cursorString = commentData['cursorString'];

    let commentList= commentListElement.children;

    // If the fetched data has fewer number of comments than the maximum number of comments, it signals that there are no more comments.
    if (commentData['commentList'].length < maxNumberOfComments) {
      document.getElementById('next-comments-button').classList.add("hidden");
      document.getElementById('end-of-comments-sign').classList.remove("hidden");
      
      if (commentListElement.childElementCount !== 0){
        document.getElementById('prev-comments-button').classList.remove("hidden");
      }
      this.lastPage = commentListElement.childElementCount;
    }

    let commentGroup = document.createElement('div');
    let numberOfCommentGroups = commentListElement.childElementCount;
    numberOfCommentGroups++;
    commentGroup.id = numberOfCommentGroups.toString();
    commentData['commentList'].forEach((comment) => {
      commentGroup.appendChild(this.createCommentElement(comment));
    });
    commentListElement.appendChild(commentGroup);
  }

  createCommentElement(comment) {
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
      this.deleteComment(comment);
      commentElement.remove();
    });

    commentElement.appendChild(commentUserNameElement);
    commentElement.appendChild(commentContentElement);
    commentElement.appendChild(commentUserEmailElement);

    return commentElement;
  }

  deleteComment(comment) {
    const params = new URLSearchParams();
    params.append('id', comment.id);
    fetch('/delete-data', {method: 'POST', body: params});
  }
}
