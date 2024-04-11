let fast_speed = 2;
let slow_speed = 1;
let threshold = 0.04;

// function lerp(t) {
//     if (t > threshold) {
//         return 1;
//     }
//     return 0;
// }

function lerp(t) {
    return -2 * t * t * t + 3 * t * t;
}

function clamp(t) {
    if (t > 1) {
        return 1;
    }
    if (t < 0) {
        return 0;
    }
    return t;
}

let bar = document.createElement('div');

document.addEventListener('keypress', () => {
    document.getElementById('above-the-fold').appendChild(bar);
});

function onElementLoaded(targetElement) {

    const video_elem = targetElement;

    bar.style.height = '10px';
    bar.style.backgroundColor = 'white';
    const audioContext = new AudioContext();

    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(video_elem.captureStream());
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);

    const pcmData = new Float32Array(analyserNode.fftSize);

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

    video_elem.requestVideoFrameCallback(updateSpeed);
}

const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const targetElement = document.querySelector('.video-stream.html5-main-video');
            if (targetElement) {
                observer.disconnect();
                console.log(targetElement);
                onElementLoaded(targetElement);
                return; 
            }
        }
    }
};

const observer = new MutationObserver(callback);

observer.observe(document.documentElement, { childList: true, subtree: true });
