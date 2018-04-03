import React, { PureComponent } from 'react';

export default class Preview extends PureComponent {
  render() {
    const { id, image, title, onClick } = this.props;

    return (
      <div
        data-id={id}
        className="preview cover"
        onClick={onClick}
        style={{ backgroundImage: `url(/img/${image})` }}
      >
        <h1 className="title">{title}</h1>
      </div>
    );
  }
}
