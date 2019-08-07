import React from 'react';
import FileExplorer from "./components/FileExplorer";
import Editor from "./components/Editor";
import Navigator from "./components/Navigator";
import './global.css';
import FileService from "./service/FileService";
import FileData from "./data/FileData";
import TitleBar from "./components/TitleBar";
import {getRandomNumber} from "./service/Tool";
import {DEFAULT_DIR, DEFAULT_FILE_NAME} from "./constants/constants";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workingDir: localStorage.getItem('working_dir') || DEFAULT_DIR,
      dirInfo: [],
      navigatorList: [],
      visibleFileExplorer: true,
      selectFile: undefined
    };
  }

  componentWillMount() {
    this.updateFileList(this.state.workingDir);
  }

  toggleVisibleFileExplorer = () => {
    this.setState(prev => ({
      visibleFileExplorer: !prev.visibleFileExplorer
    }));
  };

  onChangeWorkspace = (nextDir) => {
    localStorage.setItem('working_dir', nextDir);

    this.setState({
      dirInfo: [],
      workingDir: nextDir
    });

    this.updateFileList(nextDir);
  };

  updateFileList = (dir) => {
    FileService.getDirectory(dir,
      this.responseList);
  };

  responseList = (res) => {
    if (!res.data) {
      return;
    }

    this.appendDirInfo({
      path: res.path,
      data: res.data.reverse().reduce((all, file) =>
          file.isDirectory ?
            [file, ...all] :
            /.md/.exec(file.name) ? [...all, file] : all
        , [])
    });
  };

  appendDirInfo = (newDirInfo) => {
    const { dirInfo } = this.state;
    const find = dirInfo.find(d => d.path === newDirInfo.path);

    let nextDirInfo;
    if (find) {
      nextDirInfo = dirInfo.map(d => d.path === newDirInfo.path ? newDirInfo : d);
    } else {
      nextDirInfo = [...dirInfo, newDirInfo];
    }

    this.setState({
      dirInfo: nextDirInfo
    });
  };

  pickItem = (fileData) => {
    const { navigatorList } = this.state;
    const find = navigatorList.find(f => f.absolutePath === fileData.absolutePath);
    console.log(navigatorList, find);

    if (find) {
      this.setSelectedItem(find);
      return;
    }

    this.setState({
      navigatorList: [...navigatorList, fileData],
      selectFile: fileData
    });
  };

  setSelectedItem = fileData => {
    this.setState({
      selectFile: fileData
    });
  };

  onFileClick = (file, path) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { dirInfo } = this.state;

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
      let fileData = new FileData();
      fileData.name = file.name;
      fileData.absolutePath = `${path}/${file.name}`;
      fileData.path = path;
      FileService.readFile(fileData.absolutePath,
        this.responseReadFile(fileData),
        this.error,
        this.complete);
    }
  };

  responseReadFile = (fileData) => (res) => {
    if (res.result) {
      fileData.text = res.data;
      this.pickItem(fileData);
    }
  };

  updateNavigatorItem = (fileData, state = {}) => {
    if (!fileData) {
      return;
    }

    const { navigatorList } = this.state;
    const nextFileData = {
      ...fileData,
      ...state
    };

    this.setState({
      navigatorList: navigatorList.map(f => f.absolutePath === fileData.absolutePath ? nextFileData : f)
    });
  };

  saveItem = (fileData, nextContent) => {
    if (!fileData) {
      return;
    }

    this.saveFile(fileData, nextContent, fileData.isNew);
  };

  removeNavigatorItem = (fileData) => {
    const nextList = this.state.navigatorList.filter(f => f !== fileData);
    this.setState({
      navigatorList: nextList,
      selectFile: nextList.length > 0 ? nextList[nextList.length - 1] : undefined
    });
  };

  renameFile = (path, fromFileName, toFileName) => {
    const { dirInfo, navigatorList } = this.state;

    const nextDirInfo = dirInfo.map(dir => {
      if (dir.path === path) {
        const nextData = dir.data.map(f => f.name === fromFileName ? { ...f, name: toFileName } : f);
        return {
          path,
          data: nextData
        }
      }
      return dir;
    });

    const fromPath = `${path}/${fromFileName}`;
    this.setState({
      dirInfo: nextDirInfo,
      navigatorList: navigatorList.map(f => f.absolutePath === fromPath ? {
        ...f,
        absolutePath: `${path}/${toFileName}`,
        name: toFileName
      } : f)
    });
  };

  removeFile = (path, name) => {
    const { dirInfo, navigatorList } = this.state;

    const nextDirInfo = dirInfo.map(dir => {
      if (dir.path === path) {
        const nextData = dir.data.filter(f => f.name !== name);
        return {
          path,
          data: nextData
        }
      }
      return dir;
    });

    const nextList = navigatorList.filter(f => f.absolutePath !== `${path}/${name}`);

    this.setState({
      dirInfo: nextDirInfo,
      navigatorList: nextList,
      selectFile: nextList.length > 0 ? nextList[nextList.length - 1] : undefined
    });
  };

  newItem = (path) => {
    const { navigatorList } = this.state;
    const fileName = `${DEFAULT_FILE_NAME}_${getRandomNumber()}.md`;

    const fileData = new FileData();
    fileData.absolutePath = `${path}/${fileName}`;
    fileData.name = fileName;
    fileData.isNew = true;
    fileData.date = new Date();
    fileData.path = path;

    this.setState({
      navigatorList: [...navigatorList, fileData],
      selectFile: fileData
    });
  };

  saveFile = (fileData, nextContent, isAddList = false) => {
    const nextFileData = {
      ...fileData,
      text: nextContent, isNew: false, isModify: false
    };

    FileService.writeFile(nextFileData.absolutePath, nextFileData.text, (res) => {
      if (!res.result) {
        return;
      }

      if (isAddList) {
        const nextDirInfo = this.state.dirInfo.map(dir => {
          if (dir.path === nextFileData.path) {
            return {
              path: dir.path,
              data: [...dir.data, nextFileData]
            }
          }
          return dir;
        });

        this.setState({
          dirInfo: nextDirInfo,
          selectFile: nextFileData
        });
      }

      this.updateNavigatorItem(nextFileData);
    })
  };

  render() {
    const { dirInfo, navigatorList, selectFile, workingDir, visibleFileExplorer } = this.state;

    return (
      <div className={'root'}>
        <div className={'full-height flex-ori-vertical flex-same-ratio'}>
          <TitleBar workingDir={workingDir}
                    onChangeWorkspace={this.onChangeWorkspace}/>
          <div className={'flex flex-same-ratio'} style={{ overflowY: 'hidden' }}>
            {
              visibleFileExplorer &&
              <FileExplorer workingDir={workingDir}
                            dirInfo={dirInfo}
                            newItem={this.newItem}
                            updateFileList={this.updateFileList}
                            renameFile={this.renameFile}
                            removeFile={this.removeFile}
                            onFileClick={this.onFileClick}/>
            }
            <div className={'flex file-hide'}>
              <button onClick={this.toggleVisibleFileExplorer}>{visibleFileExplorer ? '◀' : '▶'}</button>
            </div>
            <div className={'flex-ori-vertical flex-same-ratio'}>
              <Navigator items={navigatorList}
                         selectFile={selectFile}
                         pickItem={this.pickItem}
                         removeNavigatorItem={this.removeNavigatorItem}/>
              <Editor fileData={selectFile}
                      updateNavigatorItem={this.updateNavigatorItem}
                      saveItem={this.saveItem}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
