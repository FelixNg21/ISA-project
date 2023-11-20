// const url = "http://saraharch.com/COMP4537/project/flask";
// const url = "http://127.0.0.1:5000"
// const url = "https://isa-project-eyeessay.hf.space"
const url = "https://elainesweb.com/COMP4537/project/";

let params = new URLSearchParams(window.location.search);
let username = params.get("username");
document.getElementById("username").innerHTML = "Welcome, " + username + "!";

const generateImage = () => {
  const prompt = document.getElementById("prompt").value;

  const xhttp = new XMLHttpRequest();

  document.getElementById("loading-icon").style.display = "block";

  xhttp.open("GET", url + `image/${prompt}`, true);
  xhttp.setRequestHeader("Content-Type", "image/jpeg");
  xhttp.send();
  xhttp.onreadystatechange = ()=>{
    console.log(this.readyState)
    if (this.readyState == 4) {
      document.getElementById("loading-icon").style.display = "none";
      if (this.status == 200) {
        console.log(this.response);
        // console.log(imageUrl);

        // document.getElementById("image").onload = function() {
        //   document.getElementById("image").src = imageUrl;
        // }
        document.getElementById("image").src = this.response;

        // console.log(this.responseText)ß
        // let response = JSON.parse(this.responseText);
        // let image = response.image_base64;
        // let image_path = response.image_generated_path;
        // console.log(image_path)
        // FOR SOME REASON, the image is not displaying after its being generated, instead the page just refreshes :(
        // document.getElementById("image").src = imageUrl;
        // document.getElementById("image").src = image_path;
      }
    }
  } ;
};
