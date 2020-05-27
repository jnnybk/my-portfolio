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




function ToggleContact() {
	const contactElement = document.getElementById("contact-page");
	const aboutElement = document.getElementById("about-page");
	const mainElement = document.getElementById("main-page");

	console.log("Function ToggleContact() has been invoked.");
	contactElement.style.display = "block";
	aboutElement.style.display = "none";
	mainElement.style.display = "none";
}

function ToggleReset() {
	const contactElement = document.getElementById("contact-page");
	const aboutElement = document.getElementById("about-page");
	const mainElement = document.getElementById("main-page");

	console.log("Function ToggleReset() - back to main page - has been invoked.");
	contactElement.style.display = "none";
	aboutElement.style.display = "none";
	mainElement.style.display = "block";
}

function ToggleAbout() {
	const contactElement = document.getElementById("contact-page");
	const aboutElement = document.getElementById("about-page");
	const mainElement = document.getElementById("main-page");

	console.log("Function ToggleAbout() has been invoked.");
	contactElement.style.display = "none";
	aboutElement.style.display = "block";
	mainElement.style.display = "none";
}


function addRandomGreeting() {
  const greetings =
    ['I speak Korean and English!', 'I play two instruments: violin and piano!', 'My favorite foods are: pizza, icecream, french fries, and watermelon!', 'I am left-handed!'];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
}