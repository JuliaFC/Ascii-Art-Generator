const openWebcam = () => {
  return navigator.mediaDevices.getUserMedia({video: true});
}

const startStream = (stream, isOn, player) => {
  // Attach the video stream to the video element and autoplay.
  let videoTracks = null;
  if(stream) {
    player.srcObject = stream;
    videoTracks = stream.getVideoTracks();
  }
  return videoTracks;
};

export {openWebcam, startStream}
