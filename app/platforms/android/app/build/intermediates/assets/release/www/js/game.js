Game = function () {
    const shakeEvent = new Shake({threshold: 10, timeout: 100});
    let timingOver;
    let time;
    let buttonRestart;
    let imageInit;
    let imageEnd;
    let finalTime = 0;
    let shakes = 0;

    /*let images = {
        init: './assets/cow_init.gif',
        shaking: './assets/cow_shake.gif',
        end: './assets/cow_end.gif'
    };*/

    let scoreElements = {
        highScoreElement: undefined,
        instantScore: undefined,
        milkScore: undefined,
        yogurtScore: undefined,
        iceCreamScore: undefined,
        cheeseScore: undefined,
    };

    function endShaking() {
        window.removeEventListener('shake', onShaking, false);
        shakeEvent.stop();
        clearTimeout(timingOver);
        buttonRestart.innerText = "Restart";
        navigator.vibrate(500);
        imageInit.style.display = 'none';
        imageEnd.style.display = 'block';
        buttonRestart.style.display = 'block';
        finalTime = Math.round((+new Date() - time) / 1000);
        if (!localStorage.getItem('scoreCow') || shakes > parseInt(localStorage.getItem('scoreCow'))) {
            localStorage.setItem('scoreCow', shakes.toString());
            scoreElements.highScoreElement.innerText = 'New highscore: ' + shakes + ' shakes';
        }
        setPrizes(shakes);
        scoreElements.instantScore.innerText = 'Your score: ' + shakes + ' shakes in ' + finalTime + ' seconds';
        rest('insertScore', shakes);
    }

    const onShaking = () => {
        clearTimeout(timingOver);
        if (shakes === 0) {
            time = 0;
            time = +new Date();
        }
        shakes += 1;
        timingOver = setTimeout(() => endShaking(), 1000)
    };

    function readyShake() {
        shakeEvent.start();
        shakes = 0;
        finalTime = 0;
        scoreElements.instantScore.innerText = 'Shake phone to milk the cow';
        buttonRestart.style.display = 'none';
        imageInit.style.display = 'block';
        imageEnd.style.display = 'none';
        window.addEventListener('shake', onShaking, false);
    }

    function setPrizes(shakes) {
        let _shakes = shakes;
        while (_shakes >= 30) {
            if (_shakes >= 200) {
                const resultCheese = localStorage.getItem('cheeseScore') ? parseInt(localStorage.getItem('cheeseScore')) + 1 : 1;
                localStorage.setItem('cheeseScore', resultCheese);
                scoreElements.cheeseScore.innerText = resultCheese + 'x';
                _shakes -= 200;
            } else if (_shakes >= 120) {
                const resultIceCream = localStorage.getItem('iceCreamScore') ? parseInt(localStorage.getItem('iceCreamScore')) + 1 : 1;
                localStorage.setItem('iceCreamScore', resultIceCream);
                scoreElements.iceCreamScore.innerText = resultIceCream + 'x';
                _shakes -= 120;
            } else if (_shakes >= 80) {
                const resultYogurt = localStorage.getItem('yogurtScore') ? parseInt(localStorage.getItem('yogurtScore')) + 1 : 1;
                localStorage.setItem('yogurtScore', resultYogurt);
                scoreElements.yogurtScore.innerText = resultYogurt + 'x';
                _shakes -= 80;
            } else if (_shakes >= 30) {
                const resultMilk = localStorage.getItem('milkScore') ? parseInt(localStorage.getItem('milkScore')) + 1 : 1;
                localStorage.setItem('milkScore', resultMilk);
                scoreElements.milkScore.innerText = resultMilk + 'x';
                _shakes -= 30;
            }
        }
    }

    function getElementsOnPage() {
        buttonRestart = document.getElementById('button');
        imageInit = document.getElementById('image-init');
        imageEnd = document.getElementById('image-end');
        scoreElements.highScoreElement = document.getElementById('score');
        scoreElements.instantScore = document.getElementById('instantScore');
        scoreElements.milkScore = document.getElementById('milkScore');
        scoreElements.yogurtScore = document.getElementById('yogurtScore');
        scoreElements.iceCreamScore = document.getElementById('iceCreamScore');
        scoreElements.cheeseScore = document.getElementById('cheeseScore');
    }

    function getScore(score) {
        let result = 0;
        if (localStorage.getItem(score)) {
            result = parseInt(localStorage.getItem(score), 0);
        } else {
            localStorage.setItem(score, result.toString());
        }
        return result
    }

    function init() {
        getElementsOnPage();
        // disallow lock screen
        window.plugins.insomnia.keepAwake();
        imageInit.style.display = 'block';
        imageEnd.style.display = 'none';
        scoreElements.highScoreElement.innerText = 'Highscore: ' + getScore('scoreCow') + ' shakes';
        scoreElements.milkScore.innerText = getScore('milkScore') + 'x';
        scoreElements.yogurtScore.innerText = getScore('yogurtScore') + 'x';
        scoreElements.iceCreamScore.innerText = getScore('iceCreamScore') + 'x';
        scoreElements.cheeseScore.innerText = getScore('cheeseScore') + 'x';
        buttonRestart.addEventListener('click', () => readyShake());
        readyShake();
    }

    init();
};
