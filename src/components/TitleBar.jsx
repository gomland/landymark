import React from 'react';

export default class TitleBar extends React.Component {
  render() {
    return (
      <div className={'title-bar flex flex-content-between'}>
        <b className={'title'}>
          LandyMark
        </b>
        <div className={'work-space'}>
          {this.props.workingDir}
        </div>
      </div>
    );
  }
}