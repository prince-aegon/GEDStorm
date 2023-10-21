const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
var cors = require("cors");
const multipart = require("connect-multiparty");
const fs = require("fs");
const { exec } = require("child_process");
const controller = new AbortController();
const { signal } = controller;
const multipartMiddleware = multipart({
  uploadDir: "./uploads",
});
let uploadFile;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.post("/api/upload", multipartMiddleware, (req, res) => {
  if (res.statusCode === 200) {
    res.json({
      message: "File uploaded succesfully.",
    });
  } else {
    res.json({
      message: "File failed.",
    });
  }

  uploadFile = req.files;
  const jsonString = JSON.stringify(uploadFile);
  fs.writeFile("./data.json", jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });
  exec("cd .. && parser.exe", { signal }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});

app.get("/api/upload", (req, res) => {
  res.json({
    message: "hello",
  });
});

app.get("/datapoint001", (req, res) => {
  let data = "hello world";
  res.send(JSON.stringify(data));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
