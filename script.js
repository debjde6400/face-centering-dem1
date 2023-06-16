const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

    if(detection) {
      const resizedDetections = faceapi.resizeResults(detection, displaySize);
      const landmarks = detection.landmarks;
      const jawPoints = landmarks.getJawOutline().map(o => ({ x: o.x, y: o.y }));

      console.log("Jaw points :: ", jawPoints);
      console.log("Median :: ", jawPoints[8]);
      console.log("Horizontal diff 1 :: ", jawPoints[8].x - jawPoints[7].x);
      console.log("Horizontal diff 2 :: ", jawPoints[9].x - jawPoints[8].x);

      const horiz_diff_component = Math.abs(jawPoints[9].x + jawPoints[7].x - 2 * jawPoints[8].x);
      //console.log("Horizontal diff component :: ", horiz_diff_component);

      if(horiz_diff_component < 1) {
        console.log("Face centered horizontally.");
      }

      const vertical_diff_component = Math.abs(jawPoints[0].y - jawPoints[16].y);

      if(vertical_diff_component < 5) {
        console.log("Face centered vertically.");
      }

      //console.log("Vertical diff 2 :: ", jawPoints[9].x - jawPoints[8].x);

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      //faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      //faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }

  }, 5000);
})
