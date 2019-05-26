const canvas = document.getElementById('canvas');
const asciiImage = document.getElementById('ascii');

const ctx = canvas.getContext('2d');
const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
const data = imgData.data;
const japaneseMap = " .,~:i1tfLCG08@$";
const map ="・ヽヾゞょいうめゆぬむぎふあ";
const player = document.getElementById('player');
const snapshotCanvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');

let img = new Image();
let filename = '';
let greyScale = [];

let videoTracks;

const handleSuccess = (stream) => {
  // Attach the video stream to the video element and autoplay.
  player.srcObject = stream;
  videoTracks = stream.getVideoTracks();
};
const contrast = 20;
const constrainRate = 0.65;
const fontSize = "2px";
const MAXIMUM_WIDTH = Math.floor(canvas.width * constrainRate);
const MAXIMUM_HEIGHT = Math.floor(canvas.height * constrainRate);


const getFontRatio = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = map[0];

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);
    return height/width;
};


const constrainProportions = (width, height) => {
    const rectifiedWidth = Math.floor(getFontRatio() * width);

    if (height > MAXIMUM_HEIGHT) {
        const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
        return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
        const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
        return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [rectifiedWidth, height];
};

function processImage() {
  const context = canvas.getContext('2d');
  // Draw the video frame to the canvas.
  const [width, height] = constrainProportions(snapshotCanvas.width, snapshotCanvas.height);
  snapshotCanvas.width = width;
  snapshotCanvas.height = height;

  console.log('Successfully loaded image!');
  console.log('Image size: ' + snapshotCanvas.width + ' x ' + snapshotCanvas.height);

  context.drawImage(player, 0, 0, snapshotCanvas.width,
      snapshotCanvas.height);
  videoTracks.forEach((track) => {
      track.stop();
  });
  player.style.display = 'none';
}

captureButton.addEventListener('click', () => {
  processImage();
  convertToBW();
  toAscii();
});

navigator.mediaDevices.getUserMedia({video: true})
    .then(handleSuccess);

function convertToBW() {
  // enumerate all pixels
  // each pixel's r,g,b,a datum are stored in separate sequential array elements

  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

  for(let i = 0; i < data.length; i+=4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const toGreyScale = (r, g, b) =>  (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    let p =  toGreyScale(r, g, b);
    data[i] = data[i+1] = data[i+2] = p;
  }

  ctx.putImageData(imgData, 0, 0);
}

function renderPixel(val) {
  let p = map[Math.ceil((map.length - 1) * val / 255)];
  const extend = (pixel, times) => {
    while(times-1 > 0) {
      pixel += pixel;
      times--;
    }
    return pixel;
  };
  return extend(p, 1);
}

function toAscii() {

  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

  let ascii = "";

  for(let i = 0; i < data.length; i+=4) {
    if((i/4) % canvas.width == 0) {
      ascii += "\n";
    }
    ascii += renderPixel(data[i]);
  }
  asciiImage.style.fontSize = fontSize;
  asciiImage.textContent = ascii;
}


function download(canvas, filename){
    const link = document.createElement('a');
    let e;

    link.download = filename;
    link.href = canvas.toDataURL('image/jpeg', 0.8);

    e = new MouseEvent('click');
    link.dispatchEvent(e);
}
