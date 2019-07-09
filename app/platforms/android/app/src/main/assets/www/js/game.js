Game = function () {
    const shakeEvent = new Shake({threshold: 10, timeout: 100});
    let timingOver;
    let shakingTime;
    let buttonRestart;
    let imageInit;
    let imageEnd;
    let finalTime = 0;
    let shakes = 0;

    const EVENTS = {
        SHAKING: 'shaking',
        FINISHED_GAME: 'finishedgame',
        READY_TO_SHAKE: 'readytoshake',
    };

    /** GAME **/
    function readyShake() {
        shakeEvent.start();
        shakes = 0;
        finalTime = 0;
        buttonRestart.style.display = 'none';
        buttonRestart.innerText = 'Restart';
        imageInit.style.display = 'block';
        imageEnd.style.display = 'none';
        window.addEventListener('shake', onShaking, false);
        emit(EVENTS.READY_TO_SHAKE);
    }

    const onShaking = () => {
        clearTimeout(timingOver);
        emit(EVENTS.SHAKING);
        if (shakes === 0) {
            shakingTime = 0;
            shakingTime = +new Date();
        }
        shakes += 1;
        timingOver = setTimeout(() => endShaking(), 1000)
    };

    function endShaking() {
        window.removeEventListener('shake', onShaking, false);
        shakeEvent.stop();
        clearTimeout(timingOver);
        buttonRestart.innerText = "Restart";
        navigator.vibrate(1500);
        imageInit.style.display = 'none';
        imageEnd.style.display = 'block';
        buttonRestart.style.display = 'block';
        finalTime = Math.round((+new Date() - shakingTime) / 1000);
        emit(EVENTS.FINISHED_GAME, {shakes: shakes, time: finalTime});
    }

    /** MISC FUNCTIONS **/
    function getElementsOnPage() {
        buttonRestart = document.getElementById('buttonRestart');
        imageInit = document.getElementById('image-init');
        imageEnd = document.getElementById('image-end');
    }

    function emit(eventType, data = undefined) {
        const event = new CustomEvent(eventType, {'detail': data});
        document.dispatchEvent(event);
    }

    function init() {
        getElementsOnPage();
        // disallow lock screen
        window.plugins.insomnia.keepAwake();
        imageInit.style.display = 'block';
        imageEnd.style.display = 'none';
        buttonRestart.addEventListener('touchstart', () => readyShake());
    }

    init();
    this.start = readyShake;
    this.EVENTS = EVENTS;
};
