const got = require('got');
const Log = require("../../js/logger");

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    if (notification == 'ADD_ITEM') {
      this.getItem(payload.url, payload.item_name, payload.icon);
    }
    if (notification == 'TOGGLE_SWITCH') {
      this.toggleSwitch(payload.url, payload.item_name);
    }
    if (notification == 'ROLLERSHUTTER') {
      this.rollershutter(payload.url, payload.item_name, payload.action);
    }
    if (notification == 'ITEM_UPDATE_VALUE') {
      this.updateItemValue(payload.url, payload.item_name);
    }
  },

  updateItemValue: function(url, item_name) {
    const r = got.get(url + item_name, {responseType: 'json'})
      .then((response) => {
        if (response.body.type.startsWith('Number')) {
          item_value = response.body.state;
        }
        this.sendSocketNotification("ITEM_VALUE_UPDATED", {
          item_name: item_name,
          item_value: item_value,
        });
      });
  },

  rollershutter: function(url, item_name, action) {
    got.post(url + item_name, {body: action});
  },

  toggleSwitch: function(url, item_name) {
    var item_action = 'OFF';
    const r = got.get(url + item_name, {responseType: 'json'})
      .then((response) => {
         if (response.body.state == 'OFF') {
           item_action = 'ON';
         }
         got.post(url + item_name, {body: item_action });
    });

  },

  getItem: function(url, item_name, icon) {
    const r = got.get(url + item_name, {responseType: 'json'})
      .then((response) => {
        item_label = response.body.label;
       
        item_type = null;
        item_value = null;
        item_only_view = false;

        if (response.body.type == 'Switch') {
          item_type = 'Switch';
        }
        if (response.body.type == 'Rollershutter') {
          item_type = 'Rollershutter';
        }
        if (response.body.type.startsWith('Number')) {
          item_type = 'Number';
          item_value = response.body.state;
          item_only_view = true;
        }

        if (item_type != null) {
          this.sendSocketNotification("NEW_ITEM", {
            item_label: item_label,
            item_name: item_name,
            item_type: item_type,
            icon: icon,
            item_value: item_value,
            item_only_view: item_only_view,
          });
        }
        else {
          Log.warn("Item " + item_name + " with Type " + response.body.type + " not supported");
        }
    });
  },
});



