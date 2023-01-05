import settings from "./settings"
import constants from "./utils/constants.json"
import * as player from "./commands/player"
import * as price from "./commands/price"

const CMDTAG = "kuudratools"
const CMDALIAS = "kt"

register("command", (...args) => 
{
	if (args[0] == undefined) {
		showHelp()
		return
	}
	if (args[0].equals("settings")) {
		settings.openGUI()
		return
	}
	if (args[0].equals("update")) {
		price.getAuctionsFromServer()
		return
	}
	if (args[0].equals("price")) {
		var tier = 3
		if (args[1] != undefined && args[2] != undefined) {
			if (isNaN(args[1]) && isNaN(args[2])) {
				if (price.isValidAttribute(args[1].toUpperCase()) && price.isValidAttribute(args[2].toUpperCase())) {
					price.getLowestPriceForAttributes([args[1].toUpperCase(), args[2].toUpperCase()])
					return
				}
			} else if (isNaN(args[1]) && !isNaN(args[2])) {
				if (price.isValidAttribute(args[1].toUpperCase())) {
					price.getLowestPriceForAttributeLevel(args[1].toUpperCase(), args[2])
					return
				}
			}
		} else if (args[1] != undefined && args[2] == undefined) {
			if (!isNaN(args[1])) {
				price.getShardPrices(args[1])
				return
			}
		}
	}
	if (args[0].equals("player")) {
		if (args[1] == undefined) {
			showHelp()
			return
		}
		player.getInfo(args[1])
		return
	}
	showHelp()
}).setName(CMDTAG).setAliases(CMDALIAS)

function showHelp() {
	ChatLib.chat("")
	ChatLib.chat(constants.color.yellow + constants.format.BOLD + `KuudraTools v1.0.0`);
	ChatLib.chat(constants.color.green + `Settings: `)
	ChatLib.chat(constants.color.AQUA + `/` + CMDTAG + ` settings`);
	ChatLib.chat(constants.color.green + `Player info: `)
	ChatLib.chat(constants.color.AQUA + `/` + CMDTAG + ` player `+ constants.color.yellow + `[NAME]`);
	ChatLib.chat(constants.color.green + `Lowest Armor auctions: `)
	ChatLib.chat(constants.color.AQUA + `/` + CMDTAG + ` price  ` + constants.color.yellow + `[ATTR1] [ATTR2]`);
	ChatLib.chat(constants.color.GOLD + `level ` + constants.color.GRAY + `lowest shard prices for the tier`);
	ChatLib.chat(constants.color.GOLD + `attributes + attributes: ` + constants.color.GRAY + `returns lowest per type`);
	ChatLib.chat(constants.color.GOLD + `attributes + level: ` + constants.color.GRAY + `returns cheapest auctions`);
	ChatLib.chat(constants.color.GOLD + `attributes: ` + constants.color.GRAY + price.showValidAttribute());
	ChatLib.chat(constants.color.green + `Forced(/manual) auctions update: `)
	ChatLib.chat(constants.color.AQUA + `/` + CMDTAG + ` update`);
}
