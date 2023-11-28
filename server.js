let express = require("express");
let app = express();
let mysql = require("mysql");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const { parse } = require("path");
// const url = require('url');
const port = process.env.PORT || 5500;
const SECRETKEY = crypto.randomBytes(32).toString("hex");

const version = "v2";

// let db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "isaproject",
// });

let db = mysql.createConnection({
  host: "localhost",
  user: "elainesw_project",
  password: "elainesw_isaproject",
  database: "elainesw_isaproject",
});

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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://felix-ng.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"),
    res.header("Access-Control-Allow-Credentials", "true"),
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Authorization, Accept"
    );
  res.header("Access-Control-Expose-Headers", "Authorization");
  // next();

  if (req.method === "OPTIONS") {
    res.status(204).end();
  } else {
    next();
  }
});
app.use(cookieParser());


// connect to database
db.promise = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, async (err, result) => {
      if (err) {
        reject(new Error());
      } else {
        resolve(result);
      }
    });
  });
};

// generates token
function generateToken(payload) {
  return jwt.sign(payload, SECRETKEY, { expiresIn: "1h" });
}

const jwtAuthentication = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const payload = jwt.verify(token, SECRETKEY);
    console.log("Payload", payload);
    req.payload = payload;
    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("token");
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Failed to authenticate token.",
    });
  }
};

// POST login a user
app.post(`/COMP4537/project/${version}/login`, (req, res) => {
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
    let username = parsedBody.username;
    let password = parsedBody.password;
    // hash the password
    let password_hash = crypto.createHash("sha256").update(password).digest("base64");
    let sql =
      "SELECT role FROM role JOIN userrole ON role.roleid = userrole.roleid JOIN user ON userrole.userid = user.userid WHERE user.Username = ? AND user.Password = ?";
    db.query(sql, [username, password_hash], async (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const payload = { user: username, pass: password };
        const jwt_token = generateToken(payload);
        res.cookie("token", jwt_token, {
          path: `/`,
          httpOnly: true,
          secure: true,
          maxAge: 3600000,
          sameSite: "none",
        });
        await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`,data)
          .then(async (result_patch) => {
            let inccall_data = {
              username: username,
              password: password_hash,
            };
            await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/inccall`, inccall_data)
              .then((result_inccall) => {
                res.status(201).send(
                  JSON.stringify({
                    message: "Login successful",
                    username: username,
                    type: result[0].role,
                  })
                );
              })
              .catch((err) => console.log(err))})
          .catch((err) => {
            console.log(err);
          });
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
        const apikeyid = apikey_result.insertId;
        const apikeycall_sql = `INSERT INTO apikeycall (calls, apikeyid) VALUES (0, ?)`;
        if (apikey_result.affectedRows > 0) {
          return db.promise(apikeycall_sql, [apikeyid]);
        } else {
          throw "Could not insert api key";
        }
      })
      .then(async (apikeycall_result) => {

        if (apikeycall_result.affectedRows > 0) {
          await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`, data)
            .then(async (result_patch) => {
              let inccall_data = {
                username: username,
                password: password_hash
              }
              await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/inccall`, inccall_data)
              .then(async inccall_result => {
                const payload = { user: username, pass: password };
                const jwt_token = generateToken(payload);
                res.cookie("token", jwt_token, {
                  path: `/`,
                  httpOnly: true,
                  secure: true,
                  maxAge: 3600000,
                  sameSite: "none",
                });
                res.status(201).send(
                  JSON.stringify({
                    message: "Registration and apikey creation successful",
                    username: username,
                    type: "user",
                  })
                );
              })
              .catch(err => console.log(err))
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

// GET image generated from prompt
app.get(`/COMP4537/project/${version}/image/:prompt`,jwtAuthentication,async (req, res) => {
    let data = {
      method: "GET",
      endpoint: req.url,
    };

    let inccall_data = {
      username: req.payload.user,
      password: crypto.createHash("sha256").update(req.payload.pass).digest("base64")
    }

    const prompt = req.params.prompt;
    const url_image_gen = `https://isa-project-eyeessay.hf.space/image/${prompt}`;

    await axios
      .get(url_image_gen, { responseType: "arraybuffer" })
      .then(async (response) => {
        const baseImage = Buffer.from(response.data, "binary").toString(
          "base64"
        );
        await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`,data)
          .then(async (result_patch) => {
            await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/inccall`,inccall_data)
              .then(inccall_result => {
                res.status(200).send({ baseImage });
              })
              .catch(err => console.log(err));
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        console.log("error:", error.message);
        res.status(500).send("Internal server error");
      });
  }
);

// PATCH user
app.patch(`/COMP4537/project/${version}/user`, async (req, res) => {});

// DELETE user 
app.delete(`/COMP4537/project/${version}/kermitsewerslide`, jwtAuthentication, (req, res) => {
  let payload = req.payload;
  let username = payload.user
  let password = crypto.createHash("sha256").update(req.payload.pass).digest("base64")

  let data = {
    method: "DELETE",
    endpoint: req.url
  }

  let sql = "DELETE FROM user WHERE username = ? AND password = ?";
  console.log("in the delete function!!")
  db.promise(sql, [username, password])
  .then(async (result)=>{
    console.log(result);
    console.log(result.affectedRows)
    if (result.affectedRows > 0) {
      await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`, data)
          .then(async (result_patch) => {
            res.status(204).send();
          })
          .catch((err) => {
            console.log(err);
          });
    } else {
      res.status(500).send();
    }
    
  })
});

// SELECT THEN POST (endpoint)
app.get(`/COMP4537/project/${version}/endpoint`, jwtAuthentication, async (req, res) => {
    // console.log("in endpoint, showing payload");
    // console.log(req.payload);
    let data = {
      method: "GET",
      endpoint: req.url,
    };

    let sql = "SELECT method, endpoint, requestcount FROM request";
    db.promise(sql)
      .then(async (result) => {
        await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`, data)
          .then(async (result_patch) => {
            let inccall_data = {
              username: req.payload.user,
              password: crypto.createHash("sha256").update(req.payload.pass).digest("base64")
            }
            await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/inccall`, inccall_data)
              .then(result_update => {
                res.status(200).send(result);
              })
              .catch(err => console.log(err))
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

app.get(`/COMP4537/project/${version}/request`, async (req, res) => {
  const method = req.query.method;
  const endpoint = req.query.endpoint;

  let sql = "SELECT * FROM request WHERE method = ? AND endpoint = ?";
  db.promise(sql, [method, endpoint])
    .then(async (result) => {
      let response = result;
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

    await axios
      .get(
        `https://elainesweb.com/COMP4537/project/${version}/request?method=${method}&endpoint=${endpoint}`
      )
      .then((result) => {
        let requestid = result.data.requestid;
        let requestcount = result.data.requestcount + 1;

        let sql = "UPDATE request SET requestcount = ? WHERE requestid = ?";
        db.promise(sql, [requestcount, requestid])
          .then((result) => {
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

// get the api usages
// pp.patch(`/COMP4537/project/${version}/apikeycall/inccall`, async (req, res) => {
app.get(`/COMP4537/project/${version}/apiusages`, jwtAuthentication, async (req, res) => {
    console.log("in api usages");
    console.log(req.cookies.token);
    let sql = `
      SELECT user.username, apikey.apikeyid, apikeycall.calls FROM user 
      JOIN apikey ON user.userid = apikey.userid 
      JOIN apikeycall ON apikey.apikeyid = apikeycall.apikeyid`;

    let hashed_password = crypto.createHash("sha256").update(req.payload.pass).digest("base64");

    let update_data = {
      method: "GET",
      endpoint: `/COMP4537/project/${version}/apiusages`
    }

    let inccall_data = {
      username: req.payload.user,
      password: hashed_password
    }

    console.log("api usages: just before the axios request ")
    db.promise(sql) // apikeyid, calls 
      .then(async (inccall_result) => {
        await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/request/update`, update_data)
          .then(async update_result => {
            await axios.patch(`https://elainesweb.com/COMP4537/project/${version}/apikeycall/inccall`, inccall_data)
              .then(result_update => {
                res.status(200).send(result);
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
}
);


/** gets the number of calls made for a user */
app.get(`/COMP4537/project/${version}/apikeycall`, jwtAuthentication, (req, res) => {
  let username = req.payload.user
  let hashed_password = crypto.createHash("sha256").update(req.payload.pass).digest("base64");

  //  # calls
  let sql_apikeyid_calls = `SELECT apikeycall.calls as calls FROM user
    JOIN apikey ON user.userid = apikey.userid
    JOIN apikeycall ON apikey.apikeyid = apikeycall.apikeyid
    WHERE user.username = ? AND user.password = ?`;
  db.promise(sql_apikeyid_calls, [username, hashed_password])
    .then(result => {
      let response = {
        "calls": result[0].calls
      }
      res.status(200).send(response)
    })
    .catch(err => console.log(err));

});



// (patch) increment the calls from apikeycall table using apikeyid and calls
app.patch(`/COMP4537/project/${version}/apikeycall/inccall`, async (req, res) => {
    console.log("in inncaallalll")
    //gets apikeyid and # calls
    let sql_apikeyid_calls = `SELECT apikey.apikeyid as apikeyid, apikeycall.calls as calls FROM user
    JOIN apikey ON user.userid = apikey.userid
    JOIN apikeycall ON apikey.apikeyid = apikeycall.apikeyid
    WHERE user.username = ? AND user.password = ?`;

    let body = "";
    req.on("data", (chunk) => {
      if (chunk !== null) {
        body += chunk;
      }
    });
    req.on("end", async () => {
      let parsedBody = JSON.parse(body);
      console.log("body:")
      console.log(body)
      console.log("parsedbody:")
      console.log(parsedBody)
      let username = parsedBody.username;
      let password = parsedBody.password;

      console.log("password sent over via data in inccall")
      console.log(parsedBody.password)

      db.promise(sql_apikeyid_calls, [username, password])
        //result = apikeyid, calls [{apikeyid,calls}]
        .then((result) => {
          let apikeyid = result[0].apikeyid;
          let apikeycalls = result[0].calls + 1;
          let sql_patch = `UPDATE apikeycall SET calls = ? WHERE apikeyid = ?`;
          db.promise(sql_patch, [apikeycalls, apikeyid])
            .then((result_patch) => {
              res.send(result_patch);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    });
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
