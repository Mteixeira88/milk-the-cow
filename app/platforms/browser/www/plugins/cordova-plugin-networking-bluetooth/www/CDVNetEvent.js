cordova.define("cordova-plugin-networking-bluetooth.CDVNetEvent", function(require, exports, module) { // Copyright 2016 Franco Bugnano
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

var CDVNetEvent = {
	init: function () {
		this.listeners = [];
	},

	addListener: function (callback) {
		if (!this.hasListener(callback)) {
			this.listeners.push(callback);
		}
	},

	removeListener: function (callback) {
		var
			i = this.listeners.indexOf(callback);
		;

		if (i >= 0) {
			this.listeners.splice(i, 1);
		}
	},

	hasListener: function (callback) {
		return (this.listeners.indexOf(callback) >= 0);
	},

	hasListeners: function () {
		return Boolean(this.listeners.length);
	},

	fire: function () {
		var
			i,
			len_listeners = this.listeners.length
		;

		for (i = 0; i < len_listeners; i += 1) {
			this.listeners[i].apply(this, arguments);
		}
	}
};

module.exports = CDVNetEvent;


});
