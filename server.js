//CREATE TABLE `isaproject`.`user` (`UserID` INT(5) NOT NULL AUTO_INCREMENT , `Username` VARCHAR(50) NOT NULL , `Password` VARCHAR(50) NOT NULL , PRIMARY KEY (`UserID `)) ENGINE = InnoDB;

let http = require('http');
let express = require('express');
let app = express();
let mysql = require('mysql');
let cors = require('cors');
const crypto = require('crypto');
const axios = require('axios')

let db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'isaproject'
});

// connect to database
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to db!");
});

// app.use(express.json());
app.use(cors({
  origin: 'https://felix-ng.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // credentials: true,
  optionsSuccessStatus: 204,
}));
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://felix-ng.com");
//     res.header("Access-Control-Allow-Methods","*")
//     res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
//     // next();

//     if (req.method === "OPTIONS") {
//       res.status(204).end();
//     } else {
//       next();
//     }
// }
// )


app.post("/COMP4537/project/login", function(req, res) {
  let body = '';
  req.on('data', chunk => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on('end', async () => {
    let parsedBody = JSON.parse(body);
    console.log('Request origin:', req.headers.origin);
    console.log("in login!");
    console.log(parsedBody);
    let username = parsedBody.username;
    let password = parsedBody.password;
    // hash the password
    let password_hash = crypto.createHash('sha256').update(password).digest('base64');


    // let sql = "SELECT * FROM role where roleid in (SELECT roleid from userrole where userid in (SELECT userid FROM user WHERE Username = ? AND Password = ?))";
    // let sql2 = "SELECT *, role FROM user WHERE Username = ? AND Password = ? LEFT JOIN userrole ON user.UserID = role.UserID AND "
    let sql = 'SELECT role FROM role JOIN userrole ON role.roleid = userrole.roleid JOIN user ON userrole.userid = user.userid WHERE user.Username = ? AND user.Password = ?';
    db.query(sql, [username, password_hash], function(err, result) {
      console.log(result[0].role)
        if (err) throw err;
        if (result.length > 0) {
            // res.writeHead(201, {'Content-Type': 'application/json'})
            res.status(201).send(JSON.stringify(
              {message:"Login successful",
              username: username,
              type: result[0].role
            })); 
        } else {
            res.writeHead(401, {'Content-Type': 'application/json'})
            res.end("Login failed");
        }
    })

  });
})

app.post("/COMP4537/project/register", function(req, res) {
  let body = '';
  req.on('data', chunk => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on('end', async () => {
    let parsedBody = JSON.parse(body);
    console.log('Request origin:', req.headers.origin);
    console.log("in register!");
    console.log(parsedBody);
    let username = parsedBody.username;
    let password = parsedBody.password;
    let password_hash = crypto.createHash('sha256').update(password).digest('base64');

    // hash the password
    
    let sql = "INSERT INTO user (Username, Password) VALUES (?, ?)";
    db.query(sql, [username, password_hash], function(err, result) {
      console.log("error", err)
      console.log("result", result)
        if (err) {
          throw err;
        }
        // res.writeHead(201, {'Content-Type': ''})
        res.status(201).send(JSON.stringify(
          {message:"Registration successful",
          username: username,
          type: 'user'
        })); 
    })
    
  });
})

app.get("/COMP4537/project/image/:prompt", async function(req, res) {
  console.log(req.headers.origin);

  const prompt = req.params.prompt;

  const url = `https://isa-project-eyeessay.hf.space/image/${prompt}`;

  const imageResponse = await axios.get(url, { 
    responseType: 'arraybuffer' 
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Content-Type", 'image/jpeg');
  res.status(200).send(imageResponse.data);

})

app.delete("/unsubscribe", function(req, res) {
  


  
})

const port = process.env.PORT || 5500;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});