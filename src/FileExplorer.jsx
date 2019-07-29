import React from 'react';
import FileService from "./service/FileService";
import File from './res/file.png';
import Folder from './res/folder.png';


const workingDir = '/Users/igadmp/Documents';

export default class FileExplorer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            dirInfo: []
        };
    }

    componentWillMount() {
        this.setState({
            loading: true
        });

        FileService.getDirectory(workingDir,
            this.responseList,
            this.error,
            this.complete);
    }

    responseList = (res) => {

        console.log(res);
        this.setState(prev => ({
                dirInfo: [...prev.dirInfo,
                    {
                        path: res.path,
                        data: res.data.reverse().reduce((all, file) => file.isDirectory ? [file, ...all] : [...all, file], [])
                    }]
            })
        );
    };

    error = (err) => {
        console.log(err);
    };

    complete = () => {
        this.setState({
            loading: false
        });
    };

    onFileClick = (file, path) => () => {
        const {dirInfo} = this.state;

        if (file.isDirectory) {
            const clickPath = `${path}/${file.name}`;
            const find = dirInfo.find(dir => dir.path === clickPath);
            if (find) {
                this.setState({
                    dirInfo: dirInfo.filter(dir => dir.path !== clickPath)
                });
            } else {
                FileService.getDirectory(clickPath,
                    this.responseList,
                    this.error,
                    this.complete);
            }
        } else {
            //Todo 에디트
        }
    };

    renderDirInfo = (path, dirInfo, depth = 0, result = []) => {
        const find = dirInfo.find(dir => dir.path === path);
        if (find) {
            result = [...result, ...find.data.map(file => {
                const item = <FileItem key={file.name} depth={depth} path={path} file={file}
                                       onFileClick={this.onFileClick}/>;
                if (file.isDirectory) {
                    const child = this.renderDirInfo(`${path}/${file.name}`, dirInfo, depth + 1);
                    if (child) {
                        return [item, ...child];
                    }
                }
                return item;
            })];
        }
        return result;
    };

    render() {
        const {dirInfo} = this.state;

        return (<div className={'file-explorer'}>
            {this.renderDirInfo(workingDir, dirInfo)}
        </div>);
    }
}

class FileItem extends React.PureComponent {
    render() {
        const {file, path, depth} = this.props;
        return (
            <p key={file.name}
               className={`no-margin file ${file.isDirectory && 'directory'}`}
               onClick={this.props.onFileClick(file, path)}
               style={{paddingLeft: depth * 20}}>
                <img className={'file-icon'} src={file.isDirectory ? Folder : File}/>
                {file.isDirectory ? <b>{file.name}</b> : <span>{file.name}</span>}
            </p>
        )
    }
}