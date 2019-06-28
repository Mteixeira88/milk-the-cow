var shakeEvent = new Shake({ threshold: 25, timeout: 300 });
var finish = false;
var timingOver;
var time;
var buttonRestart;
var bodyShape;
var finalTime = 0;
var shakes = 0;

var images = {
    toShow: './assets/cow_init.gif',
    init: './assets/cow_init.gif',
    shaking: './assets/cow_shake.gif',
    end: './assets/cow_end.gif'
}

var scoresElements = {
    highscoreElement: undefined,
    instantScore: undefined,
    milkScore: undefined,
    yougurtScore: undefined,
    iceCreamScore: undefined,
    cheeseScore: undefined,
}

document.addEventListener('DOMContentLoaded', init, false);

function isMobile() {
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

function initShaking() {
    images.toShow = images.shaking;
    bodyShape.style.backgroundImage = 'url(' + images.shaking + ')';
    time = +new Date();
}

function endShaking() {
    clearTimeout(timingOver);
    buttonRestart.innerText = "Restart";
    shakeEvent.stop();
    bodyShape.style.backgroundImage = 'url(' + images.end + ')';
    buttonRestart.style.display = 'block';
    finalTime = Math.round((+new Date() - time) / 1000);
    if (!localStorage.getItem('scoreCow') || shakes > parseInt(localStorage.getItem('scoreCow'))) {
        localStorage.setItem('scoreCow', shakes)
        scoresElements.highscoreElement.text = 'New highscore: ' + shakes + ' shakes';
    }
    setPrizes(shakes);
    scoresElements.instantScore.innerText = 'Your score: ' + shakes + ' shakes in ' + finalTime + ' seconds';
}

function shaking() {
    shakeEvent.start();
    shakes = 0;
    finalTime = 0;
    scoresElements.instantScore.innerText = 'Shake phone to milk the cow';
    buttonRestart.style.display = 'none';
    images.toShow = images.init;
    bodyShape.style.backgroundImage = 'url(' + images.toShow + ')';
    window.addEventListener('shake', () => {
        clearTimeout(timingOver);
        if (shakes === 0) {
            initShaking();
        }
        shakes += 1;
        timingOver = setTimeout(() => {
            endShaking();
        }, 1000)
    }, false);
}

function setPrizes(shakes) {
    if (shakes >= 30) {
        const resultMilk = localStorage.getItem('milkScore') ? parseInt(localStorage.getItem('milkScore')) + 1 : 1;
        localStorage.setItem('milkScore', resultMilk)
        scoresElements.milkScore.innerText = resultMilk + 'x';
    }
    if (shakes >= 80) {
        const resultYogurt = localStorage.getItem('yogurtScore') ? parseInt(localStorage.getItem('yogurtScore')) + 1 : 1;
        localStorage.setItem('yogurtScore', resultYogurt)
        scoresElements.yogurtScore.innerText = resultYogurt + 'x';
    }
    if (shakes >= 120) {
        const resultIceCream = localStorage.getItem('iceCreamScore') ? parseInt(localStorage.getItem('iceCreamScore')) + 1 : 1;
        localStorage.setItem('iceCreamScore', resultIceCream)
        scoresElements.iceCreamScore.innerText = resultIceCream + 'x';
    }
    if (shakes >= 200) {
        const resultCheese = localStorage.getItem('cheeseScore') ? parseInt(localStorage.getItem('cheeseScore')) + 1 : 1;
        localStorage.setItem('cheeseScore', resultCheese)
        scoresElements.cheeseScore.innerText = resultCheese + 'x';
    }
}

function getElementsOnPage() {
    buttonRestart = document.getElementById('button');
    bodyShape = document.getElementById('body');
    scoresElements.highscoreElement = document.getElementById('score');
    scoresElements.instantScore = document.getElementById('instantScore');
    scoresElements.milkScore = document.getElementById('milkScore');
    scoresElements.yogurtScore = document.getElementById('yogurtScore');
    scoresElements.iceCreamScore = document.getElementById('iceCreamScore');
    scoresElements.cheeseScore = document.getElementById('cheeseScore');
}

function initScores(score) {
    var result = 0;
    if (localStorage.getItem(score)) {
        result = localStorage.getItem(score);
    } else {
        localStorage.setItem(score, result);
    }
    return result
}

function showOnDesktop() {
    var content = document.getElementById('content');
    document.body.removeChild(content);
    var h1 = document.createElement("H1");
    var gif = document.createElement("IMG");
    gif.style.width = '600px'
    gif.src = "./assets/desktop.gif"
    h1.innerText = 'Use a mobile device to play';
    document.body.style.padding = "32px"
    document.body.appendChild(h1);
    document.body.appendChild(gif);
}

function init() {
    if (!isMobile()) {
        showOnDesktop();
        return;
    }
    getElementsOnPage()
    bodyShape.style.backgroundImage = 'url(./assets/cow.gif)';
    scoresElements.highscoreElement.innerText = 'Highscore: ' + initScores('scoreCow') + ' shakes';
    scoresElements.milkScore.innerText = initScores('milkScore') + 'x';
    scoresElements.yogurtScore.innerText = initScores('yogurtScore') + 'x';
    scoresElements.iceCreamScore.innerText = initScores('iceCreamScore') + 'x';
    scoresElements.cheeseScore.innerText = initScores('cheeseScore') + 'x';
    shaking();
}
