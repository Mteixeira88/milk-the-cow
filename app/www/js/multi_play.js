let bt;
let connectedDevices = {me: undefined, other: undefined};

const searchDevicesButton = document.getElementById('searchDevices');
const playButton = document.getElementById('play');
const deviceList = document.getElementById("devicesList");
const deviceInfo = document.getElementById("devicesListInfo");
const debug = document.getElementById('debug');

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
    if (request.type === 'newuser') {
        debug.innerHTML += '<br />User ' + request.data.name + ' has joined!';
        connectedDevices.me = request.data;
        checkPlay();
    } else {
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
    connectedDevices.other = device;
    searchDevicesButton.addEventListener('touchstart', joinGame);
    checkPlay();
    bt.sendData({type: 'newuser', data: {name: window.device.name}});
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
        } else {
            alert('You need to connect do same friend');
            playButton.style.display = 'none';
            playButton.removeEventListener('click', onClickPlay);
        }
    } else {
        playButton.style.display = 'none';
        playButton.removeEventListener('click', onClickPlay);
    }
}

function onClickPlay() {
    console.log(connectedDevices);
    bt.sendData('Ready to Play!!');
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
