import React from "react";

export default class Navigator extends React.Component {
  onClick = (item) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.pickItem(item);
  };

  onDelete = (item) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.removeNavigatorItem(item);
  };

  render() {
    return (
      <div className={'navigator'}>
        {
          this.props.items.map((item, i) =>
            <div key={i}
                 className={`navigator-item ${this.props.selectFile.absolutePath === item.absolutePath ? 'selected' : ''}`}
                 onClick={this.onClick(item)}>
              {item.name}
              {item.isModify && <span className={'modify'}>●</span>}
              <button className={'close-btn'} onClick={this.onDelete(item)}>×</button>
            </div>)
        }
      </div>
    )
  }
}