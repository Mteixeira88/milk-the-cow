Bluetooth = function () {
    const SERVICE_UUID = '23aa';
    const CHARACTERISTIC_SERVER_UUID = '11ff';
    const END_STRING = '#$%';
    let connState = false;
    let connectedDevice;
    let scanTimout = 0;
    let receiveTimeout = 0;
    let receiveBuff = '';
    let connectionFailureTries = 0;

    const EVENTS = {
        NEW_DEVICE: 'newdevice',
        RECEIVED_REQUEST: 'receivedrequest',
        CONNECTION_SUCCESS: 'connectionsuccess',
        CONNECTION_FAILURE: 'connectionfailure',
    };
    this.EVENTS = EVENTS;

    /**
     * MISC
     * */

    function init(offNotify) {
        return new Promise((resolve, reject) => {
            const params = {
                "request": true,
                "statusReceiver": false,
                "restoreKey": "MilkTheCowToday"
            };
            bluetoothle.initialize(function (res) {
                if (res.status === 'disabled') {
                    bluetoothle.enable(function () {
                        connState = true;
                        resolve();
                    }, function (err) {
                        connState = false;
                        reject(err);
                    });
                }
                connState = true;
                resolve();
            }, params);

            /*ble.isEnabled(
                function () {
                    // bluetooth is enabled
                    connState = true;
                    resolve(this);
                }, function () {
                    // Bluetooth not yet enabled so we try to enable it
                    console.log('Bluetooth not yet enabled so we try to enable it');
                    ble.enable(
                        function () {
                            // bluetooth now enabled
                            connState = true;
                            resolve(this);
                        },
                        function (err) {
                            connState = false;
                            reject(err);
                        }
                    );
                });*/
            if (offNotify) {
                /*ble.startStateNotifications(
                    function (state) {
                        if (state.toLowerCase() === 'off' && connState === true) {
                            connState = false;
                            offNotify();
                        }
                    }
                );*/
            }
        })
    }

    function onError(e) {
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
    function scan(onEnd) {
        const params = {
            "services": [SERVICE_UUID],
            "allowDuplicates": false,
            "scanMode": bluetoothle.SCAN_MODE_LOW_LATENCY,
            "matchMode": bluetoothle.MATCH_MODE_AGGRESSIVE,
            "matchNum": bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
            "callbackType": bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
        }
        bluetoothle.stopScan();
        bluetoothle.startScan(onDiscoverDevice, onError, params);
        clearTimeout(scanTimout);
        scanTimout = setTimeout(() => {
            bluetoothle.stopScan(undefined, onError);
            if (onEnd) onEnd();
        }, 5000);
    }

    function onDiscoverDevice(data) {
        if (data.status !== 'scanResult' || !data.name) {
            return;
        }
        const device = {
            name: data.name,
            id: data.address,
            advertisement: data.advertisement,
            rssi: data.rssi
        };
        console.log('device', device);
        const event = new CustomEvent(EVENTS.NEW_DEVICE, {'detail': device});
        document.dispatchEvent(event);
    }


    function bleConnectionRequest(dev_id) {
        clearTimeout(scanTimout);
        // Check if was previous connected device
        ble.isConnected(connectedDevice, function () {
            disconnect(connectedDevice);
        });
        // Check if you try to connect to same device
        ble.isConnected(dev_id, function () {
            disconnect(dev_id);
        });
        ble.connect(dev_id, bleConnectionSuccess, bleConnectionFailure);
    }

    function bleConnectionSuccess(device) {
        connectionFailureTries = 0;
        connectedDevice = device.id;
        const event = new CustomEvent(EVENTS.CONNECTION_SUCCESS, {'detail': device});
        document.dispatchEvent(event);
    }

    function bleConnectionFailure(device) {
        connectionFailureTries++;
        if (connectionFailureTries < 3) {
            setTimeout(() => {
                ble.isConnected(connectedDevice, function () {
                    connectionFailureTries = 0;
                }, function () {
                    bleConnectionRequest(device);
                });
            }, 300);
        } else {
            const event = new CustomEvent(EVENTS.CONNECTION_FAILURE, {'detail': device});
            document.dispatchEvent(event);
        }
    }

    function getConnectedDevices() {
        bluetoothle.retrieveConnected(function (data) {
            console.log(data);
        }, onError, {"services": [SERVICE_UUID]});
    }

    function sendData(data, deviceId) {
        if (!connectedDevice && !deviceId) {
            alert('No connected device');
            return false;
        }
        if (!connectedDevice && deviceId) {
            connectedDevice = deviceId;
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
        for (let i = 0; i < parts.length; i++) {
            if (sendBytes(parts[i]) === false) {
                return;
            }
        }
    }

    function sendBytes(data) {
        return ble.write(
            connectedDevice,
            SERVICE_UUID,
            CHARACTERISTIC_SERVER_UUID,
            stringToBytes(data),
            function (response) {
                if (response !== 'OK') {
                    console.warn('Error sending data', response);
                    alert("Error occurred while trying to communicate. Please try again. ");
                    return false;
                }
                return true;
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
    this.getConnected = getConnectedDevices;
    this.disconnect = disconnect;

    /**
     * SERVER SIDE
     */

    function startServer() {
        blePeripheral.onWriteRequest(didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(onBluetoothStateChange);
        return createServiceJSON();
        /* const params = {
             "request": true,
             "restoreKey": "MilthTheCowToday"
         }
         bluetoothle.initializePeripheral(onInitPeripheral, onError, params);*/
    }

    function onInitPeripheral(ev) {
        console.log(ev);
        var params = {
            service: SERVICE_UUID,
            characteristics: [
                {
                    uuid: CHARACTERISTIC_SERVER_UUID,
                    permissions: {
                        read: true,
                        write: true,
                        //readEncryptionRequired: true,
                        //writeEncryptionRequired: true,
                    },
                    properties: {
                        read: true,
                        writeWithoutResponse: true,
                        write: true,
                        notify: true,
                        indicate: true,
                        //authenticatedSignedWrites: true,
                        //notifyEncryptionRequired: true,
                        //indicateEncryptionRequired: true,
                    }
                }
            ]
        };
        bluetoothle.addService(function (resp) {
            console.log('added service', resp);
            var params = {
                "service": SERVICE_UUID, //Android
                "name": "Hi",
            };
            bluetoothle.startAdvertising(function (resp) {
                console.log('started advertising', resp);
            }, function (resp) {
                console.log('started advertising', resp);
            }, params);

        }, onError, params);
    }

    function createServiceJSON() {
        const property = blePeripheral.properties;
        const permission = blePeripheral.permissions;

        const jsonService = {
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

        return Promise.all([
            blePeripheral.createServiceFromJSON(jsonService),
            blePeripheral.startAdvertising(SERVICE_UUID, CHARACTERISTIC_SERVER_UUID),
        ]).then(
            function (ok) {
                console.log('Created Service', ok);
                return true;
            },
            function (e) {
                console.warn('Error: Server cannot be started!, ' + e);
                return false;
            }
        );
    }

    function didReceiveWriteRequest(request) {
        // Android sends long versions of the UUID
        if (request.characteristic.includes(CHARACTERISTIC_SERVER_UUID)) {
            clearTimeout(receiveTimeout);
            const data = bytesToString(request.value);
            receiveBuff = receiveBuff.concat(data);
            if (receiveBuff.slice(receiveBuff.length - END_STRING.length, receiveBuff.length) === END_STRING) {
                const removeEndString = receiveBuff.replace(END_STRING, '');
                let parsed;
                try {
                    parsed = JSON.parse(removeEndString);
                } catch (e) {
                    parsed = removeEndString;
                }
                const event = new CustomEvent(EVENTS.RECEIVED_REQUEST, {'detail': parsed});
                document.dispatchEvent(event);
                receiveBuff = '';
            }
        }
        // If all receive data are not completed, I might has an error so restart buffer
        receiveTimeout = setTimeout(() => {
            if (receiveBuff !== '') {
                console.warn('Error receiving data', receiveBuff);
            }
            receiveBuff = '';
        }, 3000);
    }

    function onBluetoothStateChange(state) {
        console.log('Bluetooth State is', state);
    }

    function stopServer(success, err) {
        blePeripheral.stopAdvertising(success, err);
    }

    this.startServer = startServer;
    this.stopServer = stopServer;
}
