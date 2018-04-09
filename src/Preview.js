import React, { PureComponent } from 'react';
import Pressure from 'pressure';

const PRESSED_SCALE = 0.95;
// minimum scale applied to the preview node

export default class Preview extends PureComponent {
  state = { force: 0 };

  timer = null;
  pressing = false;
  transitioning = false;

  componentDidMount() {
    // initializes Pressure with the root node
    Pressure.set(
      this.node,
      {
        start: () => (this.pressing = true),
        end: () => {
          if (!this.transitioning) this.timer = setTimeout(this.resetForce, 50);
        },
        change: force => this.pressing && this.setState({ force })
      },
      { polyfillSpeedUp: 100, polyfillSpeedDown: 100 }
    );
  }

  resetForce = () => {
    this.setState({ force: 0 });
    this.transitioning = false;
  };

  onMouseUp = () => {
    clearTimeout(this.timer);
    this.pressing = false;
    this.timer = setTimeout(this.resetForce, 50);
  };

  onClick = () => {
    clearTimeout(this.timer);
    this.transitioning = true;
    this.props.onClick();
    // once the user has clicked
    // the entering transition should start
    // therefore before reseting the force
    // we wait for 200ms (arbitrary figure)
    setTimeout(this.resetForce, 200);
  };

  render() {
    const { id, image, title } = this.props;
    const { force } = this.state;

    return (
      <div
        ref={node => (this.node = node)} // referencing the node
        data-id={id}
        className="preview cover"
        onClick={this.onClick}
        onMouseUp={this.onMouseUp}
        style={{
          backgroundImage: `url(/img/${image})`,
          transform: `scale(${1 - force * (1 - PRESSED_SCALE)})`
        }}
      >
        <h1 className="title">{title}</h1>
      </div>
    );
  }
}
