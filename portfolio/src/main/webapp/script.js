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
