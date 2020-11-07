
Module.register('MMM-OpenHAB-Items', {
  items: [],
  config: null,

  defaults: {
    tableClass: 'xsmall',
  },

  getStyles: function() {
    return ['MMM-OpenHAB-Items.css', 'font-awesome.css'];
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    if (this.config.url == null) {
      Log.error("MMM-OpenHAB-Items.js: url parameter in config not found.");
      return;
    }
    for (var i in this.config.items) {
      var item = this.config.items[i];
      this.addItem(this.config.url, item);
      
    }
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'NEW_ITEM') {
      this.items.push({
        item_label: payload.item_label,
        item_name: payload.item_name,
        icon: payload.icon,
        item_type: payload.item_type,
        item_value: payload.item_value,
      })
    }

    this.updateDom(200);
  },

  addItem: function(url, item) {
    this.sendSocketNotification("ADD_ITEM", {
      url: url,
      item_name: item.item_name,
      icon: item.icon,
    });
  },

  getHeader: function() {
    return "OpenHAB";
  },

  getDom: function() {
    var table = document.createElement("table");
    table.className = this.config.tableClass;

    if (this.items.length == 0) {
      var noDataRow = document.createElement("tr");
      noDataRow.className = "normal";
      var noDataCell = document.createElement("td");
      noDataCell.innerHTML = "no data";
      noDataRow.appendChild(noDataCell);
      table.appendChild(noDataRow);

      return table;
    }

    for (var i in this.items) {
      var self = this;
      var item = this.items[i];
      var dataRow = document.createElement("tr");
      var labelCell = document.createElement("td");
      var valueCell = document.createElement("td");
      labelCell.innerHTML = item.item_label;
      labelCell.className = "label_name";

      item_value = document.createElement("span")

      if (item.item_type == 'Number') {
         item_value.innerHTML = item.item_value;
      }

      if (item.item_type == 'Switch') {
        if (item.icon != null && item.icon == 'light') {
          item_value.className = "fa fa-fw fa-lightbulb";
        }
        else {
          item_value.className = "fa fa-fw fa-toggle-on";
        }
        item_value.setAttribute("id", "MMM-OpenHAB-Items-" + item.item_name);
        item_value.setAttribute("data-item-name", item.item_name);
        item_value.addEventListener("click", function() {
          self.sendSocketNotification("TOGGLE_SWITCH", {item_name: this.dataset.itemName, url: self.config.url})
        });
      }

      if (item.item_type == 'Rollershutter') {
        item_value.className = "Rollershutter";
        shutter_up = document.createElement("span")
        shutter_up.setAttribute("data-item-name", item.item_name);
        shutter_up.className = "fa fa-fw fa-sort-up";
        shutter_up.addEventListener("click", function() {
          self.sendSocketNotification("ROLLERSHUTTER", {item_name: this.dataset.itemName, url: self.config.url, action: 'UP'})
        });

        shutter_halt = document.createElement("span")
        shutter_halt.setAttribute("data-item-name", item.item_name);
        shutter_halt.className = "fa fa-fw fa-window-close";
        shutter_halt.addEventListener("click", function() {
          self.sendSocketNotification("ROLLERSHUTTER", {item_name: this.dataset.itemName, url: self.config.url, action: 'STOPP'})
        });


        shutter_down = document.createElement("span")
        shutter_down.setAttribute("data-item-name", item.item_name);
        shutter_down.className = "fa fa-fw fa-sort-down";
        shutter_down.addEventListener("click", function() {
          self.sendSocketNotification("ROLLERSHUTTER", {item_name: this.dataset.itemName, url: self.config.url, action: 'DOWN'})
        });

        item_value.appendChild(shutter_up);
        item_value.appendChild(shutter_halt);
        item_value.appendChild(shutter_down);
      }

      valueCell.appendChild(item_value);

      dataRow.appendChild(labelCell);
      dataRow.appendChild(valueCell);

      table.appendChild(dataRow);
    }
    return table;
  },
});
