var audio = document.getElementById("audio");
var video = document.getElementById("video");
var resultVideo = document.getElementById("resultVideo");

var mediaSource = new MediaSource();
var sourceBuffer;
audio.src = URL.createObjectURL(mediaSource);
var buffer;

var codec = "audio/mpeg";
mediaSource.addEventListener("sourceopen", () => {
  sourceBuffer = mediaSource.addSourceBuffer(codec);
});

fetch("5sec.mp3")
  .then((data) => {
    return data.arrayBuffer();
  })
  .then((arrayBuffer) => {
    buffer = arrayBuffer;
  });
////////////////////////////////////////////////////////////////////////////

var anotherTrack;
var dest;

var audioContext;

// Set up event listener for when the page loads

function createAudioContext() {
  audioContext = new AudioContext();

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then(function (stream1) {
      const stream2 = audio.captureStream(); // Capture audio from audio element
      audioIn_01 = audioContext.createMediaStreamSource(stream1);
      audioIn_02 = audioContext.createMediaElementSource(audio);

      dest = audioContext.createMediaStreamDestination();

      audioIn_02.connect(dest);
      audioIn_01.connect(dest);

      anotherTrack = new MediaStream([
        ...stream1.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      var audioSpeaker = new Audio();
      audioSpeaker.srcObject = stream2;
      // audioSpeaker.play();

      var mediaRecorder = new MediaRecorder(anotherTrack);

      video.srcObject = stream1;

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("in data avalaible");
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        console.log("in stop");
        console.log(chunks);
        const blob = new Blob(chunks, {
          type: "video/webm",
        });

        const url = URL.createObjectURL(blob);
        resultVideo.src = url;
      };

      var startRecording = document.getElementById("startRecording");
      var stopRecording = document.getElementById("stopRecording");

      startRecording.addEventListener("click", () => {
        console.log("in start");
        mediaRecorder.start();
      });

      stopRecording.addEventListener("click", () => {
        mediaRecorder.stop();
      });
    })
    .catch(function (error) {
      console.log("getUserMedia error: ", error);
    });
}

document
  .getElementById("initialize")
  .addEventListener("click", createAudioContext);

document.getElementById("addBuffer").addEventListener("click", () => {
  sourceBuffer.appendBuffer(buffer);
  audio.play();
});

document
  .getElementById("changeSrcAndAddBuffer")
  .addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    sourceBuffer.timestampOffset = 0;
    sourceBuffer.remove(0, Infinity);
    console.log(sourceBuffer);
  });
