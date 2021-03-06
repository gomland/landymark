import React from 'react';
import ReactMarkdown from "react-markdown";
import {
  BlockQuoteBlock,
  CodeBlock,
  HeadBlock, ImageBlock,
  InlineCodeBlock,
  LinkBlock,
  ListItemBlock,
  TableBlock, TextBlock
} from "./MarkdownBlocks";
import ActionText from "../extra/actiontext/ActionText";

const EditorMode = {
  VIEW: 0,
  EDIT: 1
};

export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: EditorMode.VIEW,
      text: props.fileData ? props.fileData.text : '',
      isModified: false
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const nextFileData = nextProps.fileData;
    const { fileData } = this.props;

    if (nextFileData !== fileData) {
      if (fileData) {
        this.props.updateNavigatorItem(fileData, { text: this.state.text, isModify: this.state.isModified }); //saved
      }

      this.setState({
        mode: nextFileData && (nextFileData.isNew || nextFileData.isModify) ? EditorMode.EDIT : EditorMode.VIEW,
        text: nextFileData ? nextFileData.text : '',
        isModified: nextFileData ? nextFileData.isModify : false
      });
    }
    return true;
  }

  onChange = (e) => {
    const { fileData } = this.props;

    if (!this.state.isModified) {
      this.props.updateNavigatorItem(fileData, { isModify: true });
    }

    this.setState({
      text: e.target.value,
      isModified: true
    });
  };

  onMenuButtonClick = () => {
    const { fileData, saveItem } = this.props;
    const { mode, text } = this.state;

    if (mode === EditorMode.EDIT) {
      saveItem(fileData, text);
    }

    this.setState({
      mode: mode === EditorMode.VIEW ? EditorMode.EDIT : EditorMode.VIEW,
      isModified: false
    });
  };

  onCheckBoxChange = (targetText, checked) => {
    const { fileData, saveItem } = this.props;
    const { mode, text } = this.state;

    const findItem = new RegExp(`\\[[\\s|x]\\]\\s+${targetText}`).exec(text);
    if (!findItem) {
      return;
    }

    const target = findItem[0];
    const targetNextState = checked
      ? target.replace('[ ]', '[x]')
      : target.replace('[x]', '[ ]');
    const nextContent = text.replace(target, targetNextState);
    this.setState({
      text: nextContent
    });

    if (mode === EditorMode.VIEW) {
      saveItem(fileData, nextContent);
    }
  };

  renderDefault = () => {
    return <div className={'flex-ori-vertical flex-center-item'}>
      <ActionText
        width={350}
        height={120}
        renderFontSize={3}
        renderText={'Hi there! :)'}
        fillColor={'#ffd676'}
      />
      <ActionText
        width={580}
        height={100}
        renderFontSize={2}
        renderText={'Select your markdown file.'}
        fillColor={'#fff'}
      />
    </div>
  };

  renderViewer = () => {
    const { mode, text } = this.state;
    const buttonText = mode === EditorMode.VIEW ? '편집' : '저장';
    return (
      <>
        <ReactMarkdown className={'markdown'}
                       source={text}
                       skipHtml={true}
                       escapeHtml={true}
                       renderers={{
                         text: TextBlock,
                         code: CodeBlock,
                         tableCell: TableBlock,
                         heading: HeadBlock,
                         inlineCode: InlineCodeBlock,
                         blockquote: BlockQuoteBlock,
                         listItem: ListItemBlock(this.onCheckBoxChange),
                         link: LinkBlock,
                         image: ImageBlock
                       }}/>
        <button className={`editor-menu ${mode === EditorMode.VIEW ? 'edit' : 'save'}`}
                onClick={this.onMenuButtonClick}>{buttonText}</button>
      </>
    );
  };

  render() {
    const { fileData } = this.props;
    const { mode, text } = this.state;

    return (
      <div className={'editor flex flex-same-ratio scroll-y'}>
        {
          mode === EditorMode.EDIT &&
          <textarea className={'textarea flex-same-ratio scroll-y'}
                    value={text}
                    onChange={this.onChange}/>
        }
        <div className={`flex-same-ratio scroll-y`}>
          {
            fileData ? this.renderViewer() : this.renderDefault()
          }
        </div>
      </div>
    );
  }
}