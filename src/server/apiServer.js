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
nodeApp.post('/directory', (req, res) => {
    const dirPath = req.body.path || '.';
    console.log('directory', req.body);
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
            return {name: name, isDirectory: stat.isDirectory()};
        });

        res.send({
            result: false,
            path: dirPath,
            data: fileList
        });
    });
});

nodeApp.listen(FILE_API_SERVER_PORT);
console.log(`Running server - http://localhost:${FILE_API_SERVER_PORT}`);
