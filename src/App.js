import React from 'react';
import FileExplorer from "./components/FileExplorer";
import Editor from "./components/Editor";
import Navigator from "./components/Navigator";
import './global.css';
import FileService from "./service/FileService";
import FileData from "./data/FileData";
import TitleBar from "./components/TitleBar";

const DEFAULT_FILE_NAME = 'no name';

const workingDir = '/Users/igadmp/Documents/markdown';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dirInfo: [],
      navigatorList: [],
      selectFile: undefined
    }
  }

  componentWillMount() {
    FileService.getDirectory(workingDir,
      this.responseList);
  }

  onChangeWorkspace = () => {

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

  appendDirInfo = (dirInfo) => {
    this.setState(prev => ({
      dirInfo: [...prev.dirInfo, dirInfo]
    }))
  };

  pickItem = (fileData) => {
    const { navigatorList } = this.state;
    const find = navigatorList.find(f => f.absolutePath === fileData.absolutePath);

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

  updateItem = (fileData, state = {}, fileSave = false) => {
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

    if (fileSave) {
      this.saveFile(nextFileData, fileData.isNew);
    }
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
    const defaultCount = navigatorList.reduce((count, f) => f.name.indexOf(DEFAULT_FILE_NAME) > -1 ? count + 1 : count, 1);
    const fileName = `${defaultCount > 1 ? `${DEFAULT_FILE_NAME} (${defaultCount})` : DEFAULT_FILE_NAME}.md`;

    const fileData = new FileData();
    fileData.absolutePath = `${path}/${fileName}`;
    fileData.name = fileName;
    fileData.isNew = true;
    fileData.path = path;

    this.setState({
      navigatorList: [...navigatorList, fileData],
      selectFile: fileData
    });
  };

  saveFile = (fileData, isAddList = false) => {
    FileService.writeFile(fileData.absolutePath, fileData.text, (res) => {
      if (!res.result) {
        return;
      }

      if (isAddList) {
        const nextDirInfo = this.state.dirInfo.map(dir => {
          if (dir.path === fileData.path) {
            return {
              path: dir.path,
              data: [...dir.data, fileData]
            }
          }
          return dir;
        });

        this.setState({
          dirInfo: nextDirInfo,
          selectFile: fileData
        });
      }
    })
  };

  render() {
    const { dirInfo, navigatorList, selectFile } = this.state;

    return (
      <div className={'root'}>
        <div className={'full-height flex-ori-vertical flex-same-ratio'}>
          <TitleBar workingDir={workingDir} onChangeWorkspace={this.onChangeWorkspace}/>
          <div className={'flex flex-same-ratio'} style={{ overflowY: 'hidden' }}>
            <FileExplorer workingDir={workingDir}
                          dirInfo={dirInfo}
                          newItem={this.newItem}
                          renameFile={this.renameFile}
                          removeFile={this.removeFile}
                          onFileClick={this.onFileClick}/>
            <div className={'flex-ori-vertical flex-same-ratio'}>
              <Navigator items={navigatorList}
                         selectFile={selectFile}
                         pickItem={this.pickItem}
                         removeNavigatorItem={this.removeNavigatorItem}/>
              <Editor fileData={selectFile}
                      updateItem={this.updateItem}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
