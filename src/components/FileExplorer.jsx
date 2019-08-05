import React from 'react';
import FileService from "../service/FileService";
import File from '../res/file.png';
import Folder from '../res/folder.png';
import FolderOpen from '../res/folder_open.png';
import Popup from "./Popup";

const INDENT_WIDTH = 25;

export default class FileExplorer extends React.Component {
  onNewItemClick = (path) => () => {
    this.props.newItem(path);
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
          removeFile: this.props.removeFile
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
      <button className={'menu-btn green'} onClick={this.onNewItemClick(path)}
              style={{ marginLeft: depth * INDENT_WIDTH }}>+ create
      </button>
    </p>
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
      visibleDeletePopup: false
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

  renderFileName = (editMode, focus, fileName) => (
    editMode ?
      <>
        <input className={'edit'} value={fileName} onChange={this.onTextChange} onKeyDown={this.onKeyDown}/>
        <button className={'edit-confirm-btn'} onClick={this.onEditConfirm}> ✔</button>
      </> :
      <span> {fileName}</span>
  );

  renderButtons = () => {
    return (
      <p className={'no-margin'}>
        <button className={'menu-btn yellow'} onClick={this.onEditClick}>rename</button>
        <button className={'menu-btn red'} onClick={this.onDeleteClick}>delete</button>
      </p>
    )
  };

  render() {
    const { file, path, depth, isOpen } = this.props;
    const { editMode, fileName, focus, visibleDeletePopup } = this.state;

    return (
      <div key={file.name}
           className={`flex file ${focus ? 'selected' : ''} ${!file.isDirectory ? 'normal' : 'directory'}`}
           onClick={file.isDirectory ? this.props.onFileClick(file, path) : this.toggleState}
           style={{ marginLeft: depth * INDENT_WIDTH }}>
        <img className={'file-icon'} alt={fileName} src={file.isDirectory ? isOpen ? FolderOpen : Folder : File}/>
        <div className={'flex-same-ratio'}>
          {this.renderFileName(editMode, focus, fileName)}
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
            <p className={'open-btn'} onClick={this.props.onFileClick(file, path)}/>
          </div>
        }
        {
          visibleDeletePopup &&
          <Popup visible
                 title={'확인'}
                 content={()=> <span style={{fontSize:'small'}}>정말로 삭제하시겠습니까?</span>}
                 onConfirm={this.onDeleteConfirm}
                 onCancel={this.onDeleteCancel}/>
        }
      </div>
    );
  }
}