const express = require('express');
const nodeApp = express();
const fs = require("fs");
const path = require("path");
const cors = require('cors');
const bodyParser = require('body-parser');

const FILE_API_SERVER_PORT = 28569;

nodeApp.use(bodyParser.urlencoded({
  extended: true
}));
nodeApp.use(bodyParser.json());
nodeApp.use(cors());

nodeApp.get('/file', (req, res) => {
  const dirPath = req.query.path || '.';
  console.log('get file directory', dirPath);
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      res.send({
        result: false,
        reason: err.toString()
      });
      return;
    }

    const fileList = files.map(name => {
      const filePath = path.join(dirPath, name);
      const stat = fs.statSync(filePath);
      return {
        name: name,
        path: dirPath,
        absolutePath: `${dirPath}/${name}`,
        isDirectory: stat.isDirectory(),
        date: stat.birthtime
      };
    });

    res.send({
      result: false,
      path: dirPath,
      data: fileList
    });
  });
});


nodeApp.get('/file*', (req, res) => {
  console.log('get file detail', req.params);
  if (req.params) {
    const fileName = req.params[0];
    console.log('fileName', fileName);
    fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) {
        res.send({
          result: false,
          reason: err.toString()
        });
        return;
      }

      res.send({
        result: true,
        data: data
      });
    });
    return;
  }

  res.send({
    result: false,
    reason: 'please input parameter.'
  });

});

nodeApp.post('/file', (req, res) => {
  const fileName = req.params ? req.params[0] : undefined;
  const text = req.body.text;
  console.log('file create', req.body);
  writeFile(fileName, text, res);
});

nodeApp.put('/file', (req, res) => {
  const fileName = req.body.fileName;
  const text = req.body.text;
  console.log('file modify', req.body);
  writeFile(fileName, text, res);
});

nodeApp.put('/filename', (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  console.log('file rename', `${from} > ${to}`);

  if (!from || !to) {
    res.send({
      result: false,
      reason: 'please input your from name and to name'
    });
    return;
  }

  fs.rename(from, to, function (err) {
    res.send({
      result: err ? false : true,
      reason: err ? err.toString() : 'done'
    });
  });
});

nodeApp.delete('/file*', (req, res) => {
  const fileName = req.params ? req.params[0] : undefined;
  console.log('file delete', fileName);

  if (!fileName) {
    res.send({
      result: false,
      reason: 'please input your fileName'
    });
    return;
  }

  fs.unlink(fileName, function (err) {
    res.send({
      result: err ? false : true,
      reason: err ? err.toString() : 'done'
    });
  });
});

const writeFile = (fileName, text, res) => {
  if (!fileName || !text) {
    res.send({
      result: false,
      reason: 'please input your fileName and text.'
    });
    return;
  }

  fs.writeFile(fileName, text, 'utf8', (err) => {
    res.send({
      result: err ? false : true,
      reason: err ? err.toString() : 'done'
    });
  });
};

nodeApp.listen(FILE_API_SERVER_PORT);
console.log(`Running server - http://localhost:${FILE_API_SERVER_PORT}`);
