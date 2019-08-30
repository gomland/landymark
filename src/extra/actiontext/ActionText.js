import React, {Component} from 'react';
import {getRandomNumber, getRandomColorRGB, toRGBA} from "./RandomTool";

export default class ActionText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasKey: "canvas" + getRandomNumber(500),
      dots: [],
      timer: null
    }
  }

  componentDidMount() {
    if (this.props.renderText.length > 0) {
      this.run(this.props.renderText);
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.renderText !== nextProps.renderText) {
      this.run(nextProps.renderText);
    }
  }

  clearTimer = () => {
    clearInterval(this.state.timer);
    this.setState({
      timer: null
    });
  };

  run = (text) => {
    this.renderText(text);
    if (!this.state.timer) {
      const timer = setInterval(() => {
        let keyFrame = 0;
        this.update(keyFrame)();
      }, 1);

      this.setState({
        timer: timer
      });
    }
  };

  update = (keyFrame) => () => {
    const { width, height, renderFontSize, type, border } = this.props;
    const { dots } = this.state;
    const canvas = document.getElementById(this.state.canvasKey);
    const ctx = canvas.getContext("2d");

    if (dots.filter(dot => !dot.isSleep()).length === 0) {
      this.clearTimer();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    dots.map(dot => {
      dot.action(keyFrame);
      ctx.fillStyle = toRGBA(dot.fillColor, dot.opacity);
      if (type && type === "circle") {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, renderFontSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        if (border) {
          ctx.strokeStyle = toRGBA(dot.storkeColor, dot.opacity);
          ctx.stroke();
        }
      } else {
        ctx.fillRect(dot.x, dot.y, renderFontSize - 1, renderFontSize - 1);
        if (border) {
          ctx.strokeStyle = toRGBA(dot.storkeColor, dot.opacity);
          ctx.strokeRect(dot.x, dot.y, renderFontSize, renderFontSize);
        }
      }
      return dot;
    });


    keyFrame = keyFrame > 100 ? 0 : keyFrame + 1;
  };

  renderText = (text) => {
    const { width, height, renderFontSize, maxSpeed, fillColor, borderColor } = this.props;
    const copyDots = this.state.dots.slice();
    const fontSize = 24;

    const canvas = document.getElementById(this.state.canvasKey);
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, 0, fontSize);

    const imgData = ctx.getImageData(0, 0, width, fontSize * 1.5);
    const pix = imgData.data;

    ctx.clearRect(0, 0, width, height);

    let idx = 0;
    for (let i = 0; i < pix.length; i += 4) {
      if (pix[i + 3] > 0) {
        const x = i / 4 % width * renderFontSize;
        const y = i / 4 / width * renderFontSize;

        if (copyDots.length > idx) {
          copyDots[idx].updateTargetXy(x, y, width);
        } else {
          copyDots.push(
            new Dot(x,
              y,
              width,
              height,
              renderFontSize,
              borderColor,
              fillColor)
          );
        }
        copyDots[idx++].wakeup();
      }
    }

    for (let i = idx; i < copyDots.length; i++) {
      const dot = copyDots[i];
      dot.updateTargetXy(dot.x, height - renderFontSize * 2, width, maxSpeed);
      dot.wakeup();
      dot.setDown();
    }


    this.setState({
      dots: copyDots
    });
  };

  render() {
    const { width, height } = this.props;
    return (
      <canvas id={this.state.canvasKey} width={width} height={height}>
      </canvas>
    );
  }
}

class Dot {
  constructor(x, y, width, height, size, borderColor, fillColor, maxSpeed) {
    this.maxSpeed = maxSpeed ? maxSpeed : 4;
    this.endX = parseInt(x);
    this.endY = parseInt(y);
    this.x = getRandomNumber(width - size);
    this.y = getRandomNumber(height - size);
    this.speed = Math.round(Math.abs(this.endX - this.x) / (width / this.maxSpeed));
    this.sleep = true;
    this.expire = false;
    this.storkeColor = borderColor || getRandomColorRGB();
    this.fillColor = fillColor || getRandomColorRGB();
    this.opacity = 0;
  }

  updateTargetXy(x, y, width) {
    this.endX = parseInt(x);
    this.endY = parseInt(y);
    this.speed = Math.round(Math.abs(this.endX - this.x) / (width / this.maxSpeed));
  }

  wakeup() {
    this.sleep = false;
    this.expire = false;
  }

  isSleep() {
    return this.sleep;
  }

  setDown() {
    this.expire = true;
  }

  action(keyFrame) {
    if (!this.expire && this.opacity < 1) {
      this.opacity += 0.005;
    } else if (this.expire && this.opacity > 0.3) {
      this.opacity -= 0.01;
    }

    if (keyFrame % this.maxSpeed > this.speed || this.isSleep()) {
      return;
    }

    if (this.x < this.endX) {
      this.x++;
    } else if (this.x > this.endX) {
      this.x--;
    }

    if (this.y < this.endY) {
      this.y++;
    } else if (this.y > this.endY) {
      this.y--;
    }

    if (this.x === this.endX && this.y === this.endY) {
      this.sleep = true;
    }
  }
}