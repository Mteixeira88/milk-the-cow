let game;
let scoreElements = {
    highScoreElement: undefined,
    instantScore: undefined,
    milkScore: undefined,
    yogurtScore: undefined,
    iceCreamScore: undefined,
    cheeseScore: undefined,
};

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
    scoreElements.highScoreElement.innerText = 'Highscore: ' + getScore('scoreCow') + ' shakes';
    scoreElements.milkScore.innerText = getScore('milkScore') + 'x';
    scoreElements.yogurtScore.innerText = getScore('yogurtScore') + 'x';
    scoreElements.iceCreamScore.innerText = getScore('iceCreamScore') + 'x';
    scoreElements.cheeseScore.innerText = getScore('cheeseScore') + 'x';
    game = new Game();
    document.addEventListener(game.EVENTS.FINISHED_GAME, onEndShake);
    document.addEventListener(game.EVENTS.READY_TO_SHAKE, onReadyToShake);
    game.start();
}

function onEndShake(evt) {
    const data = evt.detail;
    if (!localStorage.getItem('scoreCow') || data.shakes > parseInt(localStorage.getItem('scoreCow'))) {
        localStorage.setItem('scoreCow', data.shakes.toString());
        scoreElements.highScoreElement.innerText = 'New highscore: ' + data.shakes + ' shakes';
    }
    setPrizes(data.shakes);
    scoreElements.instantScore.innerText = 'Your score: ' + data.shakes + ' shakes in ' + data.time + ' seconds';
    rest('insertScore', data.shakes);
}

function onReadyToShake() {
    scoreElements.instantScore.innerText = 'Shake phone to milk the cow';
}

document.addEventListener('deviceready', function () {
    init();
});
