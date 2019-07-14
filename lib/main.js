"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imgData.data;
var asciiImage = document.getElementById('ascii');
var player = document.getElementById('player');
var startStreamButton = document.getElementById('start_stream');
var captureButton = document.getElementById('capture');
var uploadButton = document.getElementById('upload');
var map = " `-^:LiCtfG08@%";
var japaneseMap = " ・ヽヾゞょいうめゆぬむぎふあ";
var CONSTRAIN_RATE = 0.55;
var FONT_SIZE = "3px";
var MAXIMUM_WIDTH = Math.floor(canvas.width * CONSTRAIN_RATE);
var MAXIMUM_HEIGHT = Math.floor(canvas.height * CONSTRAIN_RATE);
var ORIGINAL_WIDTH = canvas.width;
var ORIGINAL_HEIGHT = canvas.height;
var isOn = false;
var img = new Image();
var filename = '';
var videoTracks;

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

var startWebcamStream = function startWebcamStream(stream) {
  // Attach the video stream to the video element and autoplay.
  if (isOn) {
    videoTracks.forEach(function (track) {
      track.stop();
    });
  } else {
    player.srcObject = stream;
    videoTracks = stream.getVideoTracks();
  }
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

startStreamButton.addEventListener('click', function () {
  var webcam = openWebcam();
  webcam.then(function (stream) {
    startWebcamStream(stream);
    isOn = !isOn;

    if (isOn) {
      startStreamButton.innerHTML = 'Stop Stream';
    } else {
      startStreamButton.innerHTML = 'Start Stream';
    }
  });
});
captureButton.addEventListener('click', function () {
  processImage();
  convertToBW();
  toAscii();
});
uploadButton.addEventListener('change', function (e) {
  uploadImage();
});

var uploadImage = function uploadImage() {
  var file = document.getElementById('upload').files[0];
  var reader = new FileReader();
  var ctx = canvas.getContext('2d');

  if (file) {
    filename = file.name;
    reader.readAsDataURL(file);
  }

  reader.addEventListener('load', function () {
    img = new Image();
    img.src = reader.result;

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      var context = canvas.getContext('2d'); // Get the reduced width and height.

      var _constrainProportions = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT),
          _constrainProportions2 = _slicedToArray(_constrainProportions, 2),
          width = _constrainProportions2[0],
          height = _constrainProportions2[1];

      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      convertToBW();
      toAscii();
      detectEdge();
    };
  }, false);
};

var openWebcam = function openWebcam() {
  return navigator.mediaDevices.getUserMedia({
    video: true
  });
};

var processImage = function processImage() {
  var context = canvas.getContext('2d'); // Get the reduced width and height.

  var _constrainProportions3 = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT),
      _constrainProportions4 = _slicedToArray(_constrainProportions3, 2),
      width = _constrainProportions4[0],
      height = _constrainProportions4[1];

  canvas.width = width;
  canvas.height = height;
  console.log('Successfully loaded image!');
  console.log('Image size: ' + canvas.width + ' x ' + canvas.height);
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
  canvas.style.display = 'none';
};

var convertToBW = function convertToBW() {
  var ctx = canvas.getContext('2d');
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imgData.data;
  console.log(imgData);

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

  for (var i = 0; i < data.length; i += 4) {
    if (i / 4 % canvas.width == 0) {
      ascii += "\n";
    }

    ascii += renderPixel(data[i]);
  }

  asciiImage.style.fontSize = FONT_SIZE;
  asciiImage.textContent = ascii;
};

var download = function download(canvas, filename) {
  var link = document.createElement('a');
  var e;
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.8);
  e = new MouseEvent('click');
  link.dispatchEvent(e);
};