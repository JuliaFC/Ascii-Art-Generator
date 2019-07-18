const openWebcam = () => {
  return navigator.mediaDevices.getUserMedia({video: true});
}

const startStream = (stream, isOn, player) => {
  // Attach the video stream to the video element and autoplay.
  let videoTracks;
  if(isOn) {
    videoTracks.forEach((track) => {
        track.stop();
    });
  } else {
    player.srcObject = stream;
    videoTracks = stream.getVideoTracks();
  }

  return videoTracks;
};

export {openWebcam, startStream}
