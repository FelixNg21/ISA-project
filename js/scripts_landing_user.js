const version = 'v2'
const url = `https://elainesweb.com/COMP4537/project/${version}/`;

let params = new URLSearchParams(window.location.search);
let username = params.get("username");
document.getElementById("username").innerHTML = "Welcome " + username + " !";

window.onload = function() {
  getApiKeyCalls();
}

// toggles the form to edit user info
const showUserForm = () => {
  let form = document.getElementById("editUserForm")
  if (form.style.display == "block"){
    form.style.display = 'none';
  } else{
    form.style.display = "block"
  }
}

// updates the user info
const updateUser = (event) => {
  event.preventDefault();
  let form = document.getElementById("editUserForm");
  form.style.display = "block";
  let newUsername = document.getElementById("userName").value;
  let newPassword = document.getElementById("userPass").value;
  let confirmPassword = document.getElementById("userPassConfirm").value;

  if (newPassword != confirmPassword){
    alert("Passwords do not match");
    return;
  }

  let user = {
    username: newUsername,
    password: newPassword
  }

  const xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  xhttp.open("PUT", url + `user/update`, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(user));
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Congrats on your new name and password!");
        form.style.display = "none";
        form.reset()
        document.getElementById("username").innerHTML = "Welcome, " + newUsername + "!";
        
      }else{
        console.log(this.status);
        console.log(this.response);
      }
    }
  }
  
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
  xhttp.send();
  xhttp.onreadystatechange = function() {
    console.log(this.readyState)
    if (this.readyState == 4) {
      console.log(this.status);
      if (this.status == 200) {
        document.getElementById("calls_made").innerHTML = document.getElementById("calls_made").innerHTML + JSON.parse(this.responseText).calls;
        if (JSON.parse(this.responseText).calls > 20){
          document.getElementById("calls_made").style.color = "red";
          document.getElementById("warning").innerHTML = "Warning you have used up your free API calls!";
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
  xhttp.send();
  xhttp.onreadystatechange = function() {
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


