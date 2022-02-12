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
        if (response.body.type.startsWith('Number') || (response.body.type.startsWith('Group') && response.body.groupType.startsWith('Number'))) {
          state = response.body.state;
          pattern = response.body.stateDescription.pattern;
          item_value = this.convertState(state, pattern);
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

  convertState: function(state, pattern) {
    if(pattern != "") {
      var spaceIdx = pattern.indexOf(" ");

      if(spaceIdx != -1) {
        var stateWithSpace = state.indexOf(" ");
        if(stateWithSpace !=-1) {
          //this is an openHAB item with units of measurement support => remove unit from number for formating
          state = state.substring(0,stateWithSpace);
        }
        var number = Number(state);

        var format = pattern.split(" ")[0];
        var dotIndex = format.indexOf(".");
        var fIndex = format.indexOf("f");
        var dIndex = format.indexOf("%d");

        if(dotIndex != -1 && fIndex != -1) {
          var digits = format.substring(dotIndex+1, fIndex);
          number = number.toFixed(digits);
        } else if (dIndex != -1) {
          number = number.toFixed(0);
        }

        unit = pattern.split(" ")[1];
        if("%%" == unit) {
          unit = "%";
        }
        return number + " " + unit;
      }
    } else {
      return state;
    }
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
        if (response.body.type.startsWith('Number') || (response.body.type.startsWith('Group') && response.body.groupType.startsWith('Number'))) {
          item_type = 'Number';
          state = response.body.state;
          pattern = response.body.stateDescription.pattern;
          item_value = this.convertState(state, pattern);
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



