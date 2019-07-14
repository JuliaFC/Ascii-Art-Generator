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
