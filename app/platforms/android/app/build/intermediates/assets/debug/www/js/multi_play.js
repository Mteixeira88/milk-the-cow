let bt;
let connectedDevices = {me: undefined, other: undefined};
let readyTimeout;

const searchDevicesButton = document.getElementById('searchDevices');
const playButton = document.getElementById('play');
const deviceList = document.getElementById("devicesList");
const deviceInfo = document.getElementById("devicesListInfo");
const debug = document.getElementById('debug');
const connectContainer = document.getElementById('connect');
const gameContainer = document.getElementById('game');

function joinGame() {
    searchDevicesButton.disabled = true;
    deviceList.innerHTML = '';
    deviceInfo.innerHTML = "Scanning...";
    scan();
}

function scan() {
    searchDevicesButton.removeEventListener('touchstart', joinGame);
    bt.scan(function () {
        deviceInfo.innerHTML = "Scanning stopped!";
        searchDevicesButton.disabled = false;
        searchDevicesButton.addEventListener('touchstart', joinGame);
    });
}

function onReceivedRequest(event) {
    const request = event.detail;
    switch (request.type) {
        // When someone connects
        case 'connect':
            connectedDevices.me = request.data;
            checkPlay();
            break;
        // When someone touch play button
        case 'play':
            if (checkPlay()) {
                bt.sendData({type: 'ready'});
                playGame();
            }
            break;
        // When both devices are ready
        case 'ready':
            clearTimeout(readyTimeout);
            playGame();
            break;
        default:
            debug.innerHTML += '<br />' + JSON.stringify(request);

    }
}

function onNewDevice(event) {
    const device = event.detail;
    const listItem = document.createElement('p');
    listItem.addEventListener('touchstart', () => connectTo(device.id));
    listItem.style.padding = '8px';
    listItem.innerHTML = '' + (device.name ? device.name : 'UNKNOWN') + ' - ' + device.id + ' (' + device.rssi + ')';
    deviceList.appendChild(listItem);
}

function connectTo(device_id) {
    deviceInfo.innerHTML = 'Connecting to ' + device_id + '...';
    bt.connect(device_id);
}

function onConnectionSuccess(event) {
    const device = event.detail;
    deviceList.innerHTML = '';
    deviceInfo.innerHTML = "BLE Connected to " + device.name;
    searchDevicesButton.addEventListener('touchstart', joinGame);
    checkPlay();
    if (bt.sendData({type: 'connect', data: {name: window.device.name}})) {
        connectedDevices.other = device;
    } else {
        onConnectionFailure();
    }
}

function onConnectionFailure(event) {
    const device = event.detail;
    connectedDevices.other = undefined;
    checkPlay();
    deviceList.innerHTML = "Not Connected";
    alert('Connection Failure to ' + device.name);
    scan();
}

function checkPlay() {
    if (connectedDevices.me && connectedDevices.other) {
        if (connectedDevices.me.name === connectedDevices.other.name) {
            playButton.style.display = 'block';
            playButton.addEventListener('click', onClickPlay);
            return true;
        } else {
            alert('You need to connect do same friend');
            playButton.style.display = 'none';
            playButton.removeEventListener('click', onClickPlay);
            return false;
        }
    } else {
        playButton.style.display = 'none';
        playButton.removeEventListener('click', onClickPlay);
        return false;
    }
}

function onClickPlay() {
    if (bt.sendData({type: 'play'})) {
        readyTimeout = setTimeout(() => {
            alert('Your friend is not ready!');
        }, 500);
    } else {
        onConnectionFailure();
    }
}

function playGame() {
    connectContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
    new Game();
}


function eventListener() {
    searchDevicesButton.addEventListener('touchstart', joinGame);
    document.addEventListener(bt.EVENTS.CONNECTION_FAILURE, onConnectionFailure);
    document.addEventListener(bt.EVENTS.CONNECTION_SUCCESS, onConnectionSuccess);
    document.addEventListener(bt.EVENTS.NEW_DEVICE, onNewDevice);
    document.addEventListener(bt.EVENTS.RECEIVED_REQUEST, onReceivedRequest);
}

function onBackEvent() {
    bt.stopServer(function () {
    }, function () {
        console.warn('Error stopping server');
    });
    window.location.href = 'index.html';
}

document.addEventListener('deviceready', function () {
    document.addEventListener("backbutton", onBackEvent);
    bt = new Bluetooth();
    bt.init(function () {
        alert('Your bluetooth is off. Turn on to play!');
        window.location.href = 'index.html';
    }).then(() => {
        eventListener();
        if (!bt.startServer()) {
            onBackEvent();
            throw new Error('Can start Server!');
        }
        joinGame();
        window.plugins.insomnia.keepAwake();
    }).catch(e => {
        console.warn('Error init Bluetooth', e);
        alert('You need bluetooth permission allowed to play with your friends! Please allow and try again');
        window.location.href = 'index.html';
    });
});
