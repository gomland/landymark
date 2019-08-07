import React from 'react';
import Popup from "./Popup";
import {APP_NAME, VERSION} from "../constants/constants";

export default class TitleBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleChangePath: false,
      nextPath: undefined
    }
  }

  enablePopup = () => {
    this.setState({
      visibleChangePath: true
    });
  };

  onTextChange = (e) => {
    this.setState({
      nextPath: e.target.value
    });
  };

  onConfirm = () => {
    const { nextPath } = this.state;

    if (nextPath) {
      this.props.onChangeWorkspace(nextPath);
    }

    this.setState({
      nextPath: undefined,
      visibleChangePath: false
    });
  };

  onRefresh = () => {
    this.props.onChangeWorkspace(this.props.workingDir);
  };

  onCancel = () => {
    this.setState({
      visibleChangePath: false
    });
  };

  renderChangePath = () => (<div>
    <p className={'flex'}>
      <span style={{ marginRight: 5 }}>Current : </span>
      <b className={'flex-same-ratio to-text-left text-gray'}>{this.props.workingDir}</b></p>
    <div className={'flex'}>
      <b style={{ marginRight: 5 }}>Change : </b>
      <input className={'input flex-same-ratio'} type={'text'} onChange={this.onTextChange}/>
    </div>
  </div>);

  render() {
    const { visibleChangePath } = this.state;

    return (
      <div className={'title-bar flex '}>
        <span className={'flex-same-ratio'}>
          <b className={'title'}>{APP_NAME}</b>
          <span className={'text-gold'} style={{ marginLeft: 5 }}>{VERSION}</span>
        </span>
        <div className={'work-space'} onClick={this.enablePopup}>
          {this.props.workingDir}
        </div>
        <button className={'file-menu-btn refresh'} onClick={this.onRefresh}/>
        {
          visibleChangePath &&
          <Popup visible
                 title={'Working directory'}
                 okText={'change'}
                 content={this.renderChangePath}
                 onConfirm={this.onConfirm}
                 onCancel={this.onCancel}/>
        }
      </div>
    );
  }
}