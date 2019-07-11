const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
const data = imgData.data;

const asciiImage = document.getElementById('ascii');
const player = document.getElementById('player');
const startStreamButton = document.getElementById('start_stream');
const captureButton = document.getElementById('capture');
const uploadButton = document.getElementById('upload');

const map = " `-^:LiCtfG08@%";
const japaneseMap =" ・ヽヾゞょいうめゆぬむぎふあ";

const CONSTRAIN_RATE = 0.55;
const FONT_SIZE = "3px";
const MAXIMUM_WIDTH = Math.floor(canvas.width * CONSTRAIN_RATE);
const MAXIMUM_HEIGHT = Math.floor(canvas.height * CONSTRAIN_RATE);
const ORIGINAL_WIDTH =  canvas.width;
const ORIGINAL_HEIGHT = canvas.height;

let isOn = false;
let img = new Image();
let filename = '';

let videoTracks;

const clearCanvas = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = map[0];

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);
    return height/width;
};

const startWebcamStream = (stream) => {
  // Attach the video stream to the video element and autoplay.
  if(isOn) {
    videoTracks.forEach((track) => {
        track.stop();
    });
  } else {
    player.srcObject = stream;
    videoTracks = stream.getVideoTracks();
  }
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

startStreamButton.addEventListener('click', () => {
  let webcam = openWebcam();
  webcam.then((stream) => {
  startWebcamStream(stream);
  isOn = !isOn;
    if(isOn) {
      startStreamButton.innerHTML = 'Stop Stream';
    } else {
      startStreamButton.innerHTML = 'Start Stream';
    }
  })
});

captureButton.addEventListener('click', () => {
  processImage();
  convertToBW();
  toAscii();
});

uploadButton.addEventListener('change', e => {
  uploadImage();
});

const uploadImage = () => {
  const file = document.getElementById('upload').files[0];

   const reader = new FileReader();
   const ctx = canvas.getContext('2d');

   if(file){
       filename = file.name;
       reader.readAsDataURL(file);
   }

   reader.addEventListener('load', () => {
       img = new Image();
       img.src = reader.result;
       img.onload = function() {
           canvas.width = img.width;
           canvas.height = img.height;
           ctx.drawImage(img, 0, 0, img.width, img.height);
           const context = canvas.getContext('2d');
           // Get the reduced width and height.
           const [width, height] = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT);

           canvas.width = width;
           canvas.height = height;
           context.drawImage(img, 0, 0, canvas.width, canvas.height);

           convertToBW();
           toAscii();
           detectEdge();

       }
   }, false);
}

const openWebcam = () => {
  return navigator.mediaDevices.getUserMedia({video: true});
}

const convolution = (kernel) => {
const ctx = canvas.getContext('2d');
const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
const data = imgData.data;
const tmpData = imgData.data;
const width = canvas.width;
  for(let i = 0; i<data.length; i++) {
    if(i%4 == 3) {continue;}
      data[i] = (tmpData[i] * kernel[0]
        + (tmpData[i-4] || tmpData[i]) * kernel[1]
        + (tmpData[i+4] || tmpData[i]) * kernel[2]
        + (tmpData[i-4 * width] || tmpData[i]) * kernel[3]
        + (tmpData[i+4 * width] || tmpData[i]) * kernel[4]
        + (tmpData[i-4 * width - 4] || tmpData[i]) * kernel[5]
        + (tmpData[i-4 * width + 4] || tmpData[i]) * kernel[6]
        + (tmpData[i+4 * width - 4] || tmpData[i]) * kernel[7]
        + (tmpData[i+4 * width + 4] || tmpData[i]) * kernel[8]
      )/9;
  }
  console.log('conv output:', data);
  return data;
}

const processImage = () => {
  const context = canvas.getContext('2d');
  // Get the reduced width and height.
  const [width, height] = constrainProportions(ORIGINAL_WIDTH, ORIGINAL_HEIGHT);

  canvas.width = width;
  canvas.height = height;

  console.log('Successfully loaded image!');
  console.log('Image size: ' + canvas.width + ' x ' + canvas.height);
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
  canvas.style.display = 'none';
}

const convertToBW = () => {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

  console.log(imgData);
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

const blurImage = () => {
  const blur = [1/16, 1/8, 1/16, 1/8, 1/4, 1/8, 1/16, 1/8, 1/16];
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

   console.log('before: ')
   console.log(imgData)
   console.log('blurring...')
   for(let i=0; i<1; i++) {
     data.set(convolution(blur));
   }
   ctx.putImageData(imgData, 0, 0);
   console.log('done blurring...')
   return data;

}
const detectEdge = () => {
  const sobelX = [1, 0, -1, 2, 0,-2, 1, 0, -1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  let data = imgData.data;

  data = blurImage();

let sobX = new Int32Array(convolution(sobelX));
console.log('sobX', sobX);

for(let i=0; i<sobX.length; i++) {
  if(i%4 == 3){continue;}
  sobX[i] *= sobX[i];
}
console.log('square sobX', sobX);

let sobY =new Int32Array(convolution(sobelY));
console.log('sobY');

for(let i=0; i<sobY.length; i++) {
  if(i%4 == 3){continue;}
  sobY[i] *= sobY[i];
}
console.log('square sobY', sobY);

let foo;
foo =  new Int32Array(sobX);
for(let i=0; i<sobX.length; i++) {
  if(i%4 == 3){continue;}
  foo[i] += sobY[i];
}
console.log('square sum', foo);

for(let i=0; i<sobX.length; i++) {
  if(i%4 == 3){continue;}
  foo[i] = Math.floor(Math.sqrt(foo[i]));

}
console.log('root sum', foo);

//data.set(foo);
//ctx.putImageData(imgData, 0, 0);

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

  for(let i = 0; i < data.length; i+=4) {
    if((i/4) % canvas.width == 0) {
      ascii += "\n";
    }
    ascii += renderPixel(data[i]);
  }
  asciiImage.style.fontSize = FONT_SIZE;
  asciiImage.textContent = ascii;
}

const download = (canvas, filename) => {
    const link = document.createElement('a');
    let e;

    link.download = filename;
    link.href = canvas.toDataURL('image/jpeg', 0.8);

    e = new MouseEvent('click');
    link.dispatchEvent(e);
}
