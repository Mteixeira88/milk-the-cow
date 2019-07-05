Bluetooth = function () {
    const SERVICE_UUID = '23aa';
    const CHARACTERISTIC_SERVER_UUID = '11ff';
    const END_STRING = '$';
    let connectedDevice;
    let scanTimout = 0;
    let receiveTimeout = 0;
    let receiveBuff = '';
    let connectionFailureTries = 0;

    /**
     * MISC
     * */

    function init(offNotify) {
        return new Promise((resolve, reject) => {
            ble.isEnabled(
                function () {
                    // bluetooth is enabled
                    resolve();
                }, function () {
                    // Bluetooth not yet enabled so we try to enable it
                    console.log('Bluetooth not yet enabled so we try to enable it');
                    ble.enable(
                        function () {
                            // bluetooth now enabled
                            resolve(this);
                        },
                        function (err) {
                            alert('Cannot enable bluetooth');
                            reject();
                        }
                    );
                });
            if (offNotify) {
                ble.startStateNotifications(
                    function (state) {
                        if (state.toLowerCase() === 'off') {
                            offNotify();
                        }
                    }
                );
            }
        })
    }

    function onError(e) {
        document.getElementById("devicesListInfo").innerHTML = 'ERROR: ' + e;
        console.warn(e);
    }

    // String to Array Buffer
    function stringToBytes(str) {
        let bytes = new Uint8Array(str.length);
        for (let i = 0, l = str.length; i < l; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Array buffer to String
    function bytesToString(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    /**
     * CLIENT SIDE
     */
    function scan() {
        document.getElementById("devicesList").innerHTML = '';
        document.getElementById("devicesListInfo").innerHTML = "Scanning...";
        ble.stopScan();
        ble.scan([SERVICE_UUID], 10, onDiscoverDevice, onError);
        clearTimeout(scanTimout);
        scanTimout = setTimeout(() => document.getElementById("devicesListInfo").innerHTML = "Scanning stopped!", 10000);
    }

    function onDiscoverDevice(device) {
        if (!device.name) {
            return;
        }
        console.log(JSON.stringify(device));

        const event = new CustomEvent('newdevice', {'detail': device});
        document.dispatchEvent(event);
    }


    function bleConnectionRequest(dev_id) {
        clearTimeout(scanTimout);
        // Check if was previous connected device
        if (ble.isConnected(connectedDevice)) {
            disconnect(connectedDevice);
        }
        // Check if you try to connect to same device
        if (ble.isConnected(dev_id)) {
            disconnect(dev_id);
        }
        document.getElementById("devicesListInfo").innerHTML = 'Connecting to ' + dev_id + '...';
        ble.connect(dev_id, bleConnectionSuccess, bleConnectionFailure);
    }

    function bleConnectionSuccess(device) {
        connectionFailureTries = 0;
        document.getElementById("devicesList").innerHTML = '';
        document.getElementById("devicesListInfo").innerHTML = "BLE Connected to " + device.name;
        connectedDevice = device.id;
        sendData({type: 'newuser', data: 'User ' + window.device.name + ' (' + window.device.uuid + ') has joined'});
    }

    function bleConnectionFailure(device) {
        connectionFailureTries++;
        if (connectionFailureTries < 3) {
            bleConnectionRequest(device);
        } else {
            document.getElementById("devicesListInfo").innerHTML = "Not Connected";
            alert('Connection Failure');
            scan();
        }
    }

    function sendData(data) {
        if (!connectedDevice) {
            alert('No connected device');
            return false;
        }
        let _data;
        if (typeof data === 'object' && data !== null) {
            _data = JSON.stringify(data);
        } else {
            _data = data;
        }
        handlingData(_data);
    }

    function handlingData(string) {
        string = string.concat(END_STRING);
        const parts = string.match(/[\s\S]{1,20}/g) || [];
        console.log('parts', parts);
        let isProblem = false;
        for (let i = 0; i < parts.length; i++) {
            if (sendBytes(parts[i]) === false) {
                isProblem = true;
            }
        }
        // if (!isProblem) {
        //     document.getElementById("debug").innerHTML += '<br />Me:' + string.slice(0, string.length - 1);
        // }
    }

    function sendBytes(data) {
        return ble.write(
            connectedDevice,
            SERVICE_UUID,
            CHARACTERISTIC_SERVER_UUID,
            stringToBytes(data),
            function (response) {
                console.log(response);
                if (response !== 'OK') {
                    alert("Error occurred while trying to communicate. Please try again. ");
                    return false;
                } else {
                    return true;
                }
            },
            function (err) {
                console.warn('Writing error:', err);
                alert("Error occurred while trying to communicate. Please try again. ");
                return false;
            }
        );
    }

    function disconnect(device_id) {
        connectedDevice = undefined;
        ble.disconnect(device_id);
    }

    this.init = init;
    this.scan = scan;
    this.sendData = sendData;
    this.connect = bleConnectionRequest;
    this.disconnect = disconnect;

    /**
     * SERVER SIDE
     */

    function onDeviceReady() {
        blePeripheral.onWriteRequest(didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(onBluetoothStateChange);
        createServiceJSON();
    }

    function createServiceJSON() {
        const property = blePeripheral.properties;
        const permission = blePeripheral.permissions;

        const gameService = {
            uuid: SERVICE_UUID,
            characteristics: [
                {
                    uuid: CHARACTERISTIC_SERVER_UUID,
                    properties: property.WRITE | property.READ | property.WRITE_NO_RESPONSE | property.NOTIFY,
                    permissions: permission.WRITEABLE | permission.READABLE,
                    descriptors: [
                        {
                            uuid: '9388',
                            value: 'MilkTheCowToday'
                        }
                    ]
                },
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(gameService),
            blePeripheral.startAdvertising(SERVICE_UUID, CHARACTERISTIC_SERVER_UUID),
        ]).then(
            function () {
                console.log('Created Game Service');
            },
            function (e) {
                console.warn('Error: Server cannot be started!, ' + e);
            }
        );
    }

    function didReceiveWriteRequest(request) {
        // Android sends long versions of the UUID
        if (request.characteristic.includes(CHARACTERISTIC_SERVER_UUID)) {
            clearTimeout(receiveTimeout);
            const data = bytesToString(request.value);
            receiveBuff = receiveBuff.concat(data);
            if (receiveBuff[receiveBuff.length - 1] === END_STRING) {
                const removeEndString = receiveBuff.replace(END_STRING, '');
                let parsed;
                try {
                    parsed = JSON.parse(removeEndString);
                } catch (e) {
                    parsed = removeEndString;
                }
                const event = new CustomEvent('receivedrequest', {'detail': parsed});
                document.dispatchEvent(event);
                receiveBuff = '';
            }
        }
        // If all receive data are not completed, I might has an error so restart buffer
        receiveTimeout = setTimeout(() => {
            if (receiveBuff !== '') {
                console.warn('Error receiving data');
            }
            receiveBuff = '';
        }, 3000);
    }

    function onBluetoothStateChange(state) {
        console.log('Bluetooth State is', state);
    }

    this.startServer = onDeviceReady;
}
