Bluetooth = function () {
    const SERVICE_UUID = '23aa';
    const CHARACTERISTIC_SERVER_UUID = '11ff';
    const CHARACTERISTIC_CLIENT_UUID = '99ff';
    const END_STRING = '$';
    let connectedDevice;
    let scanTimout = 0;
    let receiveTimeout = 0;
    let receiveBuff = '';

    /**
     * MISC
     * */

    function init(offNotify) {
        return new Promise((resolve, reject) => {
            bluetoothle.initialize(function (result) {
                console.log('init', result);
                if (result.status === "enabled") {
                    console.log("Bluetooth is enabled.");
                    console.log(result);
                    resolve();
                } else {
                    console.log("Bluetooth is not enabled:", "status");
                    console.log(result, "status");
                    bluetoothle.enable(resolve, reject);
                }
            }, {request: true, statusReceiver: false});
        })
        /*ble.isEnabled(
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
        }*/
    }

    function startServer() {
        console.log('starting server');
        bluetoothle.initializePeripheral(function (result) {
                console.log('init peripheral', result);
                paramsJson = {
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
                bluetoothle.addService(function () {
                        console.log('init addService');
                        paramsService = {
                            "services": [SERVICE_UUID], //iOS
                            "service": SERVICE_UUID, //Android
                        };

                        bluetoothle.startAdvertising(
                            function () {
                                console.log("Started advertising");
                            },
                            function (error) {
                                console.warn(error);
                            },
                            paramsService
                        );
                    },
                    function (error) {
                        console.warn(error);
                    }, paramsJson);
            },
            function (error) {
                console.warn(error);
            }, {
                "request": true,
                "restoreKey": "MilkTheCowToday"
            });
    }

    this.startServer = startServer;

    function initializeBLE() {
        return new Promise((resolve, reject) => {
            bluetoothle.initialize(resolve, {request: true, statusReceiver: false});
            /*ble.isEnabled(
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
            }*/
        });
    }

    function initHandler(result) {
        return new Promise((resolve, reject) => {
            if (result.status === "enabled") {
                console.log("Bluetooth is enabled.");
                console.log(result);
            } else {
                console.log("Bluetooth is not enabled:", "status");
                console.log(result, "status");
                bluetoothle.enable(initHandler, onError);
                return;
            }

            bluetoothle.initializePeripheral(resolve,
                function (error) {
                    reject(error);
                }, {
                    "request": true,
                    "restoreKey": "MilkTheCowToday"
                });
        });
    }

    function addService() {
        return new Promise((resolve, reject) => {
            params = {
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
            bluetoothle.addService(resolve,
                function (error) {
                    reject(error);
                });
        });

    }

    function startAdvertise() {
        return new Promise((resolve, reject) => {
            params = {
                "service": SERVICE_UUID,
                "name": "MilkTheCowToday",
            };

            bluetoothle.startAdvertising(
                function () {
                    console.log("Started advertising");
                    resolve();
                },
                function (error) {
                    reject(error);
                },
                params
            );
        });
    }

    function onError(e) {
        document.getElementById("devicesListInfo").innerHTML = 'ERROR: ' + e;
        console.warn(e);
    }

    /**
     function encodedStringToBytes(string) {
        var data = atob(string);
        var bytes = new Uint16Array(data.length);
        for (var i = 0; i < bytes.length; i++) {
            bytes[i] = data.charCodeAt(i);
        }
        return bytes;
    }

     function bytesToEncodedString(bytes) {
        return btoa(String.fromCharCode.apply(null, bytes));
    }

     function stringToBytes(string) {
        string = string.concat(END_STRING);
        var bytes = new ArrayBuffer(string.length * 2);
        var bytesUint16 = new Uint16Array(bytes);
        for (var i = 0; i < string.length; i++) {
            bytesUint16[i] = string.charCodeAt(i);
        }
        return bytesUint16;
    }

     function bytesToString(bytes) {
        return atob(String.fromCharCode.apply(null, new Uint16Array(bytes)));
    }
     **/

    // String to Array Buffer
    function stringToBytes(str) {
        str = str.concat(END_STRING);
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
    /*function scan() {
        document.getElementById("devicesList").innerHTML = '';
        document.getElementById("devicesListInfo").innerHTML = "Scanning...";

        bluetoothle.startScan(startScanSuccess, onError, {services: []});
        /*ble.stopScan();
        ble.scan([], 10, onDiscoverDevice, onError);
        clearTimeout(scanTimout);
        scanTimout = setTimeout(() => document.getElementById("devicesListInfo").innerHTML = "Scanning stopped!", 10000);*/
    // }

    var foundDevices = [];

    function scan() {

        console.log("Starting scan for devices...", "status");

        foundDevices = [];

        document.getElementById("devicesList").innerHTML = "";

        if (window.cordova.platformId === "windows") {

            //bluetoothle.retrieveConnected(retrieveConnectedSuccess, onError, {});
        } else {

            bluetoothle.startScan(startScanSuccess, onError, {services: [SERVICE_UUID]});
        }
    }

    function startScanSuccess(result) {

        console.log("startScanSuccess(" + result.status + ")");

        if (result.status === "scanStarted") {

            console.log("Scanning for devices (will continue to scan until you select a device)...", "status");
        } else if (result.status === "scanResult") {

            if (!foundDevices.some(function (device) {

                return device.address === result.address;

            })) {

                console.log('FOUND DEVICE:');
                console.log(result);
                foundDevices.push(result);
                // addDevice(result.name, result.address);
                const listItem = document.createElement('p'),
                    html = '' + (result.name ? result.name : 'UNKNOWN') + ' - ' + result.address + ' (' + result.rssi + ')';

                listItem.addEventListener('touchstart', () => bleConnectionRequest(result.address));
                listItem.dataset.deviceId = result.address;  // TODO
                listItem.style.padding = '8px';
                listItem.innerHTML = html;
                document.getElementById("devicesList").appendChild(listItem);
            }
        }
    }

    /* function startScanSuccess(result) {

         console.log(("startScanSuccess(" + result + ")"));

         const listItem = document.createElement('p'),
             html = '' + (result.name ? result.name : 'UNKNOWN') + ' - ' + result.id + ' (' + result.rssi + ')';

         listItem.addEventListener('touchstart', () => bleConnectionRequest(result.id));
         listItem.dataset.deviceId = result.id;  // TODO
         listItem.style.padding = '8px';
         listItem.innerHTML = html;
         document.getElementById("devicesList").appendChild(listItem);
     }*/

    function onDiscoverDevice(device) {
        if (!device.name) {
            return;
        }
        console.log(JSON.stringify(device));
        const listItem = document.createElement('p'),
            html = '' + (device.name ? device.name : 'UNKNOWN') + ' - ' + device.id + ' (' + device.rssi + ')';

        listItem.addEventListener('touchstart', () => bleConnectionRequest(device.id));
        listItem.dataset.deviceId = device.id;  // TODO
        listItem.style.padding = '8px';
        listItem.innerHTML = html;
        document.getElementById("devicesList").appendChild(listItem);
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
        document.getElementById("devicesList").innerHTML = '';
        document.getElementById("devicesListInfo").innerHTML = "BLE Connected to " + device.name;
        connectedDevice = device.id;
        ble.notify(device.id, SERVICE_UUID, CHARACTERISTIC_CLIENT_UUID, onData, onError);
    }

    onData = (buffer) => {
        // Decode the ArrayBuffer into a typed Array based on the data you expect
        var data = new Uint8Array(buffer);
        console.log('received data', data);
        alert("Button state changed to " + data[0]);
    }


    function bleConnectionFailure(device) {
        document.getElementById("devicesListInfo").innerHTML = "Not Connected";
        alert('Connection Failure');
        scan();
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
        ble.writeWithoutResponse(
            connectedDevice,
            SERVICE_UUID,
            CHARACTERISTIC_CLIENT_UUID,
            stringToBytes(_data),
            function (response) {
                console.log(response);
                if (response !== 'OK') {
                    alert("Error occurred while trying to communicate. Please try again. ");
                } else {
                    document.getElementById("debug").innerHTML += '<br />Me:' + _data;
                }
            },
            function (err) {
                alert("Error occurred while trying to communicate. Please try again. ");
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
    this.disconnect = disconnect;

    /**
     * SERVER SIDE
     */

    function onDeviceReady() {
        // blePeripheral.onWriteRequest(didReceiveWriteRequest);
        // blePeripheral.onBluetoothStateChange(onBluetoothStateChange);
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
                    properties: property.WRITE | property.READ,
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
            //blePeripheral.startAdvertising(SERVICE_UUID, CHARACTERISTIC_SERVER_UUID),
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
            console.log('data raw', request.value);
            const data = bytesToString(request.value);
            console.log('data converted', data);
            receiveBuff = receiveBuff.concat(data);
            console.log('receiveBuff', receiveBuff);
            if (receiveBuff[receiveBuff.length - 1] === END_STRING) {
                const removeEndString = receiveBuff.replace(END_STRING, '');
                let parsed;
                try {
                    parsed = JSON.parse(removeEndString);
                } catch (e) {
                    parsed = removeEndString;
                }
                console.log('dispach event');
                const event = new CustomEvent('receivedrequest', {'detail': parsed});
                document.dispatchEvent(event);
                console.log('func removing buffer');
                receiveBuff = '';
            }
        }
        // If all receive data are not completed, I might has an error so restart buffer
        receiveTimeout = setTimeout(() => {
            if (receiveBuff !== '') {
                console.warn('Error receiving data');
            }
            console.log('timer to remove buffer');
            receiveBuff = '';
        }, 500);
    }

    function onBluetoothStateChange(state) {
        console.log('Bluetooth State is', state);
    }

    //this.startServer = onDeviceReady;
}
