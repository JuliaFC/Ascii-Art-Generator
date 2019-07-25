"use strict";

var _webcam = require("../src/webcam.js");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imgData.data;
var asciiImage = document.getElementById('ascii');
var player = document.getElementById('player');
var startStreamButton = document.getElementById('start_stream');
var map = " `-^¬:L*iCtfG0X8@#&%";
var japaneseMap = " ・ヽヾゞょいうめゆぬむぎふあ";
var CONSTRAIN_RATE = 0.175;
var FONT_SIZE = "5px";
var MAXIMUM_WIDTH = Math.floor(canvas.width * CONSTRAIN_RATE);
var MAXIMUM_HEIGHT = Math.floor(canvas.height * CONSTRAIN_RATE);
var ORIGINAL_WIDTH = canvas.width;
var ORIGINAL_HEIGHT = canvas.height;
var isOn = false;

var clearCanvas = function clearCanvas() {
  var pre = document.createElement('pre');
  pre.style.display = 'inline';
  pre.textContent = map[0];
  document.body.appendChild(pre);

  var _pre$getBoundingClien = pre.getBoundingClientRect(),
      width = _pre$getBoundingClien.width,
      height = _pre$getBoundingClien.height;

  document.body.removeChild(pre);
  return height / width;
};

var getFontRatio = function getFontRatio() {
  var pre = document.createElement('pre');
  pre.style.display = 'inline';
  pre.textContent = map[0];
  document.body.appendChild(pre);

  var _pre$getBoundingClien2 = pre.getBoundingClientRect(),
      width = _pre$getBoundingClien2.width,
      height = _pre$getBoundingClien2.height;

  document.body.removeChild(pre);
  return height / width;
};

var constrainProportions = function constrainProportions(width, height) {
  var rectifiedWidth = Math.floor(getFontRatio() * width);

  if (height > MAXIMUM_HEIGHT) {
    var reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
    return [reducedWidth, MAXIMUM_HEIGHT];
  }

  if (width > MAXIMUM_WIDTH) {
    var reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
    return [MAXIMUM_WIDTH, reducedHeight];
  }

  return [rectifiedWidth, height];
};

window.onload = function () {
  player.style.display = 'none';
  canvas.style.display = 'none';
};

startStreamButton.addEventListener('click', function () {
  var webcam = (0, _webcam.openWebcam)();
  webcam.then(function (stream) {
    var videoTracks = (0, _webcam.startStream)(stream, isOn, player);
    isOn = !isOn;

    if (isOn) {
      player.addEventListener('play', function () {
        processImage();
      }, false);
    }
  });
});

var processImage = function processImage() {
  var context = canvas.getContext('2d'); // Get the reduced width and height.

  var _constrainProportions = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT),
      _constrainProportions2 = _slicedToArray(_constrainProportions, 2),
      width = _constrainProportions2[0],
      height = _constrainProportions2[1];

  canvas.width = width;
  canvas.height = height;
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
  convertToBW();
  toAscii();
  setTimeout(function () {
    processImage();
  }, 0);
};

var convertToBW = function convertToBW() {
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imgData.data;

  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];

    var toGreyScale = function toGreyScale(r, g, b) {
      return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    };

    var p = toGreyScale(r, g, b);
    data[i] = data[i + 1] = data[i + 2] = p;
  }

  ctx.putImageData(imgData, 0, 0);
};

var renderPixel = function renderPixel(val) {
  var p = map[Math.floor((map.length - 1) * val / 255)];

  var extend = function extend(pixel, times) {
    while (times - 1 > 0) {
      pixel += pixel;
      times--;
    }

    return pixel;
  };

  return extend(p, 1);
};

var toAscii = function toAscii() {
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imgData.data;
  var ascii = "";
  var height = 0;

  for (var i = 0; i < data.length; i += 4) {
    if (i / 4 % canvas.width == 0) {
      ascii += "\n";
      height++;
    }

    ascii += renderPixel(data[i]);
  }

  asciiImage.style.fontSize = FONT_SIZE;
  asciiImage.textContent = ascii;
};
