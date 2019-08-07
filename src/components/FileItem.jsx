import React from "react";
import FileService from "../service/FileService";
import FolderOpen from "../res/folder_open.png";
import Folder from "../res/folder.png";
import File from "../res/file.png";
import Popup from "./Popup";
import {INDENT_WIDTH} from "../constants/constants";

export class FileItem extends React.Component {
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

  toggleState = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    if (file.isDirectory) {
      const folder = `${path}/${file.name}`;
      FileService.deleteFolder(folder, () => {
        this.props.updateFileList(path);
      });
    } else {
      FileService.deleteFile(`${path}/${file.name}`, (res) => {
        if (!res.result) {
          return;
        }
        this.props.removeFile(path, file.name);
      });
    }

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
        <button className={'menu-btn yellow'}
                disabled={this.state.editMode}
                onClick={this.onEditClick}>rename
        </button>
        <button className={'menu-btn red'}
                disabled={this.state.editMode}
                onClick={this.onDeleteClick}>delete
        </button>
      </p>
    )
  };

  render() {
    const { file, path, depth, isOpen } = this.props;
    const { editMode, fileName, focus, visibleDeletePopup } = this.state;

    return (
      <div key={file.name}
           className={`flex file ${focus ? 'selected' : ''} ${!file.isDirectory ? 'normal' : 'directory'}`}
           style={{ marginLeft: depth * INDENT_WIDTH }}>
        <div className={`flex flex-same-ratio margin-right`} onClick={!editMode ? this.props.onFileClick(file, path) : undefined}>
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
              focus && this.renderButtons()
            }
          </div>
        </div>
        <button className={`file-menu-btn ${focus ? 'close' : 'setting'}`} disabled={editMode} onClick={this.toggleState}/>
        {
          visibleDeletePopup &&
          <Popup visible
                 title={'Confirm'}
                 content={() => <span style={{ fontSize: 'small' }}>Do you really delete it?</span>}
                 okText={'yes'}
                 cancelText={'no'}
                 onConfirm={this.onDeleteConfirm}
                 onCancel={this.onDeleteCancel}/>
        }
      </div>
    );
  }
}