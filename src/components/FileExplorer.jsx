import React from 'react';
import FileService from "../service/FileService";
import File from '../res/file.png';
import Folder from '../res/folder.png';
import Popup from "./Popup";

export default class FileExplorer extends React.Component {
  onNewItemClick = (path) => () => {
    this.props.newItem(path);
  };

  renderDirInfo = (path, dirInfo, depth = 0, result = []) => {
    const find = dirInfo.find(dir => dir.path === path);
    if (find) {
      result = [...result, ...find.data.map(file => {
        const item = <FileItem key={file.name} depth={depth} path={path} file={file}
                               onFileClick={this.props.onFileClick}
                               renameFile={this.props.renameFile}
                               removeFile={this.props.removeFile}/>;
        if (file.isDirectory) {
          const child = this.renderDirInfo(`${path}/${file.name}`, dirInfo, depth + 1);
          if (child) {
            return [item, ...child];
          }
        }
        return item;
      }), this.renderNewItem(path, depth)];
    }
    return result;
  };

  renderNewItem = (path, depth) => {
    return <button key={'new'} onClick={this.onNewItemClick(path)} style={{ marginLeft: depth * 20 }}>새 글쓰기</button>
  };

  render() {
    const { workingDir, dirInfo } = this.props;

    return (<div className={'file-explorer'}>
      {this.renderDirInfo(workingDir, dirInfo)}
    </div>);
  }
}

class FileItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: props.file.name,
      editMode: false,
      focus: false,
      visibleDeletePopup : false
    }
  }

  onEditConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { file, path } = this.props;
    const { fileName } = this.state;

    this.setState({
      editMode: false
    });

    FileService.renameFile(`${path}/${file.name}`, `${path}/${fileName}`, (res) => {
      if (!res.result) {
        this.setState({
          fileName: file.name
        });
        return;

      }
      this.props.renameFile(path, file.name, fileName);
    });
  };

  toggleState = () => {
    if (this.state.editMode) {
      return;
    }

    this.setState(prev => ({
      focus: !prev.focus
    }));
  };

  onTextChange = (e) => {
    this.setState({
      fileName: e.target.value
    });
  };

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.onEditConfirm(e);
    }
  };

  onEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      editMode: true
    });
  };

  onDeleteConfirm = () => {
    const { file, path } = this.props;
    FileService.deleteFile(`${path}/${file.name}`, (res) => {
      if (!res.result) {
        return;
      }
      this.props.removeFile(path, file.name);
    });
    this.onDeleteCancel();
  };

  onDeleteCancel = () => {
    this.setState({
      visibleDeletePopup: false
    });
  };

  onDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      visibleDeletePopup: true
    });
  };

  renderFileName = (editMode, fileName) => (
    editMode ?
      <>
        <input value={fileName} onChange={this.onTextChange} onKeyDown={this.onKeyDown}/>
        <button onClick={this.onEditConfirm}>완료</button>
      </> :
      <span>{fileName}</span>
  );

  renderButtons = () => {
    return (
      <p className={'no-margin'}>
        <button onClick={this.onEditClick}>이름변경</button>
        <button onClick={this.onDeleteClick}>삭제</button>
      </p>
    )
  };

  render() {
    const { file, path, depth } = this.props;
    const { editMode, fileName, focus, visibleDeletePopup } = this.state;

    return (
      <div key={file.name}
           className={`flex file ${file.isDirectory && 'directory'}`}
           onClick={file.isDirectory ? this.props.onFileClick(file, path) : this.toggleState}
           style={{ paddingLeft: depth * 20, border: focus ? '1px solid #ff0' : 0 }}>
        <img className={'file-icon'} src={file.isDirectory ? Folder : File}/>
        <div className={'flex-same-ratio'}>
          {this.renderFileName(editMode, fileName)}
          {
            !file.isDirectory &&
            <p className={'no-margin time'}>
              {new Date(file.date).toLocaleString()}
            </p>
          }
          {
            !file.isDirectory && focus && this.renderButtons()
          }
        </div>
        {
          !file.isDirectory && <div>
            <button onClick={this.props.onFileClick(file, path)}>></button>
          </div>
        }
        {
          visibleDeletePopup &&
          <Popup visible
                 title={'삭제 확인'}
                 content={'정말로 삭제하시겠습니까?'}
                 onConfirm={this.onDeleteConfirm}
                 onCancel={this.onDeleteCancel}/>
        }
      </div>
    );
  }
}