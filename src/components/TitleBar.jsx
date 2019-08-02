import React from 'react';

export default class TitleBar extends React.Component {
  render() {
    return (
      <div className={'flex flex-content-between'} style={{ padding: 10 }}>
        <b>
          MarkPen v0.0
        </b>
        <div>
          WorkSpace : {this.props.workingDir}
          <button>변경</button>
        </div>
      </div>
    );
  }
}