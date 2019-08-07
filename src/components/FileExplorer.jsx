import React from 'react';
import FileService from "../service/FileService";
import Popup from "./Popup";
import {getRandomNumber} from "../service/Tool";
import {FileItem} from "./FileItem";
import {INDENT_WIDTH} from "../constants/constants";

export default class FileExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleCreate: false,
      selectedPath: undefined
    };
  }

  onCreateClick = (path) => () => {
    this.setState({ selectedPath: path, visibleCreate: true });
  };

  onNewItemClick = () => {
    this.props.newItem(this.state.selectedPath);
    this.onCancel();
  };

  onCreateFolder = () => {
    const folderName = `${this.state.selectedPath}/folder_${getRandomNumber()}`;
    FileService.createFolder(folderName, (res) => {
      if (res.result) {
        this.props.updateFileList(this.state.selectedPath);
      }
    }, () => {
    }, this.onCancel);
  };

  onCancel = () => {
    this.setState({ selectedPath: undefined, visibleCreate: false });
  };

  renderPopupBody = () => {
    return <div>
      <p>Path : <b className={'text-gray'}>{this.state.selectedPath}</b></p>
      <p>a new</p>
      <div className={'flex flex-center-item'}>
        <button className={'btn yellow'} onClick={this.onCreateFolder}>folder</button>
        <button className={'btn ok'} onClick={this.onNewItemClick}>file</button>
      </div>
    </div>
  };

  renderDirInfo = (path, dirInfo, depth = 0, result = []) => {
    const find = dirInfo.find(dir => dir.path === path);
    if (find) {
      result = [...result, ...find.data.map(file => {
        let props = {
          depth,
          path,
          file,
          onFileClick: this.props.onFileClick,
          renameFile: this.props.renameFile,
          removeFile: this.props.removeFile,
          updateFileList: this.props.updateFileList
        };

        if (file.isDirectory) {
          const child = this.renderDirInfo(`${path}/${file.name}`, dirInfo, depth + 1);
          if (child && child.length > 0) {
            props.isOpen = true;
            return [<FileItem key={file.name} {...props}/>, ...child];
          }
        }
        return <FileItem key={file.name} {...props}/>;
      }), this.renderNewItem(path, depth)];
    }
    return result;
  };

  renderNewItem = (path, depth) => {
    return <p className={'new-item'} key={'new'}>
      <button className={'menu-btn green'} onClick={this.onCreateClick(path)}
              style={{ marginLeft: depth * INDENT_WIDTH, opacity : 1 - 0.05 * depth }}>+ create
      </button>
    </p>
  };

  render() {
    const { workingDir, dirInfo } = this.props;

    return (<div className={'file-explorer scroll-y'}>
      {this.renderDirInfo(workingDir, dirInfo)}
      {
        this.state.visibleCreate &&
        <Popup visible
               title={'Create'}
               content={this.renderPopupBody}
               hideOkBtn
               onCancel={this.onCancel}/>
      }
    </div>);
  }
}