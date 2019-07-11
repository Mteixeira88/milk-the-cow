Bluetooth = function () {
    const SERVICE_UUID = '23aa';
    const CHARACTERISTIC_SERVER_UUID = '11ff';
    const END_STRING = '#$%';
    let connState = false;
    let foundedDevices = [];
    let connectedDevice;
    let connectionFailureTries = 0;
    let scanTimout = 0;
    let receiveTimeout = 0;
    let receiveBuff = '';
    const platform = cordova.platformId;

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
            cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
                handleLocationAuthorizationStatus(status, offNotify).then(() => resolve()).catch(e => reject(e));
            }, function (error) {
                reject(error);
                console.error("The following error occurred: " + error);
            });
        })
    }

    function handleLocationAuthorizationStatus(status, offNotify) {
        return new Promise((resolve, reject) => {
            switch (status) {
                case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                    if (platform === "ios") {
                        makeBluetoothRequest(offNotify).then(() => resolve()).catch((e) => reject(e));
                    } else {
                        makeLocationRequest(offNotify).then(() => resolve()).catch((e) => reject(e));
                    }
                    break;
                case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                    cordova.plugins.diagnostic.requestLocationAuthorization((status) =>
                            handleLocationAuthorizationStatus(status, offNotify).then(() => resolve())
                                .catch(e => reject(e))
                        , e => reject(e));
                    break;
                case cordova.plugins.diagnostic.permissionStatus.DENIED:
                    if (platform === "android") {
                        reject("User denied permission to use location");
                    } else {
                        makeLocationRequest(offNotify).then(() => resolve()).catch((e) => reject(e));
                    }
                    break;
                case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                    // Android only
                    reject("User denied permission to use location");
                    break;
                case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                    // iOS only
                    reject("Location services is already switched ON");
                    break;
            }
        });
    }

    function makeLocationRequest(offNotify) {
        return new Promise((resolve, reject) => {
            cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
                if (canRequest) {
                    cordova.plugins.locationAccuracy.request(function () {
                            makeBluetoothRequest(offNotify).then(() => resolve()).catch((e) => reject(e));
                        }, function (error) {
                            reject(error);
                        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
                    );
                } else {
                    // On iOS, this will occur if Location Services is currently on OR a request is currently in progress.
                    // On Android, this will occur if the app doesn't have authorization to use location.
                    reject("Cannot request location accuracy");
                }
            });
        });
    }


    function makeBluetoothRequest(offNotify) {
        return new Promise((resolve, reject) => {
            ble.isEnabled(
                function () {
                    // bluetooth is enabled
                    connState = true;
                    resolve();
                }, function () {
                    // Bluetooth not yet enabled so we try to enable it
                    console.log('Bluetooth not yet enabled so we try to enable it');
                    ble.enable(
                        function () {
                            // bluetooth now enabled
                            connState = true;
                            resolve();
                        },
                        function (err) {
                            connState = false;
                            reject(err);
                        }
                    );
                });
            if (offNotify) {
                ble.startStateNotifications(
                    function (state) {
                        if (state.toLowerCase() === 'off' && connState === true) {
                            connState = false;
                            offNotify();
                        }
                    }
                );
            }
        });
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
        ble.stopScan();
        foundedDevices = [];
        ble.scan([SERVICE_UUID], 10, onDiscoverDevice, onError);
        clearTimeout(scanTimout);
        scanTimout = setTimeout(() => {
            if (onEnd) onEnd();
        }, 10000);
    }


    function onDiscoverDevice(device) {
        if (!device.name) {
            return;
        }
        if (foundedDevices.some(dev => dev.name === device.name)) {
            return;
        }
        foundedDevices.push(device);
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
        return handlingData(_data);
    }

    function handlingData(string) {
        string = string.concat(END_STRING);
        const parts = string.match(/[\s\S]{1,20}/g) || [];
        for (let i = 0; i < parts.length; i++) {
            if (sendBytes(parts[i]) === false) {
                return false;
            }
        }
        return true;
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
    this.disconnect = disconnect;

    /**
     * SERVER SIDE
     */

    function startServer() {
        blePeripheral.onWriteRequest(didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(onBluetoothStateChange);
        return createServiceJSON();
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
