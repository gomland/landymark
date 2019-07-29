const FILE_API_SERVER_PORT = 28569;
const apiServer = `http://localhost:${FILE_API_SERVER_PORT}`;

class FileService {
    getDirectory = (path, res, err, complete) => {
        this.post('/directory', {path}, res, err, complete);
    };

    post = (route, body, responseCallback, err, complete) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiServer + route, true);
        xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
        xhr.onload = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    responseCallback(JSON.parse(xhr.response));
                } else {
                    err(JSON.parse(xhr.response));
                }
                complete();
            }
        };
        xhr.send(JSON.stringify(body));
    };
}

export default new FileService();