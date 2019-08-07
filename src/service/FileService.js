const FILE_API_SERVER_PORT = 28569;
const apiServer = `http://localhost:${FILE_API_SERVER_PORT}`;

class FileService {
  getDirectory = (filePath, res, err, complete) => {
    const path = `${apiServer}/file?path=${encodeURIComponent(filePath)}`;
    this.get(path, res, err, complete);
  };

  readFile = (absolutePath, res, err, complete) => {
    const path = `${apiServer}/file/${encodeURIComponent(absolutePath)}`;
    this.get(path, res, err, complete);
  };

  getImagePath = (absolutePath) => {
    return `${apiServer}/image/${encodeURIComponent(absolutePath)}`;
  };

  createFile = (absolutePath, text, res, err, complete) => {
    this.other(`${apiServer}/file/${encodeURIComponent(absolutePath)}`,
      { text }, res, err, complete, 'PUT');
  };

  renameFile = (from, to, res, err, complete) => {
    this.other(`${apiServer}/filename`,
      { from, to }, res, err, complete, 'PUT');
  };

  deleteFile = (absolutePath, res, err, complete) => {
    this.other(`${apiServer}/file/${encodeURIComponent(absolutePath)}`,
      {}, res, err, complete, 'DELETE');
  };

  writeFile = (absolutePath, text, res, err, complete) => {
    this.other(`${apiServer}/file`, {
      fileName: absolutePath,
      text
    }, res, err, complete, 'PUT');
  };

  createFolder = (absolutePath, res, err, complete) => {
    this.other(`${apiServer}/folder/${encodeURIComponent(absolutePath)}`,
      {},res, err, complete, 'POST');
  };

  deleteFolder = (absolutePath, res, err, complete) => {
    this.other(`${apiServer}/folder/${encodeURIComponent(absolutePath)}`,
      {},res, err, complete, 'DELETE');
  };

  get = (path, responseCallback, err, complete) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onload = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          responseCallback(JSON.parse(xhr.response));
        } else {
          err && err(JSON.parse(xhr.response));
        }
        complete && complete();
      }
    };
    xhr.send();
  };

  other = (path, body, responseCallback, err, complete, method = 'POST') => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onload = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          responseCallback(JSON.parse(xhr.response));
        } else {
          err && err(JSON.parse(xhr.response));
        }
        complete && complete();
      }
    };
    xhr.send(JSON.stringify(body));
  };
}

export default new FileService();