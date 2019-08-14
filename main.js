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

var scoreElements = {
    highscoreElement: undefined,
    instantScore: undefined,
    milkScore: undefined,
    yogurtScore: undefined,
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
        scoreElements.highscoreElement.innerText = 'New highscore: ' + shakes + ' shakes';
    }
    setPrizes(shakes);
    scoreElements.instantScore.innerText = 'Your score: ' + shakes + ' shakes in ' + finalTime + ' seconds';
}

function shaking() {
    shakeEvent.start();
    shakes = 0;
    finalTime = 0;
    scoreElements.instantScore.innerText = 'Shake phone to milk the cow';
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
        scoreElements.milkScore.innerText = resultMilk + 'x';
    }
    if (shakes >= 80) {
        const resultYogurt = localStorage.getItem('yogurtScore') ? parseInt(localStorage.getItem('yogurtScore')) + 1 : 1;
        localStorage.setItem('yogurtScore', resultYogurt)
        scoreElements.yogurtScore.innerText = resultYogurt + 'x';
    }
    if (shakes >= 120) {
        const resultIceCream = localStorage.getItem('iceCreamScore') ? parseInt(localStorage.getItem('iceCreamScore')) + 1 : 1;
        localStorage.setItem('iceCreamScore', resultIceCream)
        scoreElements.iceCreamScore.innerText = resultIceCream + 'x';
    }
    if (shakes >= 200) {
        const resultCheese = localStorage.getItem('cheeseScore') ? parseInt(localStorage.getItem('cheeseScore')) + 1 : 1;
        localStorage.setItem('cheeseScore', resultCheese)
        scoreElements.cheeseScore.innerText = resultCheese + 'x';
    }
}

function getElementsOnPage() {
    buttonRestart = document.getElementById('button');
    bodyShape = document.getElementById('body');
    scoreElements.highscoreElement = document.getElementById('score');
    scoreElements.instantScore = document.getElementById('instantScore');
    scoreElements.milkScore = document.getElementById('milkScore');
    scoreElements.yogurtScore = document.getElementById('yogurtScore');
    scoreElements.iceCreamScore = document.getElementById('iceCreamScore');
    scoreElements.cheeseScore = document.getElementById('cheeseScore');
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
	//document.body.removeChild(buttonRestart);
	var highScore = document.querySelector('.highscore');
	var goal = document.querySelector('.goal');
	var yourLibrary = document.querySelector('.your-library');
	var backgroundTop = document.querySelector('.background-top');
	document.body.removeChild(highScore);
	document.body.removeChild(goal);
	document.body.removeChild(yourLibrary);
	document.body.removeChild(backgroundTop);
	document.body.removeChild(bodyShape);
    var h1 = document.createElement("H1");
    var h2 = document.createElement("H2");
    var h4 = document.createElement("H4");
    var gif = document.createElement("IMG");
    var imgPlayStore = document.createElement("IMG");
    imgPlayStore.style.width = '250px'
    imgPlayStore.style.cursor = 'pointer'
    imgPlayStore.src = "https://lh3.googleusercontent.com/ShkH71_PaT4dXnNq7lTKQfnC2RpNYQZI08acnQBsuGZQEGzcWM-pKlqOPyFh1H0DVbD102HSSfJCPADx_TcKYP-N3afW-u4neA2z2Q"
    imgPlayStore.addEventListener("click", (e) => {
        window.open('https://play.google.com/store/apps/details?id=today.milkthecow.game', '_blank');
      });
    gif.style.width = '600px'
    gif.src = "./assets/cow_init.gif"
    h1.innerText = 'This game needs a mobile device to play';
    h1.style.color = "white"
    h1.style.maxWidth = "340px"
    h1.style.textAlign = "center"
    h4.innerText = 'OR';
    h4.style.color = "white"
    h4.style.maxWidth = "340px"
    h4.style.textAlign = "center"
    h2.innerText = 'Download on PlayStore';
    h2.style.color = "white"
    h2.style.maxWidth = "340px"
    h2.style.textAlign = "center"
    document.body.style.padding = "32px"
    document.body.style.backgroundColor = "#6dbd88"
    document.body.style.display = "flex"
    document.body.style.alignItems = "center"
    // document.body.style.justifyContent = "center"
    document.body.appendChild(gif);
    document.body.appendChild(h1);
    document.body.appendChild(h4);
    document.body.appendChild(h2);
    document.body.appendChild(imgPlayStore);
}

function init() {
	getElementsOnPage()
    if (!isMobile()) {
        showOnDesktop();
        return;
    }
    bodyShape.style.backgroundImage = 'url(./assets/cow.gif)';
    scoreElements.highscoreElement.innerText = 'Highscore: ' + initScores('scoreCow') + ' shakes';
    scoreElements.milkScore.innerText = initScores('milkScore') + 'x';
    scoreElements.yogurtScore.innerText = initScores('yogurtScore') + 'x';
    scoreElements.iceCreamScore.innerText = initScores('iceCreamScore') + 'x';
    scoreElements.cheeseScore.innerText = initScores('cheeseScore') + 'x';
    shaking();
}
