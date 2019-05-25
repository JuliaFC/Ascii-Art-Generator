const canvas = document.getElementById('canvas');
const terminal = document.getElementById('terminal');
const ctx = canvas.getContext('2d');
const ctxTerminal = terminal.getContext('2d');
const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
const data = imgData.data;
const map = "`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

const MAX_PIXEL_VALUE = 255;
const MIN_PIXEL_VALUE = 0;

let maxPixel = 0;
let minPixel = 255;

let img = new Image();
let filename = '';

const downloadBtn = document.getElementById('download-btn');
const uploadFile = document.getElementById('upload-file');
const revertBtn = document.getElementById('revert-btn');

document.addEventListener('click', e => {
    if(e.target.classList.contains('filter-btn')) {
        if(e.target.classList.contains('ascii-art')){
          convertToBW();
          toAscii();

        }
    }
});

function convertToBW() {
  // enumerate all pixels
  // each pixel's r,g,b,a datum are stored in separate sequential array elements
  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;

  for(let i = 0; i < data.length; i+=4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const toGreyScale = (r, g, b) => (0.21 * r + 0.72 * g + 0.07 * b);
    data[i] = data[i+1] = data[i+2] = toGreyScale(r, g, b);
  }
  ctx.putImageData(imgData, 0, 0);

}

function renderPixel(val) {
  return map[Math.ceil((map.length - 1) * val / 255)];
}

function toAscii() {

  let ascii = "";
  let line = 10;
  let step = 8;

  const imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
  const data = imgData.data;
  let w = canvas.width;

  ctxTerminal.font = '10px serif';
  ctxTerminal.fillStyle = "#ececec"

  for(let i = 0; i < data.length; i+=4) {
    if ((i + 1) % w === 0) {
      ascii += "\n";
    }

    ascii += renderPixel(data[i]);


  }
  ctxTerminal.fillText(ascii, 0, 10);

}

downloadBtn.addEventListener('click', e => {
    const fileExtension = filename.slice(-4);

    let newFileName;

    if(fileExtension === '.jpg' || fileExtension === '.png'){
        newFileName = filename.substring(0, filename.length - 4) + '-edited.jpg';
    }

    download(canvas, newFileName);
});

function download(canvas, filename){
    let e;

    const link = document.createElement('a');

    link.download = filename;
    link.href = canvas.toDataURL('image/jpeg', 0.8);

    e = new MouseEvent('click');
    link.dispatchEvent(e);
}
