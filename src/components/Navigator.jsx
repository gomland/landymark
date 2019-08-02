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
                        <div key={i} className={'navigator-item'} onClick={this.onClick(item)}>
                            {item.name}
                            {item.isModify && <span>수정</span>}
                            <button onClick={this.onDelete(item)}>x</button>
                        </div>)
                }
            </div>
        )
    }
}