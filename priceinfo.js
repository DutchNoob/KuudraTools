import settings from "./settings"
import request from "../requestV2"
import { decompress } from "./utils"
import { COLOR_DARK_BLACK, COLOR_DARK_BLUE, COLOR_DARK_GREEN, COLOR_DARK_AQUA, COLOR_DARK_RED } from "./utils"
import { COLOR_DARK_PURPLE, COLOR_GOLD, COLOR_GRAY, COLOR_DARK_GRAY, COLOR_BLUE, COLOR_GREEN, COLOR_AQUA } from "./utils"
import { COLOR_RED, COLOR_LIGHT_PURPLE, COLOR_YELLOW, COLOR_WHITE } from "./utils"
import { FORMAT_OBFUSCATED, FORMAT_BOLD, FORMAT_STRIKETHROUGH, FORMAT_UNDERLINE, FORMAT_ITALIC, FORMAT_RESET } from "./utils"
import { AUCTION_UUID, AUCTION_NAME, AUCTION_PRICE, AUCTION_LORE, AUCTION_EXTRA_ATTRIBUTES } from "./utils"
import { TYPE_AURORA, TYPE_CRIMSON, TYPE_TERROR, TYPE_FERVOR, TYPE_HOLLOW } from "./utils"



var mPage = 0
var mLastUpdateFromServer = 0
var mLastUpdate = 0
var mLastCmd = undefined

const SEARCHTYPE_DUAL = 0
const SEARCHTYPE_LOWEST = 1
const SEARCHTYPE_SHARDS = 2

const validAttributes = [
	["MP", "mana_pool"],
	["MR", "mana_regeneration"],
	["DO", "dominance"],
	["VE", "veteran"],
	["VI", "mending"],
	["MF", "magic_find"],
	["BR", "breeze"],
	["LR", "life_regeneration"],
	["LL", "lifeline"],
	["SP", "speed"],
	["FO", "fortitude"],
	["AR", "arachno_resistance"],
	["BL", "blazing_resistance"],
	["EN", "ender_resistance"],
	["UN", "undead_resistance"]
]

const armorpieces = [
	["Crimson", TYPE_CRIMSON],
	["Fervor", TYPE_FERVOR],
	["Aurora", TYPE_AURORA],
	["Terror", TYPE_TERROR],
	["Hollow", TYPE_HOLLOW]
]

var dualAttributesList = [
	["Helmet", []],
	["Chestplate", []],
	["Leggings", []],
	["Boots", []]
]

var tierOnlyList = [
	["Helmet", []],
	["Chestplate", []],
	["Leggings", []],
	["Boots", []]
]

var shardList = [
	["MP", "mana_pool", []],
	["MR", "mana_regeneration", []],
	["DO", "dominance", []],
	["VE", "veteran", []],
	["VI", "mending", []],
	["MF", "magic_find", []],
	["BR", "breeze", []],
	["LR", "life_regeneration", []],
	["LL", "lifeline", []],
	["SP", "speed", []],
	["FO", "fortitude", []],
	["AR", "arachno_resistance", []],
	["BL", "blazing_resistance", []],
	["EN", "ender_resistance", []],
	["UN", "undead_resistance", []]

]

var equipmentList = [
	["MOLTEN_NECKLACE", [], []],
	["MAGMA_NECKLACE", [], []],
	["MOLTEN_CLOAK", [], []],
	["GHAST_CLOAK", [], []],
	["MOLTEN_BELT", [], []],
	["BLAZE_BELT", [], []],
	["IMPLOSION_BELT", [], []],
	["MOLTEN_BRACELET", [], []],
	["GLOWSTONE_GAUNTLET", [], []],
	["GAUNTLET_OF_CONTAGION", [], []]
]

var mAuctions = []

export function getLowestPriceForAttributes(types) {
	initStructs()
	getAuctions(SEARCHTYPE_DUAL, types, 0)
}

export function getLowestPriceForAttributeLevel(types, tier) {
	initStructs()
	getAuctions(SEARCHTYPE_LOWEST, types, tier)
}

export function getShardPrices(tier) {
	initStructs()
	getAuctions(SEARCHTYPE_SHARDS, "", tier)
}

function initStructs() {
	dualAttributesList.forEach(it => {
		it[1] = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		]
	})
	tierOnlyList.forEach(it => {
		it[1] = []
	})
	shardList.forEach(it => {
		it[2] = []
	})
	equipmentList.forEach(it => {
		it[1] = [0, 0, 0, 0]
		it[2] = []
	})
}

export function getAuctionsFromServer() {
	mAuctions = []
	mPage = 0
	parseAuctions()
}

function parseAuctions() {
	var url = `https://api.hypixel.net/skyblock/auctions?page=` + mPage
	request({url: url, json: false})
    .then(function(response) {
        let obj = JSON.parse(response)
		if (!obj.success) {
			return false
		}
		obj.auctions.forEach(auction => {
			let itemNBT  = decompress(auction.item_bytes)
			let itemObj = itemNBT.toObject().i
			if (itemObj.length == 1 && auction.bin) {
				var lore = itemObj[0].tag.display.Name + "\n"
				for (let j = 0; j < itemObj[0].tag.display.Lore.length; j++) {
					lore += itemObj[0].tag.display.Lore[j] + "\n"
				}
				if (auction.item_name.equals("Attribute Shard")) {
					if (checkAnyValidAttributePresent(itemObj[0])) {
						mAuctions.push([auction.uuid, auction.item_name, auction.starting_bid, lore, itemObj[0].tag.ExtraAttributes])
					}
				}
				if (armorpieces.some(s => auction.item_name.includes(s[0]))) {
					if (checkAnyValidAttributePresent(itemObj[0])) {
						mAuctions.push([auction.uuid, auction.item_name, auction.starting_bid, lore, itemObj[0].tag.ExtraAttributes])
					}
				}
				equipmentList.every(it => {
					if (itemObj[0].tag.ExtraAttributes.id.includes(it[0])) {
						if (checkAnyValidAttributePresent(itemObj[0])) {
							mAuctions.push([auction.uuid, auction.item_name, auction.starting_bid, lore, itemObj[0].tag.ExtraAttributes])
							return false
						}
					}
					return true
				})
			}
		})
		if (mPage % 10 == 0) {
			ChatLib.chat(COLOR_GREEN + `Working ` + obj.page + `/` + obj.totalPages)
		}
		mPage += 1
		if (obj.page < obj.totalPages - 1) {
			parseAuctions()
			return
		}
		mLastUpdateFromServer = obj.lastUpdated
		ChatLib.chat(COLOR_GREEN + `Done ` + mAuctions.length + ` found`)
		mLastUpdate = new Date()
		if (mLastCmd != undefined) {
			getAuctions(mLastCmd[0], mLastCmd[1], mLastCmd[2])
			mLastCmd = undefined
		}
    })
	.catch(function(error) {
        print(error)
    })
}

function getLastUpdateString() {
	return new Date(mLastUpdateFromServer).toLocaleTimeString("en-US")
}

function getAuctions(searchType, typesSelected, tierSelected) {
	var seconds = Math.floor((new Date() - mLastUpdate) / 1000)
	if (seconds > (settings.auctionUpdateInterval * 60) || mLastUpdate == 0) {
		ChatLib.chat(COLOR_GREEN + `Auctions out of date, refreshing`)
		getAuctionsFromServer()
		mLastCmd = [searchType, typesSelected, tierSelected]
		return
	}
	mAuctions.forEach(auction => {
		if (auction[AUCTION_NAME].equals("Attribute Shard")) {
			shardList.forEach(it => {
				if (checkAttributePresent(auction, it[0], tierSelected) == 1) {
					it[2].push([auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]])
				}
			})
		}
		if (armorpieces.some(s => auction[AUCTION_NAME].includes(s[0]))) {
			var add = checkAttributePresent(auction, typesSelected, tierSelected)
			var wantedLevel = 1
			if (tierSelected == 0) {
				wantedLevel = 2
			}
			if (add == wantedLevel) {
				if (tierSelected != 0) {
					tierOnlyList.forEach(it => {
						if (auction[AUCTION_NAME].includes(it[0])) {
							it[1].push([auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]])
						}
					})
				} else {
					dualAttributesList.forEach(it => {
						if (auction[AUCTION_NAME].includes(it[0])) {
							armorpieces.forEach(a => {
								if (auction[AUCTION_NAME].includes(a[0])) {
									if (auction[AUCTION_PRICE] < it[1][a[1]][AUCTION_PRICE] || it[1][a[1]][AUCTION_PRICE] == 0) {
										it[1][a[1]] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
									}
								}
							})
						}
					})
				}
			}
		}
		equipmentList.forEach(it => {
			if (auction[AUCTION_EXTRA_ATTRIBUTES].id.includes(it[0])) {
				var add = checkAttributePresent(auction, typesSelected, tierSelected)
				var wantedLevel = 1
				if (tierSelected == 0) {
					wantedLevel = 2
				}
				if (add == wantedLevel) {
					if (tierSelected != 0) {
						it[2].push([auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]])
					} else {
						if (auction[AUCTION_PRICE] < it[1][AUCTION_PRICE] || it[1][AUCTION_PRICE] == 0) {
							it[1] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
						}
					}
				}
			}
		})
	})
	if (searchType == SEARCHTYPE_LOWEST) {
		ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
			COLOR_AQUA + ` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + typesSelected + ` ` + tierSelected + ` ` +
			FORMAT_RESET + `(` + COLOR_WHITE + getLastUpdateString() + `) ` +
			FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
		shardList.forEach(it => {
			var i = 0
			if (it[0].equals(typesSelected)) {
				var found = false
				it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
				it[2].every(function(it2) {
					new Message(
						new TextComponent(COLOR_AQUA + `Attribute Shard ` + it[0] + ` ` + tierSelected + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
							.setHover("show_text", it2[AUCTION_LORE])
							.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
					).chat()
					i += 1
					if (i > settings.numberOfAuctions) { return false }
					found = true
					return true
				})
				if (found) { ChatLib.chat("") }
			}
		})
		tierOnlyList.forEach(it => {
			var i = 0
			var found = false
			it[1].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
			it[1].every(function(it2) {
				new Message(
					new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
						.setHover("show_text", it2[AUCTION_LORE])
						.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
				).chat()
				i += 1
				if (i > settings.numberOfAuctions) { return false }
				found = true
				return true
			})
			if (found) { ChatLib.chat("") }
		})
		equipmentList.forEach(it => {
			var i = 0
			var found = false
			it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
			it[2].every(function(it2) {
				new Message(
					new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
						.setHover("show_text", it2[AUCTION_LORE])
						.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
				).chat()
				i += 1
				if (i > settings.numberOfAuctions) { return false }
				found = true
				return true
			})
			if (found) { ChatLib.chat("") }
		})
		initStructs()
		return
	}
	if (searchType == SEARCHTYPE_SHARDS) {
		ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
			COLOR_AQUA + ` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + `Tier ` + tierSelected + ` ` +
			FORMAT_RESET + `(` + COLOR_WHITE + getLastUpdateString() + `) ` +
			FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
		shardList.forEach(it => {
			var i = 0
			var found = false
			it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
			it[2].every(function(it2) {
				new Message(
					new TextComponent(COLOR_AQUA + `Attribute Shard ` + it[0] + ` ` + tierSelected + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
						.setHover("show_text", it2[AUCTION_LORE])
						.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
				).chat()
				i += 1
				if (i > settings.numberOfAuctions) { return false }
				found = true
				return true
			})
			if (found) { ChatLib.chat("") }
		})
		initStructs()
		return
	}
	ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
		COLOR_AQUA + ` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + typesSelected[0] + ` ` + typesSelected[1] + ` ` +
		FORMAT_RESET + `(` + COLOR_WHITE + getLastUpdateString() + `) ` +
		FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
	dualAttributesList.forEach(it => {
		var found = false
		for (let i = 0; i < 4; i++) {
			if (it[1][i][AUCTION_PRICE] != 0) {
				var it2 = it[1][i]
				new Message(
					new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
						.setHover("show_text", it2[AUCTION_LORE])
						.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
				).chat()
				found = true
			}
		}
		if (found) { ChatLib.chat("") }
	})
	equipmentList.forEach(it => {
		if (it[1][AUCTION_PRICE] != 0) {
			new Message(
				new TextComponent(COLOR_AQUA + it[1][AUCTION_NAME] + ` ` + COLOR_YELLOW + (it[1][AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
					.setHover("show_text", it[1][AUCTION_LORE])
					.setClick("run_command","/viewauction " + it[1][AUCTION_UUID])
			).chat()
			ChatLib.chat("")
		}
	})
	initStructs()
}

function checkAttributePresent(auction, selectedTypes, tierSelected) {
	var add = 0
	if (auction[AUCTION_EXTRA_ATTRIBUTES] && auction[AUCTION_EXTRA_ATTRIBUTES].attributes) {
		validAttributes.forEach(it => {
			if (selectedTypes.includes(it[0])) {
				if (auction[AUCTION_EXTRA_ATTRIBUTES].attributes.hasOwnProperty(it[1])) {
					if (auction[AUCTION_EXTRA_ATTRIBUTES].attributes[it[1]] == tierSelected || tierSelected == 0) {
						add += 1
					}
				}
			}
		})
	}
	return add
}

function checkAnyValidAttributePresent(obj) {
	var ret = false
	if (obj && obj.tag  && obj.tag.ExtraAttributes && obj.tag.ExtraAttributes.attributes) {
		validAttributes.every(it => {
			if (obj.tag.ExtraAttributes.attributes.hasOwnProperty(it[1])) {
				ret = true
				return false
			}
			return true
		})
	}
	return ret
}

export function isValidAttribute(attr) {
	if (validAttributes.some(s => attr.equals(s[0]))) {
		return true
	}
	return false
}

export function showValidAttribute(attr) {
	var ret = ""
	validAttributes.forEach(it => {
		ret += it[0] + " "
	})
	return ret
}
