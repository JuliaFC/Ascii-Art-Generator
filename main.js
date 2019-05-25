const canvas = document.getElementById('canvas');
const terminal = document.getElementById('terminal');
const ctx = canvas.getContext('2d');
const MAX_PIXEL_VALUE = 255;
const MIN_PIXEL_VALUE = 0;

let img = new Image();
let filename = '';

const downloadBtn = document.getElementById('download-btn');
const uploadFile = document.getElementById('upload-file');
const revertBtn = document.getElementById('revert-btn');

document.addEventListener('click', e => {
    if(e.target.classList.contains('filter-btn')) {
        if(e.target.classList.contains('ascii-art')){
          const terminalContext = terminal.getContext('2d');
          const imgData = ctx.getImageData(0,0,snapshotCanvas.width, snapshotCanvas.height);
          const data = imgData.data;
          const map = "`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
          let ascii = "";
          let line = 10;
          let step = 8;
          // enumerate all pixels
          // each pixel's r,g,b,a datum are stored in separate sequential array elements
          const ct = document.getElementById('terminal').getContext('2d');
          ct.font = '10px serif';
          ct.fillStyle = "#ececec"

          for (let i = 0; i < data.length; i += 32) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i]     = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
            if((i/8) % snapshotCanvas.width == 0) {
              ascii += "\n";
              ct.fillText(ascii, 0, line);
              console.log(ascii);
              ascii = "";
              line += step;
            }
            let idx = Math.floor(avg/MAX_PIXEL_VALUE * map.length) - 1;
            ascii += map[idx];

          }
          ctx.putImageData(imgData, 0, 0);


        }
    }
});

revertBtn.addEventListener('click', e => {
    Caman('#canvas', img, function(){
        this.revert();
    });
})

function normalize() {
/*
  max_pixel = max(map(max, intensity_matrix))
    min_pixel = min(map(min, intensity_matrix))
    for row in intensity_matrix:
        rescaled_row = []
        for p in row:
            r = MAX_PIXEL_VALUE * (p - min_pixel) / float(max_pixel - min_pixel)
            rescaled_row.append(r)
        normalized_intensity_matrix.append(rescaled_row) */
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
