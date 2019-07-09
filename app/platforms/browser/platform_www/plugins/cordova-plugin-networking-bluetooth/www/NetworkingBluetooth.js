cordova.define("cordova-plugin-networking-bluetooth.NetworkingBluetooth", function(require, exports, module) { // Copyright 2016 Franco Bugnano
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var
	exec = require('cordova/exec'),
	channel = require('cordova/channel'),
	CDVNetEvent = require('cordova-plugin-networking-bluetooth.CDVNetEvent')
;

exports.getAdapterState = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'getAdapterState', []);
};

exports.requestEnable = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'requestEnable', []);
};

exports.enable = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'enable', []);
};

exports.disable = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'disable', []);
};

exports.getDevice = function (deviceAddress, success, error) {
	exec(success, error, 'NetworkingBluetooth', 'getDevice', [deviceAddress]);
};

exports.getDevices = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'getDevices', []);
};

exports.startDiscovery = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'startDiscovery', []);
};

exports.stopDiscovery = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'stopDiscovery', []);
};

exports.requestDiscoverable = function (success, error) {
	exec(success, error, 'NetworkingBluetooth', 'requestDiscoverable', []);
};

exports.connect = function (address, uuid, success, error) {
	exec(success, error, 'NetworkingBluetooth', 'connect', [address, uuid]);
};

exports.close = function (socketId, success, error) {
	exec(success, error, 'NetworkingBluetooth', 'close', [socketId]);
};

exports.send = function (socketId, data, success, error) {
	exec(success, error, 'NetworkingBluetooth', 'send', [socketId, data]);
};

exports.listenUsingRfcomm = function (uuid, success, error) {
	exec(success, error, 'NetworkingBluetooth', 'listenUsingRfcomm', [uuid]);
};

// Events
exports.onAdapterStateChanged = Object.create(CDVNetEvent);
exports.onAdapterStateChanged.init();

exports.onDeviceAdded = Object.create(CDVNetEvent);
exports.onDeviceAdded.init();

exports.onReceive = Object.create(CDVNetEvent);
exports.onReceive.init();

exports.onReceiveError = Object.create(CDVNetEvent);
exports.onReceiveError.init();

exports.onAccept = Object.create(CDVNetEvent);
exports.onAccept.init();

exports.onAcceptError = Object.create(CDVNetEvent);
exports.onAcceptError.init();

channel.onCordovaReady.subscribe(function() {
	exec(function (adapterState) {
		exports.onAdapterStateChanged.fire(adapterState);
	}, null, 'NetworkingBluetooth', 'registerAdapterStateChanged', []);

	exec(function (deviceInfo) {
		exports.onDeviceAdded.fire(deviceInfo);
	}, null, 'NetworkingBluetooth', 'registerDeviceAdded', []);

	exec(function (socketId, data) {
		exports.onReceive.fire({
			socketId: socketId,
			data: data
		});
	}, null, 'NetworkingBluetooth', 'registerReceive', []);

	exec(function (info) {
		exports.onReceiveError.fire(info);
	}, null, 'NetworkingBluetooth', 'registerReceiveError', []);

	exec(function (serverSocketId, clientSocketId) {
		exports.onAccept.fire({
			socketId: serverSocketId,
			clientSocketId: clientSocketId
		});
	}, null, 'NetworkingBluetooth', 'registerAccept', []);

	exec(function (info) {
		exports.onAcceptError.fire(info);
	}, null, 'NetworkingBluetooth', 'registerAcceptError', []);
});


});
