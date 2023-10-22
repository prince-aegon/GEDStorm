const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
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
let isParserComplete = 0;

const db = new sqlite3.Database("../database.db");

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
  const process = exec(
    "cd .. && parser.exe",
    { signal },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        isParserComplete = 1; // Set the flag to 1 if there was an error
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      isParserComplete = 1; // Set the flag to 1 when execution is successful
    }
  );

  process.on("exit", (code) => {
    if (code === 0) {
      console.log("Parser.exe completed successfully");
    } else {
      console.error("Parser.exe exited with an error");
    }
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

app.get("/data", (req, res) => {
  // Query your SQLite table
  if (isParserComplete == 0) {
    res.status(500).json({ error: "Processing ... " });
  } else {
    const query = "SELECT * FROM Individuals";

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(rows);
      }
    });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
