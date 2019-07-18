import {openWebcam, startStream} from '../src/webcam.js'

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
const data = imgData.data;

const asciiImage = document.getElementById('ascii');
const player = document.getElementById('player');
const startStreamButton = document.getElementById('start_stream');
const uploadButton = document.getElementById('upload');

const map = " `-^¬:L*iCtfG0X8@#&%";
const japaneseMap =" ・ヽヾゞょいうめゆぬむぎふあ";

const CONSTRAIN_RATE = 0.175;
const FONT_SIZE = "5px";
const MAXIMUM_WIDTH = Math.floor(canvas.width * CONSTRAIN_RATE);
const MAXIMUM_HEIGHT = Math.floor(canvas.height * CONSTRAIN_RATE);
const ORIGINAL_WIDTH =  canvas.width;
const ORIGINAL_HEIGHT = canvas.height;

let isOn = false;

const clearCanvas = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = map[0];

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);
    return height/width;
};

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

window.onload = () => {
  player.style.display = 'none';
  canvas.style.display = 'none';
};

startStreamButton.addEventListener('click', () => {
  let webcam = openWebcam();
  webcam.then((stream) => {
  const videoTracks = startStream(stream, isOn, player);
  isOn = !isOn;
    if(isOn) {
      startStreamButton.innerHTML = 'Stop Stream';
      player.addEventListener('play', function() {
        processImage();
      }, false);
    } else {
      startStreamButton.innerHTML = 'Start Stream';
    }
  })
});

uploadButton.addEventListener('change', e => {
  uploadImage();
});

const uploadImage = () => {
   const file = document.getElementById('upload').files[0];
   const reader = new FileReader();

   if(file){
       reader.readAsDataURL(file);
   }
   else {
     console.log('Error opening file!')
   }

   reader.addEventListener('load', () => {
       let img = new Image();
       img.src = reader.result;
       img.onload = function() {
           canvas.width = img.width;
           canvas.height = img.height;
           ctx.drawImage(img, 0, 0, img.width, img.height);
           // Get the reduced width and height.
           const [width, height] = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT);

           canvas.width = width;
           canvas.height = height;
           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

           convertToBW();
           toAscii();
       }
   }, false);
}

const processImage = () => {
  const context = canvas.getContext('2d');
  // Get the reduced width and height.
  const [width, height] = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT);

  canvas.width = width;
  canvas.height = height;
  context.drawImage(player, 0, 0, canvas.width, canvas.height);

  convertToBW();
  toAscii();
  setTimeout(function() {
    processImage();
  }, 0);
}

const convertToBW = () => {
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

const renderPixel = (val) => {
  let p = map[Math.floor((map.length - 1) * val / 255)];
  const extend = (pixel, times) => {
    while(times-1 > 0) {
      pixel += pixel;
      times--;
    }
    return pixel;
  };
  return extend(p, 1);
}

const toAscii = () => {

  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

  let ascii = "";
  let height = 0;

  for(let i = 0; i < data.length; i+=4) {
    if((i/4) % canvas.width == 0) {
      ascii += "\n";
      height++;
    }
    ascii += renderPixel(data[i]);
  }

  asciiImage.style.fontSize = FONT_SIZE;
  asciiImage.textContent = ascii;
}
