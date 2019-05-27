export function convolution(img, kernel, canvas) {

  const up = 2;
  const dn = 1;
  let acc = 0;
  console.log(canvas.height, canvas.width);

  for(let i = up; i<canvas.height-dn; i++) {
    for(let j = up; j<canvas.width-dn; j++) {
        let acc = 0;

          for(let m = 1; m<3; m++) {
            for(let n = 1; n<3; n++) {
                  let index = ((j + n - up) + ((i + m - up) * imgData.width)) * 4;
                  acc = acc + Math.floor((img[index]) * kernel[m][n]);
              }
          }
          index = (j + (i * imgData.width)) * 4;
          img[index] = (acc);
          img[index+1] = (acc);
          img[index+2] = (acc);

      }
  }
}
