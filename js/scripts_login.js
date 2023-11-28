const version = 'v2'
const url = `https://elainesweb.com/COMP4537/project/${version}`;
let loggingIn = true;

function swapForm() {
    loggingIn = !loggingIn;
    document.getElementById('formtype').innerHTML = loggingIn ? 'Login' : 'Register'
    document.getElementById('register_pwd').style.display = loggingIn ? 'none' : 'block';
    document.getElementById('go').innerHTML = loggingIn ? 'Sign In' : 'Register';
    document.getElementById('question').innerHTML = loggingIn ? `Don't have an account?` : 'Already have an account?';
    document.getElementById('switch').innerHTML = loggingIn ? 'Register' : 'Login';
}

function submit(){
    let endpoint = "";
    let xhttp = new XMLHttpRequest();
    xhttp.withCredentials = true;
    username = document.getElementById("usr").value;
    password = document.getElementById("psw").value;
    password_reenter = document.getElementById("psw-repeat").value;

    if(username && password && password_reenter && !loggingIn){
      if (password != password_reenter){
        alert("Passwords do not match");
        return;
      }
      endpoint = '/register';
      
    }else if(username && password && loggingIn){
      endpoint = '/login'
    }else{
      alert("Please fill in all fields");
      return;
    }
   
    const data = {
        "username": username,
        "password": password
    };
    xhttp.open("POST", url+endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application/json",
    "Access-Control-Allow-Credentials", "true");
    xhttp.send(JSON.stringify(data));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4){
            if (this.status == 201){
              message = JSON.parse(this.responseText);
              let token = xhttp.getResponseHeader("Authorization");
                //successful
                if (message.type === 'admin'){ 
                  window.location.href = `./landing_admin.html?username=${message.username}`;
                }else if (message.type === 'user'){ 
                  window.location.href = `./landing_user.html?username=${message.username}`;
                }
  
            }
            if (this.status == 401){
              console.log(this.responseText)
                //login failed
            }
        }
    }
}


