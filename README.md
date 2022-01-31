# Magic Mirror Module: OpenHAB Items

This is a module for [Magic Mirror²](https://github.com/MichMich/MagicMirror) to list OpenHAB Items on your Magic Mirror. It is designed for touch screens. But can also display values of Items from your OpenHAB. It uses the OpenHAB REST API.

Supported Items:
 * Rollershutter
 * Switch (does not show the current state of your switch. it will only toggle the switch)
 * Number (and Group:Number)

![example1.png](https://raw.githubusercontent.com/hggh/MMM-OpenHAB-Items/main/img/example1.png)

## Installation

Clone this repository in your `modules` folder, and install dependencies:
```bash
cd ~/MagicMirror/modules # adapt directory if you are using a different one
git clone https://github.com/hggh/MMM-OpenHAB-Items.git
cd MMM-OpenHAB-Items
npm install # this can take a while
```
## Configuration

Add the module to your modules array in your `config.js`.

example configuration:

```
{
		module: 'MMM-OpenHAB-Items',
		position: "top_right",
		header: "OpenHAB", // optional
		config: {
			url: "https://username:password@openhab.example/rest/items/",
			items: [
				{
					item_name: "TableLight",
					icon: "light",
					
				},
				{
					item_name: "Rolladen_Balkon",
				}
			],
                
		}	
	}
```
