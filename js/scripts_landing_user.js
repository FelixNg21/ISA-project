// const url = "http://saraharch.com/COMP4537/project/flask";
// const url = "http://127.0.0.1:5000"
const version = 'v2'
const url = `https://elainesweb.com/COMP4537/project/${version}/`;

let params = new URLSearchParams(window.location.search);
let username = params.get("username");
document.getElementById("username").innerHTML = "Welcome, " + username + "!";

window.onload = function() {
  getApiKeyCalls();
}

const updateUser = () => {
  

  `<form id="editUserForm">
  <label for="userName">Name:</label>
  <input type="text" id="userName" name="userName" placeholder="Enter your name" required>

  <label for="userEmail">Email:</label>
  <input type="email" id="userEmail" name="userEmail" placeholder="Enter your email" required>

  <button type="submit">Save Changes</button>
</form>`
  
  
}

const deleteUser =() => {
  
  if(confirm("Are you sure you want to Kermit Sewer Slide?")){
    const xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    xhttp.open("DELETE", url + `kermitsewerslide`, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 204) {
          window.location.href = `./login.html`;
        }else{
          console.log(this.status);
          console.log(this.response);
        }
      }
    }
  }

}

const getApiKeyCalls = () => {
  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;

  xhttp.open("GET", url + `apikeycall`, true);
  // xhttp.setRequestHeader("Content-Type", "image/jpeg");
  xhttp.send();
  xhttp.onreadystatechange = function() {
    console.log(this.readyState)
    if (this.readyState == 4) {
      console.log(this.status);
      if (this.status == 200) {
        document.getElementById("calls_made").innerHTML = document.getElementById("calls_made").innerHTML + JSON.parse(this.responseText).calls;
        if (JSON.parse(this.responseText).calls > 20){
          document.getElementById("calls_made").style.color = "red";
          document.getElementById("warning").innerHTML = "Warning, you've maximized your free API calls!";
      }else{
        console.log(this.status);
        console.log(this.responseText);
      }
    }
  } 
}}

const generateImage = () => {
  const prompt = document.getElementById("prompt").value;

  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;

  document.getElementById("loading-icon").style.display = "block";

  xhttp.open("GET", url + `image/${prompt}`, true);
  // xhttp.setRequestHeader("Content-Type", "image/jpeg");
  xhttp.send();
  xhttp.onreadystatechange = function() {
    console.log(this.readyState)
    if (this.readyState == 4) {
      document.getElementById("loading-icon").style.display = "none";
      if (this.status == 200) {
        console.log(this.response);

        const baseImage = JSON.parse(this.response).baseImage;
        document.getElementById("image").src = `data:image/jpeg;base64,${baseImage}`
      }else{
        console.log(this.status);
        console.log(this.response);
      }
    }
  } ;
};


