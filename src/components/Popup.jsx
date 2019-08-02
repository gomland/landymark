import React from 'react';

export default class Popup extends React.Component {
  render() {
    const {
      visible, title, content, onConfirm, onCancel,
      okText, cancelText
    } = this.props;
    if (visible === undefined || visible && visible === false) {
      return <></>
    }

    return <div className={'popup-root'}>
      <div className={'popup flex-ori-vertical'}>
        <div className={'body'}>
          <p>
            {title}
          </p>
          <p>
            {content}
          </p>
          <button onClick={onConfirm}>{okText ? okText : '확인'}</button>
          <button onClick={onCancel}>{cancelText ? cancelText : '닫기'}</button>
        </div>
      </div>
    </div>
  }
}