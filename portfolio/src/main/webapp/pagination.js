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

    this.prevCommentsButton = document.getElementById('prev-comments-button');
    this.nextCommentsButton = document.getElementById('next-comments-button');
    this.endOfCommentsSign = document.getElementById('end-of-comments-sign');
    this.comments = document.getElementById('comments');

    this.prevCommentsButton.classList.add("hidden");
    this.endOfCommentsSign.classList.add("hidden");
   
    document.getElementById('maxNum').addEventListener('input', () => {
      // Resetting innerHTML of comments when user re-selects the number of maximum comments to display
      this.comments.innerHTML = "";
      // Displays most recent page of comments so "prev" button should be hidden, "end-of-comments-sign" should be hidden, while "next" button should display.
      this.prevCommentsButton.classList.add("hidden");
      this.nextCommentsButton.classList.remove("hidden");
      this.endOfCommentsSign.classList.add("hidden");

      this.currentCommentsPageIndex = 0;
      this.totalNumberOfPagesRequested = 1;
      this.lastPage = -1;
      this.requestAndDisplayNewCommentsPage();
    });

    this.prevCommentsButton.addEventListener('click', () => {
      this.displayPrevPage();
    });

    this.nextCommentsButton.addEventListener('click', () => {
      this.displayNextPage();
    });
  }

  hideCommentAtIndex(index) {
    const commentList = this.comments.children;
    commentList[index].classList.add("hidden");
  }

  showCommentAtIndex(index) {
    const commentList = this.comments.children;
    commentList[index].classList.remove("hidden");
  }

  disableButtons() {
    this.prevCommentsButton.disabled = true;
    this.nextCommentsButton.disabled = true;
  }

  enableButtons() {
    this.prevCommentsButton.disabled = false;
    this.nextCommentsButton.disabled = false;
  }

   async displayNextPage() {
    this.disableButtons();

    this.prevCommentsButton.classList.remove("hidden");

    let commentList = this.comments.children;
    if (this.currentCommentsPageIndex + 1 === this.lastPage) {
      // There are no more comments.
      this.nextCommentsButton.classList.add("hidden");
      this.endOfCommentsSign.classList.remove("hidden");
      return;
    }

    if (this.currentCommentsPageIndex + 1 < this.totalNumberOfPagesRequested) {
      // There are more pages to view that have already been loaded. Swap the visible comments page.
      this.showCommentAtIndex(this.currentCommentsPageIndex+1);
      this.hideCommentAtIndex(this.currentCommentsPageIndex);
    } else {
      // Need to request a new page from the server. Prev/Next buttons are already disabled, so awaiting response is safe since user cannot change page index while the comments are being fetched.
      this.hideCommentAtIndex(this.currentCommentsPageIndex);
      await this.requestAndDisplayNewCommentsPage(this.cursorString);
      this.totalNumberOfPagesRequested++;
    }
    this.currentCommentsPageIndex++;
    this.enableButtons();
  }

  displayPrevPage() {
    this.endOfCommentsSign.classList.add("hidden");
    this.nextCommentsButton.classList.remove("hidden");
    
    this.showCommentAtIndex(this.currentCommentsPageIndex-1);
    this.hideCommentAtIndex(this.currentCommentsPageIndex);

    if (this.currentCommentsPageIndex-1 === 0) {
      this.prevCommentsButton.classList.add("hidden");
    }
    this.currentCommentsPageIndex--;
  }

  // Handles only requesting and displaying new comments page, when called from displayNextPage() or constructor().
  // Incrementing the current comments index page and the total number of requested pages does not happen in this function.
  async requestAndDisplayNewCommentsPage(cursorStr = null) {
    let maxNumberOfComments = document.getElementById('maxNum').value;

    const response = await fetch(`/data?max_num_of_comments=${maxNumberOfComments}&cursor=${cursorStr}`);
    const commentData = await response.json();

    const commentListElement = this.comments;
    this.cursorString = commentData['cursorString'];

    let commentList= commentListElement.children;

    // If the fetched data has fewer number of comments than the maximum number of comments, it signals that there are no more comments.
    if (commentData['commentList'].length < maxNumberOfComments) {
      this.nextCommentsButton.classList.add("hidden");
      this.endOfCommentsSign.classList.remove("hidden");
      
      if (commentListElement.childElementCount !== 0){
        this.prevCommentsButton.classList.remove("hidden");
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
