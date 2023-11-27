//CREATE TABLE `isaproject`.`user` (`UserID` INT(5) NOT NULL AUTO_INCREMENT , `Username` VARCHAR(50) NOT NULL , `Password` VARCHAR(50) NOT NULL , PRIMARY KEY (`UserID `)) ENGINE = InnoDB;

let http = require("http");
let express = require("express");
let app = express();
let mysql = require("mysql");
let cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const cookieParser = require('cookie-parser')
// const url = require('url');
const port = process.env.PORT || 5500;
const SECRETKEY = crypto.randomBytes(32).toString("hex");


const version = "v2";

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "isaproject",
});

// let db = mysql.createConnection({
//   host: "localhost",
//   user: 'elainesw_project',
//   password: 'elainesw_isaproject',
//   database: 'elainesw_isaproject'
// });

// connect to database
db.connect(function (err) {
  if (err) throw err;
  console.log("Connected to db!");
});

// app.use(express.json());
// app.use(
//   cors({
//     origin: ["https://felix-ng.com"],
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );

// app.options("*", cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://felix-ng.com");
    res.header("Access-Control-Allow-Methods","*"),
    res.header('Access-Control-Allow-Credentials', "true"),
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Authorization, Accept");
    // next();

    if (req.method === "OPTIONS") {
      res.status(204).end();
    } else {
      next();
    }
}
);

// app.use(express.cookieParser());

// connect to database
db.promise = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, async (err, result) => {
      if (err) {
        // console.log(err);
        reject(new Error());
      } else {
        // console.log(result);
        resolve(result);
      }
    });
  });
};

// generates token
function generateToken(payload) {
  // console.log(payload);
  // console.log(typeof payload)
  return jwt.sign(payload, SECRETKEY, { expiresIn: '1h' });
}

const jwtAuthentication = (req, res, next) => {
  const token = req.cookies.token;
  console.log("token", token)
  try {
      const payload = jwt.verify(token, secretKey);
      console.log("Payload", payload)
      req.payload = payload
      next()
  } catch (err) {
      res.clearCookie('token');
      res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Failed to authenticate token.",
      });
  }
}


// POST login a user
app.post(`/COMP4537/project/${version}/login`, (req, res) => {
  console.log(port);
  console.log("before url");
  console.log(req.url); ///COMP4537/project/v2/login
  // console.log(url)
  // const q = url.parse(req.url, true);
  console.log("after url");

  let data = {
    method: "POST",
    endpoint: req.url,
  };

  let body = "";
  req.on("data", (chunk) => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on("end", async () => {
    let parsedBody = JSON.parse(body);
    console.log("Request origin:", req.headers.origin);
    console.log("in login!");
    console.log(parsedBody);
    let username = parsedBody.username;
    let password = parsedBody.password;
    // hash the password
    let password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("base64");

    // let sql = "SELECT * FROM role where roleid in (SELECT roleid from userrole where userid in (SELECT userid FROM user WHERE Username = ? AND Password = ?))";
    // let sql2 = "SELECT *, role FROM user WHERE Username = ? AND Password = ? LEFT JOIN userrole ON user.UserID = role.UserID AND "
    let sql =
      "SELECT role FROM role JOIN userrole ON role.roleid = userrole.roleid JOIN user ON userrole.userid = user.userid WHERE user.Username = ? AND user.Password = ?";
    db.query(sql, [username, password_hash], async (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const payload = {user: username, pass: password}
        const jwt_token = generateToken(payload)
        console.log("------------------------setting cookie")
        console.log(jwt_token)
        // res.writeHead(201, {'Set-Cookie': `token=${jwt_token}; HttpOnly; Secure; Max-Age=3600`, 'Content-Type': 'application/json'});
        res.cookie('token', jwt_token, {
          path:`/`,
          domain: ".felix-ng.com",
          httpOnly: true, 
          secure:true, 
          maxAge: 360000000, 
          sameSite:"none"});
        console.log("----------------------------- set cookie token")
        res.setHeader('Access-Control-Allow-Origin', "https://felix-ng.com")
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(201).send(JSON.stringify({message:"login successful"}));
        // await axios
        //   .patch(
        //     `https://elainesweb.com/COMP4537/project/${version}/request/update`,
        //     data
        //   )
        //   .then((result_patch) => {
        //     // Assuming successful authentication
        //     console.log("result patch:");
        //     console.log(result_patch);
        //     // res.writeHead(201, {'Content-Type': 'application/json'})
        //     // res.cookie('token', jwt_token, { httpOnly: true} );
        //     res.status(201)
        //       .send(
        //         JSON.stringify({
        //           message: "Login successful",
        //           username: username,
        //           type: result[0].role
        //         })
        //       );
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end("Login failed");
      }
    });
  });
});

// POST register a user
app.post(`/COMP4537/project/${version}/register`, (req, res) => {
 
   
  let data = {
    method: "POST",
    endpoint: req.url,
  };

  let body = "";
  req.on("data", (chunk) => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on("end", async () => {
    let parsedBody = JSON.parse(body);
    console.log("Request origin:", req.headers.origin);
    console.log("in register!");
    console.log(parsedBody);
    let username = parsedBody.username;
    let password = parsedBody.password;
    let password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("base64");

    // hash the password

    let sql = `INSERT INTO user (username, password) VALUES (?, ?)`;
    db.promise(sql, [username, password_hash])
      .then((user_result) => {
        const userid = user_result.insertId;
        console.log("user_result:", user_result);

        const apikey = crypto.randomBytes(32).toString("hex");
        const apikey_sql = `INSERT INTO apikey (apikey, userid) VALUES (?, ?)`;

        if (user_result.affectedRows > 0) {
          const userrole_sql = `INSERT INTO userrole (userid, roleid) VALUES (?, 2)`;
          return db.promise(userrole_sql, [userid]).then((result) => {
            const apikey = crypto.randomBytes(32).toString("hex");
            const apikey_sql = `INSERT INTO apikey (apikey, userid) VALUES (?, ?)`;
            return db.promise(apikey_sql, [apikey, userid]);
          });
        } else {
          throw "Could not insert user";
        }
      })
      .then((apikey_result) => {
        console.log(apikey_result);
        const apikeyid = apikey_result.insertId;

        const apikeycall_sql = `INSERT INTO apikeycall (calls, apikeyid) VALUES (0, ?)`;

        if (apikey_result.affectedRows > 0) {
          return db.promise(apikeycall_sql, [apikeyid]);
        } else {
          throw "Could not insert api key";
        }
      })
      .then(async (apikeycall_result) => {
        console.log(apikeycall_result);

        if (apikeycall_result.affectedRows > 0) {
          await axios
            .patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`,data)
            .then((result_patch) => {
              res
                .status(201)
                .send(
                  JSON.stringify({
                    message: "Registration and apikey creation successful",
                    username: username,
                    type: "user",
                  })
                );
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          throw "Could not insert into api key call";
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
// );g

// GET image generated from prompt
app.get(`/COMP4537/project/${version}/image/:prompt`, jwtAuthentication, async (req, res) => {
  console.log(req.payload)

  let data = {
    "method": "GET",
    "endpoint": req.url
  }

  const prompt = req.params.prompt;

  const url_image_gen = `https://isa-project-eyeessay.hf.space/image/${prompt}`;

  await axios
    .get(url_image_gen, { responseType: "arraybuffer" })
    .then(async (response) => {
      const baseImage = Buffer.from(response.data, "binary").toString("base64");
      await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`, data)
        .then((result_patch) => {
          res.status(200).send({ baseImage });
        })
        .catch((err) => {
          console.log(err);
        })
    })
    .catch((error) => {
      console.log("error:", error.message);
      res.status(500).send("Internal server error");
    });
});

// PATCH user
app.patch(`/COMP4537/project/${version}/user`, async (req, res) => {});

// DELETE user
app.delete(`/COMP4537/project/${version}/unsubscribe`, (req, res) => {});

// SELECT THEN POST (endpoint)
// request: requestid, method, endpoint, requestcalls
app.get(`/COMP4537/project/${version}/endpoint`, jwtAuthentication, async (req, res) => {
  console.log(req.payload)
  let data = {
    "method": "GET",
    "endpoint": req.url
  }
  // const method = req.query.method;
  // const endpoint = req.query.endpoint;

  let sql = "SELECT method, endpoint, requestcount FROM request";
  // let sql = "SELECT * FROM request WHERE method=? AND endpoint=?";
  db.promise(sql)
    .then(async (result) => {
      await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`,data)
        .then((result_patch) => {
          res.status(200).send(result);
        })
        .catch((err) => {
          console.log(err);
        })
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get(`/COMP4537/project/${version}/request`, async (req, res) => {
  const method = req.query.method;
  const endpoint = req.query.endpoint;

  let sql = "SELECT * FROM request WHERE method = ? AND endpoint = ?";
  // let sql = "SELECT * FROM request WHERE method=? AND endpoint=?";
  db.promise(sql, [method, endpoint])
    .then(async (result) => {
      let response = result;
      console.log("result from get raw form line 292");
      console.log(response);
      res.send(response[0]);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.patch(`/COMP4537/project/${version}/request/update`, async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on("end", async () => {
    console.log(body);
    let parsedBody = JSON.parse(body);

    let method = parsedBody.method;
    let endpoint = parsedBody.endpoint;

    console.log(`Patching ${method}: ${endpoint}`);

    await axios
      .get(
        `https://elainesweb.com/COMP4537/project/${version}/request?method=${method}&endpoint=${endpoint}`
      )
      .then((result) => {
        console.log("result from get");
        console.log(result.data);
        let requestid = result.data.requestid;
        let requestcount = result.data.requestcount + 1;

        let sql = "UPDATE request SET requestcount = ? WHERE requestid = ?";
        db.promise(sql, [requestcount, requestid])
          .then((result) => {
            console.log(result);
            res.send(result);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

app.get(`/COMP4537/project/${version}/apiusages`, async (req, res) => {
  console.log("in api usages")
  console.log(req.cookies.token)
  console.log(verifyToken(req.cookies.token))
  let sql = `
  SELECT user.username, apikey.apikeyid, apikeycall.calls FROM user 
  JOIN apikey ON user.userid = apikey.userid 
  JOIN apikeycall ON apikey.apikeyid = apikeycall.apikeyid`

  db.promise(sql)
  .then(async(result) =>{
    res.status(200).send(result)
  })
  .catch(err=> console.log(err));
});

//GET
// username get userid - sarah
app.get(`/COMP4537/project/${version}/user/userid`, async (req, res) => {
  const username = req.query.username;

  let sql = "SELECT userid FROM user WHERE username = ?";
  // let sql = "SELECT * FROM request WHERE method=? AND endpoint=?";
  db.promise(sql, [username])
    .then(async (userid) => {
      await axios.get(`https://elainesweb.com/COMP4537/project/${version}/apikey/apikeyid?userid=${userid}`)
      .then((result) => {
        res.send(result[0]);
      })
      .catch((err) => {
        console.log(err);
      })
    })
    .catch((err) => {
      console.log(err);
    });
});

// having userid, get their apikeyid - elaine
app.get(`/COMP4537/project/${version}/apikey/apikeyid`, async (req, res) => {
  const userid = req.query.userid;

  let sql = "SELECT apikeyid FROM apikey WHERE userid = ?";
  db.promise(sql, [userid])
  .then(async (userid) => {
      await axios.get(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/call?userid=${userid}`)
      .then((result) => {
        let response = result;
        console.log("in apikey/apikeyid", response);
        res.send(response[0]);
      })
    })
    .catch((err) => {
      console.log(err);
    });
});

// from their apikeyid, get their apikeycall calls - felix
app.get(`/COMP4537/project/${version}/apikeycall/call`, async (req, res) => {
  const apikeyid = req.query.apikeyid;
  
  let sql = "SELECT calls FROM apikeycall WHERE apikeyid = ?";
  db.promise(sql, [apikeyid])
  .then(async (result_calls) => {

    let data = {
      "apikeyid": apikeyid, 
      "calls": result_calls
    }

    await axios.get(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/call?userid=${userid}`, data)
    .then(result => {
      let response = result;
      console.log('in apikeycall/call', response);
      res.send(response[0]);
    })
    .catch(err => console.log(err));
  })
  .catch((err) => {
    console.log(err);
  });
});

// (patch) increment the calls from apikeycall table using apikeyid and calls
app.patch(`/COMP4537/project/${version}/apikeycall/inccall`, async (req, res) => {
  
  //SELECT userid FROM user WHERE username = ?
  //"SELECT apikeyid FROM apikey WHERE userid = ?
  // "SELECT calls FROM apikeycall WHERE apikeyid = ?";
  
  let sql_apikeyid_calls = `SELECT apikey.apikeyid, apikeycall.calls FROM user 
  JOIN apikey ON user.userid = apikey.userid 
  JOIN apikeycall ON apikey.apikeyid = apikeycall.apikeyid
  WHERE user.userid = ?`

  let body = "";
  req.on("data", (chunk) => {
    if (chunk !== null) {
      body += chunk;
    }
  });
  req.on("end", async () => {
    // let parsedBody = JSON.parse(body);
    // userid = parsedBody.userid;
    let userid = body;
    db.promise(sql_apikeyid_calls, [userid])
      .then(result => {
        res.send(result);
      })
      .catch(err => console.log(err))
    
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
