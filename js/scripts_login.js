const url = "http://localhost:5500/ISA-project";
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
    // console.log(loggingIn)
    // console.log(url)
    let endpoint = "";
    let xhttp = new XMLHttpRequest();

    username = document.getElementById("usr").value;
    password = document.getElementById("psw").value;
    password_reenter = document.getElementById("psw-repeat").value;

    if(username && password && password_reenter && !loggingIn){
      if (password != password_reenter){
        alert("Passwords do not match");
        return;
      }
      console.log("create account")
      endpoint = '/register';
      
    }else if(username && password && loggingIn){
      //login
      console.log("login")
      endpoint = '/login'
    }else{
      alert("Please fill in all fields");
      return;
    }
   
    const data = {
        "username": username,
        "password": password
    };

    console.log("sending the post request to !!!!", url+endpoint)
    xhttp.open("POST", url+endpoint, true);
    xhttp.setRequestHeader("Content-Type", "application/json",
    "Access-Control-Allow-Origin", "*");
    xhttp.send(JSON.stringify(data));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4){
            if (this.status == 201){
              message = JSON.parse(this.responseText);
                //successful
                if (message.type === 'admin'){ // user
                    console.log("admin successfully logged in")
                    // user landing page
                    window.location.href = `./landing_admin.html?username=${message.username}`;
                }else if (message.type === 'user'){ // admin
                  console.log("user successfully logged in")
                  window.location.href = `./landing_user.html?username=${message.username}`;
                  // redirected to admin landing page
                    // login and checks if admin or regula user
                }
                // navigate to user/admin landing page
              
                
            }
            if (this.status == 401){
              console.log(this.responseText)
                //login failed
            }
        }
    }
}
