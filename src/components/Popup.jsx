import React from 'react';

export default class Popup extends React.Component {
  render() {
    const {
      visible, title, content, onConfirm, onCancel,
      okText, cancelText
    } = this.props;
    if (visible === undefined || visible === false) {
      return <></>
    }

    return <div className={'popup-root'}>
      <div className={'popup flex-ori-vertical'}>
        <div className={'body'}>
          {
            title && title.length > 0 &&
            <p className={'title'}>
              {title}
            </p>
          }
          <div className={'content'}>
            {content && content()}
          </div>
          <div className={"btn-container flex"}>
            <button className={'btn ok'} onClick={onConfirm}>{okText ? okText : 'ok'}</button>
            <button className={'btn'} onClick={onCancel}>{cancelText ? cancelText : 'cancel'}</button>
          </div>
        </div>
      </div>
    </div>
  }
}