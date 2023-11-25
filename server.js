//CREATE TABLE `isaproject`.`user` (`UserID` INT(5) NOT NULL AUTO_INCREMENT , `Username` VARCHAR(50) NOT NULL , `Password` VARCHAR(50) NOT NULL , PRIMARY KEY (`UserID `)) ENGINE = InnoDB;

let http = require('http');
let express = require('express');
let app = express();
let mysql = require('mysql');
let cors = require('cors');
const crypto = require('crypto');
const axios = require('axios')
const fs = require('fs');

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

app.options('*', cors());
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

db.promise = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.log(err);
        reject(new Error());
      }
      else {
        console.log(result);
        resolve(result);
      }
    })
  })
};

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
    
    let sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
    db.promise(sql, [username, password_hash])
      .then((user_result) => {
      const userid = user_result.insertId;
      console.log("user_result:", user_result)

      const apikey = crypto.randomBytes(32).toString('hex');
      const apikey_sql = `INSERT INTO apikey (apikey, userid) VALUES (?, ?)`;

      if (user_result.affectedRows > 0) {
        const userrole_sql = `INSERT INTO userrole (userid, roleid) VALUES (?, 2)`;
        return db.promise(userrole_sql, [userid])
          .then((result) => {
            const apikey = crypto.randomBytes(32).toString('hex');
            const apikey_sql = `INSERT INTO apikey (apikey, userid) VALUES (?, ?)`;
            return db.promise(apikey_sql, [apikey, userid])
          });;
      } else {
        throw 'Could not insert user';
      }
    }).then((apikey_result) => {
        console.log(apikey_result)
        const apikeyid = apikey_result.insertId;

        const apikeycall_sql = `INSERT INTO apikeycall (calls, apikeyid) VALUES (0, ?)`;

        if (apikey_result.affectedRows > 0) {
          return db.promise(apikeycall_sql, [apikeyid]);
        } else {
          throw 'Could not insert api key';
        }
      }).then((apikeycall_result) => {
        console.log(apikeycall_result)

        if (apikeycall_result.affectedRows > 0) {
          res.status(201).send(JSON.stringify(
            {message:"Registration and apikey creation successful }",
            username: username,
            type: 'user'
          })); 
        } else {
          throw 'Could not insert into api key call'
        }
      })
      .catch((err) => {
        console.log(err);
      })
      });

    });

    //old
    // db.query(sql, [username, password_hash], function(err, result) {
    //   console.log("error", err)
    //   console.log("result", result)
    //     if (err) {
    //       throw err;
    //     }
    //     // res.writeHead(201, {'Content-Type': ''})
    //     res.status(201).send(JSON.stringify(
    //       {message:"Registration successful",
    //       username: username,
    //       type: 'user'
    //     })); 
    // }).then(() => {
      
    
    // }
    // );

app.get("/COMP4537/project/image/:prompt", async function(req, res) {
  console.log(req.headers.origin);

  const prompt = req.params.prompt;

  const url = `https://isa-project-eyeessay.hf.space/image/${prompt}`;

  await axios.get(url, { responseType: 'arraybuffer' })
  .then(response => {
    const baseImage = Buffer.from(response.data, 'binary').toString('base64');
    res.status(200).send({ baseImage });
  })
  .catch(error => {
    console.log("error:", error.message);
    res.status(500).send("Internal server error");
  })

})

app.delete("/unsubscribe", function(req, res) {
  


  
})

const port = process.env.PORT || 5500;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});