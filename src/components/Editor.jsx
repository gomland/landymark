import React from 'react';
import ReactMarkdown from "react-markdown";
// @ts-ignore
import htmlParser from 'react-markdown/plugins/html-parser';
import Logo from '../res/logo.png';
import {
  BlockQuoteBlock,
  CodeBlock,
  HeadBlock,
  InlineCodeBlock,
  LinkBlock,
  ListItemBlock,
  TableBlock, TextBlock
} from "./MarkdownBlocks";

const EditorMode = {
  VIEW: 0,
  EDIT: 1
};

export default class Editor extends React.Component {
  customParser = htmlParser({
    processingInstructions: [
      {
        shouldProcessNode: node => node && (node.name === 'span' || node.name === 'u'),
        processNode: node => {
          let style = {};
          let className = '';
          if (node.name === 'span' && node.attribs && node.attribs.style) {
            const color = this.findStyleColorValue(node.attribs.style, 'color');
            if (color) {
              style.color = color;
            }
            const background = this.findStyleColorValue(
              node.attribs.style,
              'background'
            );
            if (background) {
              style.background = background;
            }
          } else if (node.name === 'u') {
            className = 'markdown-u'
          }
          return <node.name className={className} style={style}/>;
        }
      }
    ]
  });

  constructor(props) {
    super(props);
    this.state = {
      mode: EditorMode.VIEW,
      text: props.fileData ? props.fileData.text : ''
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const nextFileData = nextProps.fileData;
    const { fileData } = this.props;

    if (nextFileData !== fileData) {
      if (fileData) {
        this.props.updateItem(fileData, { text: this.state.text }); //saved
      }

      this.setState({
        mode: nextFileData && nextFileData.isNew ? EditorMode.EDIT : EditorMode.VIEW,
        text: nextFileData ? nextFileData.text : ''
      });
    }
    return true;
  }

  findStyleColorValue = (styleStr, target) => {
    const color = new RegExp(`${target}\\s*:\\s*[#a-zA-Z0-9]+`).exec(styleStr);
    //color 또는 background 의 : 이후 컬러 값을 검출 한다.

    if (color && color.length > 0) {
      const colorArr = color[0].split(':');
      if (colorArr.length > 1) {
        return colorArr[1];
      }
    }
    return null;
  };

  correctionErrorCase = (content) => {
    return content.replace(/<br>|<\/br>/g, '');
  };

  onChange = (e) => {
    const { fileData } = this.props;

    if (!fileData.isModify) {
      this.props.updateItem(fileData, { isModify: true });
    }

    this.setState({
      text: this.correctionErrorCase(e.target.value)
    });
  };

  onMenuButtonClick = () => {
    const { fileData, updateItem } = this.props;
    const { mode } = this.state;

    if (mode === EditorMode.EDIT) {
      updateItem(fileData, { text: this.state.text, isNew: false }, true); //save
    }

    this.setState({
      mode: mode === EditorMode.VIEW ? EditorMode.EDIT : EditorMode.VIEW
    });
  };

  onCheckBoxChange = (targetText, checked) => {

  };

  renderDefault = () => {
    return <div className={'flex flex-center-item'}>
      <img alt='logo' src={Logo}/>
    </div>
  };

  renderMenu = () => {
    const { mode, text } = this.state;
    const buttonText = mode === EditorMode.VIEW ? '편집' : '저장';
    return (
      <>
        <ReactMarkdown className={'markdown'} source={text}
                       skipHtml={false}
                       escapeHtml={false}
                       astPlugins={[this.customParser]}
                       renderers={{
                         text: TextBlock,
                         code: CodeBlock,
                         tableCell: TableBlock,
                         heading: HeadBlock,
                         inlineCode: InlineCodeBlock,
                         blockquote: BlockQuoteBlock,
                         listItem: ListItemBlock(this.onCheckBoxChange),
                         link: LinkBlock
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
          <textarea className={'textarea flex-same-ratio scroll-y'} value={text} onChange={this.onChange}/>
        }
        <div className={`flex-same-ratio scroll-y`}>
          {
            fileData ? this.renderMenu() : this.renderDefault()
          }
        </div>
      </div>
    );
  }
}