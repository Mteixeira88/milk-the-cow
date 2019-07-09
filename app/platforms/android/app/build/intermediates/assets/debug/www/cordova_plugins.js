cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-ble-central.ble",
    "file": "plugins/cordova-plugin-ble-central/www/ble.js",
    "pluginId": "cordova-plugin-ble-central",
    "clobbers": [
      "ble"
    ]
  },
  {
    "id": "cordova-plugin-ble-peripheral.blePeripheral",
    "file": "plugins/cordova-plugin-ble-peripheral/www/blePeripheral.js",
    "pluginId": "cordova-plugin-ble-peripheral",
    "clobbers": [
      "blePeripheral"
    ]
  },
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "cordova-plugin-device-name.DeviceName",
    "file": "plugins/cordova-plugin-device-name/www/device-name.js",
    "pluginId": "cordova-plugin-device-name",
    "clobbers": [
      "cordova.plugins.deviceName"
    ]
  },
  {
    "id": "cordova-plugin-insomnia.Insomnia",
    "file": "plugins/cordova-plugin-insomnia/www/Insomnia.js",
    "pluginId": "cordova-plugin-insomnia",
    "clobbers": [
      "window.plugins.insomnia"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-ble-central": "1.2.2",
  "cordova-plugin-ble-peripheral": "1.0.0",
  "cordova-plugin-bluetooth-peripheral-usage-description": "1.0.0",
  "cordova-plugin-device": "2.0.3",
  "cordova-plugin-device-name": "1.3.5",
  "cordova-plugin-insomnia": "4.3.0",
  "cordova-plugin-vibration": "3.1.0",
  "cordova-plugin-whitelist": "1.3.3"
};
// BOTTOM OF METADATA
});