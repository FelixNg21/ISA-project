// const url = "http://saraharch.com/COMP4537/project/flask";
const url = "http://127.0.0.1:5000"

let params = new URLSearchParams(window.location.search);
let username = params.get("username")

const generateImage = (event) => {

  event.preventDefault();

  const prompt = document.getElementById("prompt").value;

  const xhttp = new XMLHttpRequest();

  document.getElementById("loading-icon").style.display = "block";

  xhttp.open('POST', url + '/image', true);
  xhttp.setRequestHeader(
    "Content-Type", "application/json",
    "Access-Control-Allow-Origin", "http://127.0.0.1:5500",
    "Access-Control-Allow-Methods", "*",
    );

  xhttp.send(JSON.stringify({'prompt': prompt}));

  xhttp.responseType = 'blob';

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4){
      document.getElementById("loading-icon").style.display = "none";
      if (this.status == 201){
        console.log(this.response)
        const blob = new Blob([this.response], {type: 'image/png'});
        const imageUrl = URL.createObjectURL(blob);


        console.log(imageUrl);

        document.getElementById("image").onload = function() {
          document.getElementById("image").src = imageUrl;
        }
        document.getElementById("image").src = imageUrl;

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
  }

  

}

// generateImage();