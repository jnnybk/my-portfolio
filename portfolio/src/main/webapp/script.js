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

function setVisibility(currentValue, idName) {
	if (idName === currentValue) {
		document.getElementById(currentValue).style.display = "block";
} else {
		document.getElementById(currentValue).style.display = "none";
	}
}
function Toggle(idName) {
	const sectionList = ['contact-section', 'about-section', 'main-section'];
	for (const section of sectionList) {
		setVisibility(section, idName);
	}
}
const imgFilePath = "/images/album/";
const images = [ 
  {
    "filePath": imgFilePath + "LoveIsABeautifulThing_Vulfpeck.jpg",
    "link": "https://youtu.be/x0vgMl6n7m0",
  },
  {
    "filePath": imgFilePath + "Mayday_Crush.jpg", 
    "link": "https://youtu.be/29ycT6fA-Rs",
  },
  {
    "filePath": imgFilePath + "OjitosSonados_Ramona.jpg", 
    "link": "https://youtu.be/-lJzIUniJOE",
  },
  {
    "filePath": imgFilePath + "Rach2_AnnaFedorova.jpg",
    "link": "https://youtu.be/rEGOihjqO9w",
  },
  {
    "filePath": imgFilePath + "SeTeOlvida_Ramona.jpg",
    "link": "https://youtu.be/PIndisFYGB8",
  },
  {
    "filePath": imgFilePath + "TunnelOfLove_haroinfather.jpg",
    "link": "https://youtu.be/cdlvLZqT3Ok",
  }];
var time;
let index = 0;

window.onload = () => {
  document.albumSlide.src = images[0]["filePath"];
  document.getElementById("wrapper").href = images[0]["link"];
}

function changeImg(isPrev = false) {
  if ( isPrev ) {
    if ( index == 0 ) {
      index = images.length - 1;
    } else {
      index--;
    }
    console.log("prev was clicked: " + index);
  } else {
    if ( index == images.length - 1 ) {
      index = 0;
    } else {
      index++; 
    }
    console.log("next was clicked: " + index);
  }
  document.albumSlide.src = images[index]["filePath"];
  document.getElementById("wrapper").href = images[index]["link"];
}
async function getContent() {
  const response = await fetch('/data');
  const quote = await response.text();
  document.getElementById('quote-container').innerText = quote;
}
