import {drawShoeWithGradient, drawWaistWithGradient, drawPersonWithGradient} from './shapes';
import {merge} from './helpers';

// https://github.com/ankane/chartkick.js/blob/master/src/index.js
let config = (typeof window !== "undefined" && window.CircularSliders) || {};

let isMouseDown = false;

const defaults = {
  name: "Slider",
  type: "Plain",
  color: "#0000FF",
  minValue: 0,
  maxValue: 100,
  step: 10,
  units: "",
  priceUnits: "",
  // centerX, centerY, and radius set in Canvas because they are specific/modified to each canvas
  lineWidth: 5,
  strokeColor: "#D3D3D3",
  ballColor: "#000000",
  gradientFill: true,
  legend: {display: true, font: "12px Arial", color: "#000000"},
}

function renderCanvas(canvas, movingBall = false) {
  let ctx = canvas.getCtx();
  // in the future want to be able to clear only the slider using, maybe with svg groups, maybe also move clearing to __render() function
  canvas.__clear(ctx);
  let sliders = canvas.getSliders();
  for (let i = 0; i < sliders.length; i++) {
    renderSlider(ctx, sliders[i]);
    renderArc(ctx, sliders[i]);
    renderBall(ctx, sliders[i]);
    if (sliders[i].legend.display) { renderLegend(ctx, sliders[i], i, movingBall && sliders[i] == canvas.getSelectedSlider()); }
  }
}

function renderSlider(ctx, slider) {
  ctx.lineWidth = slider.lineWidth;
  ctx.strokeStyle = slider.strokeColor;
  ctx.setLineDash([slider.lineDashLength, slider.lineDashSpacing]);
  ctx.beginPath();
  ctx.arc(slider.centerX, slider.centerY, slider.radius, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.closePath();
  if (slider.type != "Plain") {
    ctx.beginPath();
    ctx.setLineDash([10, 0]);
    ctx.lineWidth = 5;
    let my_gradient = null;
    if (slider.type == "Shoe") {
      my_gradient = drawShoeWithGradient(ctx, slider);
    } else if (slider.type == "Waist") {
      my_gradient = drawWaistWithGradient(ctx, slider);
    } else if (slider.type == "Height") {
      my_gradient = drawPersonWithGradient(ctx, slider);
    } else if (slider.type == "Weight") {
      my_gradient = drawPersonWithGradient(ctx, slider, {style: "Weight"});
    }
    if (slider.gradientFill) {
      let scale = (slider.value - slider.minValue) / slider.range;
      my_gradient.addColorStop(0, slider.color);
      my_gradient.addColorStop(scale,"#ffffff");
      ctx.fillStyle = my_gradient;
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
  // have to set lineDashLength to a number > 0 for arc to be completely full in browsers like Safari, set it arbitrarily to 10 here
  ctx.setLineDash([10, 0]);
  ctx.stroke();
  ctx.closePath();
}

function renderLegend(ctx, slider, sliderIndex, movingSliderBall) {
  ctx.beginPath();
  if (movingSliderBall) {ctx.font = "bold " + slider.legend.font;} else {ctx.font = slider.legend.font;}
  ctx.fillStyle = slider.legend.color;
  // maybe refactor, 20px vertical spacing by default, could be an issue if set font above 20px
  ctx.fillText(slider.name + ": " + slider.priceUnits + slider.value + " " + slider.units, 10, 20 * (sliderIndex + 1));
  ctx.closePath();
}

function moveBall(mouseX, mouseY, canvas) {
  let slider = canvas.getSelectedSlider();
  let dx = mouseX - slider.centerX;
  // if draw out in x-y coordinates correct way would be slider.centerY - mouseY, but because top of circle -π / 2, have to do negative of angle which is the same as doing below
  let dy = mouseY - slider.centerY;
  slider.angle = Math.atan(dy / dx);
  // to cover other half of circle, Math.atan only calculates angles between -π/2 and π/2
  if (dx < 0) { slider.angle += Math.PI; }
  [slider.ball.x, slider.ball.y] = ballLocationForAngle(slider);
  // add π / 2 because 0˚ (top of circle) starts at -π / 2, divide by 2π because this is 360˚ in radians, this is reverse of #angleForValue
  slider.value = slider.minValue + slider.range * ((slider.angle + (Math.PI / 2)) / (2 * Math.PI));
  // refactor - bug if give step value below 0.5
  let roundedValue = roundToStep(slider.value, slider.step);
  slider.value = roundedValue;
  canvas.__render(true);
}

function moveBallToStep(canvas) {
  let slider = canvas.selectedSlider;
  slider.angle = angleForValue(slider);
  [slider.ball.x, slider.ball.y] = ballLocationForAngle(slider);
  console.log(canvas);
  canvas.__render();
}

function ballLocationForAngle (slider) {
  return [slider.centerX + slider.radius * Math.cos(slider.angle), slider.centerY + slider.radius * Math.sin(slider.angle)];
}

function angleForValue (slider) {
  return (2 * Math.PI * (slider.value - slider.minValue) / slider.range) - (Math.PI / 2)
}

function handleMouseDown(e) {
  e.preventDefault();
  isMouseDown = true;
  let [mouseX, mouseY] = setMouse(e);
  let canvas = getCanvas(e);
  let sliders = canvas.getSliders();
  for (let i = 0; i < sliders.length; i++) {
    if (onBall(mouseX, mouseY, sliders[i])) {
      canvas.selectedSlider = sliders[i];
    }
  }
}

function handleMouseUp(e) {
  e.preventDefault();
  isMouseDown = false;
  let canvas = getCanvas(e);
  moveBallToStep(canvas);
}

function handleMouseMove(e) {
  if (!isMouseDown) {
    return;
  }
  e.preventDefault();
  let [mouseX, mouseY] = setMouse(e);
  let canvas = getCanvas(e);
  moveBall(mouseX, mouseY, canvas);
}

function getCanvas(e) {
  let elementId = e.target.parentNode.id;
  return CircularSliders.canvases[elementId];
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function onBall(x, y, slider) {
  if (x > (slider.ball.x - slider.ball.radius) && x < (slider.ball.x + slider.ball.radius) && y > (slider.ball.y - slider.ball.radius) && y < (slider.ball.y + slider.ball.radius)) {
    return true;
  }
  return false;
}

function setMouse(e) {
  let canvas = e.target;
  // window.scrollX and window.scrollY to account for page scrolling
  return [parseInt(e.clientX - canvas.offsetLeft + window.scrollX), parseInt(e.clientY - canvas.offsetTop + window.scrollY)];
}

class Canvas {
  constructor(elementId, slidersOptions) {
    // add error check for if there doesn't exist element with this id
    let element = document.getElementById(elementId);
    element.innerHTML = "<canvas style='width:100%;height:100%'></canvas>";
    let canvas = element.getElementsByTagName("CANVAS")[0];
    [canvas.width, canvas.height] = [canvas.offsetWidth, canvas.offsetHeight];
    let sliders = [];
    slidersOptions.forEach(function (sliderOptions, index) {
      [defaults.centerX, defaults.centerY, defaults.radius] = [canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 4];
      defaults.name = "Slider " + (index + 1);
      if (index > 0) {
        [defaults.centerX, defaults.centerY] = [sliders[index - 1].centerX, sliders[index - 1].centerY];
        defaults.radius = sliders[index - 1].radius + sliders[index - 1].lineWidth + defaults.lineWidth;
      }
      sliders.push(new CircularSlider (sliderOptions));
    })
    // maybe look at https://stackoverflow.com/questions/10149963/adding-event-listener-cross-browser
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    [this.sliders, this.selectedSlider, this.canvas, this.element] = [sliders, sliders[0], canvas, element];

    CircularSliders.canvases[element.id] = this;

    //maybe add error catcher
    this.__render();
  }

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
    return this.canvas.getContext("2d");
  }

  __clear(ctx = null) {
    ctx = ctx ? ctx : this.getCtx();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  __render(movingBall = false) {
    renderCanvas(this, movingBall);
  }
}

class CircularSlider {
  constructor(options) {
    // options should always be an object, || {} is precautionary or if decide to initiate a CircularSlider without options
    let settings = merge(CircularSliders.defaults, options || {});
    let slider = this;
    Object.keys(settings).forEach(function(key) {
      slider[key] = settings[key];
    });
    // centerX, centerY, and radius should be set in defaults (in for loop) or options
    this.value = this.value || this.minValue;
    // calculated / created attributes
    this.range = this.maxValue - this.minValue;
    this.angle = angleForValue(this);
    // maybe refactor, I like 2/3 and 1/3 for now
    let arcSegment = 2 * Math.PI * this.radius / (this.range / this.step);
    this.lineDashLength = (2 / 3) * arcSegment;
    this.lineDashSpacing = (1 / 3) * arcSegment;
    this.ball = new Ball (this, options.ballColor);
  }

  getAngle() {
    return this.angle;
  }

  getValue() {
    return this.value;
  }

}

class Ball {
  constructor(slider, ballColor) {
    [this.x, this.y] = ballLocationForAngle(slider);
    this.radius = slider.lineWidth;
    this.color = ballColor;
  }
}

const CircularSliders = {
  Canvas: Canvas,
  canvases: {},
  configure: function (options) {
    Object.keys(options).forEach(function(key) {
      config[key] = options[key];
    })
  },
  config: config,
  defaults: defaults,
}

export default CircularSliders;
