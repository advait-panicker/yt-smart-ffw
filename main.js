let fast_speed = 2;
let slow_speed = 1;
let threshold = 0.04;

const video_elem = document.getElementsByClassName("video-stream html5-main-video")[0];

const audioContext = new AudioContext();

const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(video_elem.captureStream());
const analyserNode = audioContext.createAnalyser();
mediaStreamAudioSourceNode.connect(analyserNode);

const pcmData = new Float32Array(analyserNode.fftSize);

let lerp = (t) => t;

function clamp(t) {
    if (t > 1) {
        return 1;
    }
    if (t < 0) {
        return 0;
    }
    return t;
}

let max_vol = 0.00001;

function updateSpeed() {
    analyserNode.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
    let val = Math.sqrt(sumSquares / pcmData.length);
    if (val > max_vol) {
        max_vol = val;
    }
    video_elem.playbackRate = clamp(lerp(1 - val / max_vol)) * (fast_speed - slow_speed) + slow_speed;
    video_elem.requestVideoFrameCallback(updateSpeed);
}

function reset(s) {
    arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    scale = s;
}

video_elem.requestVideoFrameCallback(updateSpeed);
