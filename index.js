import settings from "./settings"
import { COLOR_DARK_BLACK, COLOR_DARK_BLUE, COLOR_DARK_GREEN, COLOR_DARK_AQUA, COLOR_DARK_RED } from "./utils"
import { COLOR_DARK_PURPLE, COLOR_GOLD, COLOR_GRAY, COLOR_DARK_GRAY, COLOR_BLUE, COLOR_GREEN, COLOR_AQUA } from "./utils"
import { COLOR_RED, COLOR_LIGHT_PURPLE, COLOR_YELLOW, COLOR_WHITE } from "./utils"
import { FORMAT_OBFUSCATED, FORMAT_BOLD, FORMAT_STRIKETHROUGH, FORMAT_UNDERLINE, FORMAT_ITALIC, FORMAT_RESET } from "./utils"
import { CMDTAG, CMDALIAS } from "./utils"
import { getPlayerInfo } from "./playerinfo"
import { getLowestPriceForAttributes, getLowestPriceForAttributeLevel, getShardPrices, isValidAttribute, showValidAttribute, getAuctionsFromServer } from "./priceinfo"



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
		getAuctionsFromServer()
		return
	}
	if (args[0].equals("price")) {
		var tier = 3
		if (args[1] != undefined && args[2] != undefined) {
			if (isNaN(args[1]) && isNaN(args[2])) {
				if (isValidAttribute(args[1].toUpperCase()) && isValidAttribute(args[2].toUpperCase())) {
					getLowestPriceForAttributes([args[1].toUpperCase(), args[2].toUpperCase()])
					return
				}
			} else if (isNaN(args[1]) && !isNaN(args[2])) {
				if (isValidAttribute(args[1].toUpperCase())) {
					getLowestPriceForAttributeLevel(args[1].toUpperCase(), args[2])
					return
				}
			}
		} else if (args[1] != undefined && args[2] == undefined) {
			if (!isNaN(args[1])) {
				getShardPrices(args[1])
				return
			}
		}
	}
	if (args[0].equals("player")) {
		if (args[1] == undefined) {
			showHelp()
			return
		}
		getPlayerInfo(args[1])
		return
	}
	showHelp()
}).setName(CMDTAG).setAliases(CMDALIAS)

function showHelp() {
	ChatLib.chat("")
	ChatLib.chat(COLOR_YELLOW + FORMAT_BOLD + `KuudraTools v1.0.0`)
	ChatLib.chat(COLOR_GREEN + `Settings: `)
	ChatLib.chat(COLOR_AQUA + `/` + CMDTAG + ` settings`)
	ChatLib.chat(COLOR_GREEN + `Player info: `)
	ChatLib.chat(COLOR_AQUA + `/` + CMDTAG + ` player `+ COLOR_YELLOW + `[NAME]`)
	ChatLib.chat(COLOR_GREEN + `Lowest Armor auctions: `)
	ChatLib.chat(COLOR_AQUA + `/` + CMDTAG + ` price  ` + COLOR_YELLOW + `[ATTR1] [ATTR2]`)
	ChatLib.chat(COLOR_GOLD + `level ` + COLOR_GRAY + `lowest shard prices for the tier`)
	ChatLib.chat(COLOR_GOLD + `attributes + attributes: ` + COLOR_GRAY + `returns lowest per type`)
	ChatLib.chat(COLOR_GOLD + `attributes + level: ` + COLOR_GRAY + `returns cheapest auctions`)
	ChatLib.chat(COLOR_GOLD + `attributes: ` + COLOR_GRAY + showValidAttribute())
	ChatLib.chat(COLOR_GREEN + `Forced(/manual) auctions update: `)
	ChatLib.chat(COLOR_AQUA + `/` + CMDTAG + ` update`)
}
