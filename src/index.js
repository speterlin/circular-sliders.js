import { drawShoeWithGradient, drawWaistWithGradient, drawPersonWithGradient } from './shapes';
import merge from './merge';

// https://github.com/ankane/chartkick.js/blob/master/src/index.js
const config = (typeof window !== 'undefined' && window.CircularSliders) || {};

let isMouseDown = false;

const defaults = {
  name: 'Slider',
  type: 'Plain',
  color: '#0000FF',
  minValue: 0,
  maxValue: 100,
  step: 10,
  units: '',
  priceUnits: '',
  // centerX, centerY, and radius set in Canvas because they are specific/modified to each canvas
  lineWidth: 5,
  strokeColor: '#D3D3D3',
  ballColor: '#000000',
  gradientFill: true,
  legend: { display: true, font: '12px Arial', color: '#000000' },
};

function renderSlider(ctx, slider) {
  ctx.beginPath();
  ctx.lineWidth = slider.lineWidth;
  ctx.strokeStyle = slider.strokeColor;
  ctx.setLineDash([slider.lineDashLength, slider.lineDashSpacing]);
  ctx.arc(slider.centerX, slider.centerY, slider.radius, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.closePath();
  if (slider.type !== 'Plain') {
    ctx.beginPath();
    ctx.setLineDash([10, 0]);
    ctx.lineWidth = 5;
    let myGradient = null;
    if (slider.type === 'Shoe') {
      myGradient = drawShoeWithGradient(ctx, slider);
    } else if (slider.type === 'Waist') {
      myGradient = drawWaistWithGradient(ctx, slider);
    } else if (slider.type === 'Height') {
      myGradient = drawPersonWithGradient(ctx, slider);
    } else if (slider.type === 'Weight') {
      myGradient = drawPersonWithGradient(ctx, slider, { style: 'Weight' });
    }
    if (slider.gradientFill) {
      const scale = (slider.value - slider.minValue) / slider.range;
      myGradient.addColorStop(0, slider.color);
      myGradient.addColorStop(scale, '#ffffff');
      ctx.fillStyle = myGradient;
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
  }
}

function renderBall(ctx, slider) {
  ctx.beginPath();
  ctx.arc(slider.ball.x, slider.ball.y, slider.ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = slider.ball.color;
  ctx.fill();
  ctx.closePath();
}

function renderArc(ctx, slider) {
  // add this if want arc to stop at edge of ball: let angleOffset = Math.atan(slider.ball.radius / slider.radius), then also need check for (π / 2) + slider.angle) < angleOffset) for when go past the 0˚ mark at top of circle, π / 2 + slider.angle since angle starts at -π / 2 at top of circle
  ctx.beginPath();
  ctx.arc(slider.centerX, slider.centerY, slider.radius, -(Math.PI / 2), slider.angle, false);
  ctx.lineWidth = slider.lineWidth;
  ctx.strokeStyle = slider.color;
  // have to set lineDashLength to a number > 0 for arc to be completely full in browsers like Safari
  ctx.setLineDash([10, 0]);
  ctx.stroke();
  ctx.closePath();
}

function renderLegend(ctx, slider, sliderIndex, movingSliderBall) {
  ctx.beginPath();
  if (movingSliderBall) { ctx.font = `bold ${slider.legend.font}`; } else { ctx.font = slider.legend.font; }
  ctx.fillStyle = slider.legend.color;
  // maybe refactor, 20px vertical spacing by default, could be an issue if set font above 20px
  ctx.fillText(`${slider.name}: ${slider.priceUnits}${slider.value} ${slider.units}`, 10, 20 * (sliderIndex + 1));
  ctx.closePath();
}

function renderCanvas(canvas, movingBall = false) {
  const ctx = canvas.getCtx();
  const sliders = canvas.getSliders();
  sliders.forEach((slider, index) => {
    renderSlider(ctx, slider);
    renderArc(ctx, slider);
    renderBall(ctx, slider);
    if (slider.legend.display) {
      renderLegend(ctx, slider, index, movingBall && slider === canvas.getSelectedSlider());
    }
  });
}

function ballLocationForAngle(slider) {
  return [slider.centerX + slider.radius * Math.cos(slider.angle), slider.centerY + slider.radius * Math.sin(slider.angle)];
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function moveBall(mouseX, mouseY, canvas) {
  const slider = canvas.getSelectedSlider();
  const dx = mouseX - slider.centerX;
  // if draw out in x-y coordinates correct way would be slider.centerY - mouseY, but because top of circle -π / 2, have to do negative of angle which is the same as doing below
  const dy = mouseY - slider.centerY;
  slider.angle = Math.atan(dy / dx);
  // to cover other half of circle, Math.atan only calculates angles between -π/2 and π/2
  if (dx < 0) { slider.angle += Math.PI; }
  [slider.ball.x, slider.ball.y] = ballLocationForAngle(slider);
  // add π / 2 because 0˚ (top of circle) starts at -π / 2, divide by 2π because this is 360˚ in radians, this is reverse of #angleForValue
  slider.value = slider.minValue + slider.range * ((slider.angle + (Math.PI / 2)) / (2 * Math.PI));
  // refactor - bug if give step value below 0.5
  const roundedValue = roundToStep(slider.value, slider.step);
  slider.value = roundedValue;
  canvas.__render(true);
}

function angleForValue(slider) {
  return (2 * Math.PI * (slider.value - slider.minValue) / slider.range) - (Math.PI / 2);
}

function moveBallToStep(canvas) {
  const slider = canvas.selectedSlider;
  slider.angle = angleForValue(slider);
  [slider.ball.x, slider.ball.y] = ballLocationForAngle(slider);
  canvas.__render();
}

function setMouse(e) {
  const canvas = e.target;
  // window.scrollX and window.scrollY to account for page scrolling
  return [parseInt(e.clientX - canvas.offsetLeft + window.scrollX, 10), parseInt(e.clientY - canvas.offsetTop + window.scrollY, 10)];
}

function onBall(x, y, slider) {
  if (x > (slider.ball.x - slider.ball.radius) && x < (slider.ball.x + slider.ball.radius) && y > (slider.ball.y - slider.ball.radius) && y < (slider.ball.y + slider.ball.radius)) {
    return true;
  }
  return false;
}

// TODO: refactor
function getCanvas(e) {
  const elementId = e.target.parentNode.id;
  return CircularSliders.canvases[elementId];
}

function handleMouseDown(e) {
  e.preventDefault();
  isMouseDown = true;
  const [mouseX, mouseY] = setMouse(e);
  const canvas = getCanvas(e);
  const sliders = canvas.getSliders();
  sliders.forEach((slider) => {
    if (onBall(mouseX, mouseY, slider)) {
      canvas.selectedSlider = slider;
    }
  });
}

function handleMouseUp(e) {
  e.preventDefault();
  isMouseDown = false;
  const canvas = getCanvas(e);
  moveBallToStep(canvas);
}

function handleMouseMove(e) {
  if (!isMouseDown) {
    return;
  }
  e.preventDefault();
  const [mouseX, mouseY] = setMouse(e);
  const canvas = getCanvas(e);
  moveBall(mouseX, mouseY, canvas);
}

class Ball {
  constructor(slider, ballColor) {
    [this.x, this.y] = ballLocationForAngle(slider);
    this.radius = slider.lineWidth;
    this.color = ballColor;
  }
}

class CircularSlider {
  constructor(options) {
    // options should always be an object, || {} is precautionary or if decide to initiate a CircularSlider without options
    const settings = merge(CircularSliders.defaults, options || {});
    const slider = this;
    Object.keys(settings).forEach((key) => {
      slider[key] = settings[key];
    });
    // centerX, centerY, and radius should be set in defaults (in for loop) or options
    this.value = this.value || this.minValue;
    // calculated / created attributes
    this.range = this.maxValue - this.minValue;
    this.angle = angleForValue(this);
    // maybe refactor, I like 2/3 and 1/3 for now
    const arcSegment = 2 * Math.PI * this.radius / (this.range / this.step);
    this.lineDashLength = (2 / 3) * arcSegment;
    this.lineDashSpacing = (1 / 3) * arcSegment;
    this.ball = new Ball(this, settings.ballColor);
  }

}

class Canvas {
  constructor(elementId, slidersOptions) {
    // add error check for if there doesn't exist element with this id
    const element = document.getElementById(elementId);
    element.innerHTML = "<canvas style='width:100%;height:100%'></canvas>";
    const canvas = element.getElementsByTagName('CANVAS')[0];
    [canvas.width, canvas.height] = [canvas.offsetWidth, canvas.offsetHeight];
    const sliders = [];
    slidersOptions.forEach((sliderOptions, index) => {
      [defaults.centerX, defaults.centerY, defaults.radius] = [canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 4];
      defaults.name = `Slider ${index + 1}`;
      if (index > 0) {
        [defaults.centerX, defaults.centerY] = [sliders[index - 1].centerX, sliders[index - 1].centerY];
        defaults.radius = sliders[index - 1].radius + sliders[index - 1].lineWidth + defaults.lineWidth;
      }
      sliders.push(new CircularSlider(sliderOptions));
    });
    // maybe look at https://stackoverflow.com/questions/10149963/adding-event-listener-cross-browser
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    [this.sliders, this.selectedSlider, this.canvas, this.element] = [sliders, sliders[0], canvas, element];

    CircularSliders.canvases[element.id] = this;

    // maybe add error catcher
    this.__render();
  }

  // maybe remove getElement, getCanvas, getSliders, getSelectedSlider, could just call slider.canvas for example
  getElement() {
    return this.element;
  }

  getCanvas() {
    return this.canvas;
  }

  getSliders() {
    return this.sliders;
  }

  getSelectedSlider() {
    return this.selectedSlider;
  }

  getSliderByName(name) {
    // maybe refactor, filter to reduce it to smaller array, then grab first slider
    return this.sliders.filter(slider => slider.name === name)[0];
  }

  getCtx() {
    return this.canvas.getContext('2d');
  }

  __clear() {
    this.getCtx().clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  __render(movingBall = false) {
    // TODO: in the future want to be able to clear only the selected slider using maybe svg groups
    this.__clear();
    renderCanvas(this, movingBall);
  }
}

const CircularSliders = {
  Canvas: Canvas,
  canvases: {},
  configure(options) {
    Object.keys(options).forEach((key) => {
      config[key] = options[key];
    });
  },
  config: config,
  defaults: defaults,
};

export default CircularSliders;
