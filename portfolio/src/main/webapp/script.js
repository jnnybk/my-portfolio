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
let index = 0; 		
function nextImg() {
  const imgFilePath = "/images/album/";
  const time = 3000;
  
  const images = [ imgFilePath + "LoveIsABeautifulThing_Vulfpeck.jpg", imgFilePath + "Mayday_Crush.jpg", imgFilePath + "OjitosSonados_Ramona.jpg", imgFilePath + "Rach2_AnnaFedorova.jpg", imgFilePath + "SeTeOlvida_Ramona.jpg", imgFilePath + "TunnelOfLove_haroinfather.jpg"];
  document.albumSlide.src = images[index];

  if (index < images.length - 1) {
    console.log( "index is: " + index);
    index++; 
	} else {
    index = 0;
  }
  setTimeout("nextImg()", time);
}
window.onload = nextImg;
async function getContent() {
  const response = await fetch('/data');
  const quote = await response.text();
  document.getElementById('quote-container').innerText = quote;
}