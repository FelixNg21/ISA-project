// const url = "http://saraharch.com/COMP4537/project/flask";
// const url = "http://127.0.0.1:5000"
const version = 'v2'
const url = `https://elainesweb.com/COMP4537/project/${version}`;

let params = new URLSearchParams(window.location.search);
let username = params.get("username");
document.getElementById("username").innerHTML = "Welcome, " + username + "!";

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
