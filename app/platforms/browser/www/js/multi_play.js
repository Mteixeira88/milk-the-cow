let bt;

const input = document.getElementById('inputText');
const createGameButton = document.getElementById('createGame');
const joinGameButton = document.getElementById('joinGame');
const debug = document.getElementById('debug');

function joinGame() {
    bt.scan();
}

function createGame() {
    bt.startServer();
    debug.innerHTML = 'Server created!<br />Waiting for player...';
}

function eventListenner() {
    input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                console.log(event);
                // Cancel the default action, if needed
                event.preventDefault();
                bt.sendData({test: 'test', data: event.target.value});
                event.target.value = '';
            }
        }
    );
    createGameButton.addEventListener('touchstart', createGame);
    joinGameButton.addEventListener('touchstart', joinGame)
}

function onReceivedRequest(event) {
    const request = event.detail;
    if (request.type === 'newuser') {
        document.getElementById("debug").innerHTML += '<br />' + request.data;
    } else {
        document.getElementById("debug").innerHTML += '<br />' + JSON.stringify(request);
    }
}

function onNewDevice(event) {
    const device = event.detail;
    const listItem = document.createElement('p'),
        html = '' + (device.name ? device.name : 'UNKNOWN') + ' - ' + device.id + ' (' + device.rssi + ')';

    listItem.addEventListener('touchstart', () => bt.connect(device.id));
    listItem.dataset.deviceId = device.id;  // TODO
    listItem.style.padding = '8px';
    listItem.innerHTML = html;
    document.getElementById("devicesList").appendChild(listItem);
}

function onBackEvent() {
    window.location.href = 'index.html';
}

function onPauseEvent() {
    console.log('PauseEvent');
}

document.addEventListener('deviceready', function () {
    bt = new Bluetooth();
    console.log('blue_client', bt);
    bt.init(function () {
        alert('Your bluetooth is off. Turn on to play!');
        window.location.href = 'index.html';
    }).then(() => {
        eventListenner();
        window.plugins.insomnia.keepAwake();
    }).catch(e => {
        alert('You need bluetooth permission allowed to play with your friends! Please allow and try again');
        window.location.href = 'index.html';
    });
});


document.addEventListener("newdevice", onNewDevice);
document.addEventListener("receivedrequest", onReceivedRequest);
document.addEventListener("backbutton", onBackEvent);
document.addEventListener("pause", onPauseEvent);

