import settings from "../settings"
import request from "../../requestV2"
import * as utils from "../utils/utils"
import constants from "../utils/constants.json"

var page = 0;
var lastAPIUpdate = 0
var lastUpdate = 0

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
	"Crimson Boots", "Crimson Chestplate", "Crimson Leggings", "Crimson Helmet",
	"Fervor Boots", "Fervor Chestplate", "Fervor Leggings", "Fervor Helmet",
	"Aurora Boots", "Aurora Chestplate", "Aurora Leggings", "Aurora Helmet",
	"Terror Boots", "Terror Chestplate", "Terror Leggings", "Terror Helmet"
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
	page = 0
	parseAuctions()
}

function parseAuctions() {
	var url = `https://api.hypixel.net/skyblock/auctions?page=` + page
	request({url: url, json: false})
    .then(function(response) {
        let obj = JSON.parse(response)
		if (!obj.success) {
			return false
		}
		obj.auctions.forEach(auction => {
			let itemNBT  = utils.decompress(auction.item_bytes)
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
				if (armorpieces.some(s => auction.item_name.includes(s))) {
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
		if (page % 10 == 0) {
			ChatLib.chat(constants.color.green + `Working ` + obj.page + `/` + obj.totalPages);
		}
		page += 1
		if (obj.page < obj.totalPages - 1) {
			parseAuctions()
			return
		}
		lastAPIUpdate = obj.lastUpdated
		ChatLib.chat(constants.color.green + `Done ` + mAuctions.length + ` found`);
		lastUpdate = new Date()
    })
	.catch(function(error) {
        print(error);
    })
}

function getLastUpdateString() {
	return new Date(lastAPIUpdate).toLocaleTimeString("en-US")
}

function getAuctions(searchType, typesSelected, tierSelected) {
	var seconds = Math.floor((new Date() - lastUpdate) / 1000);
	if (seconds > (settings.auctionUpdateInterval * 60) || lastUpdate == 0) {
		ChatLib.chat(constants.color.green + `Auctions out of date, refreshing`);
		getAuctionsFromServer()
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
		if (armorpieces.some(s => auction[AUCTION_NAME].includes(s))) {
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
							if (auction[AUCTION_NAME].includes("Crimson")) {
								if (auction[AUCTION_PRICE] < it[1][TYPE_CRIMSON][AUCTION_PRICE] || it[1][TYPE_CRIMSON][AUCTION_PRICE] == 0) {
									it[1][TYPE_CRIMSON] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
								}
							} else if (auction[AUCTION_NAME].includes("Terror")) {
								if (auction[AUCTION_PRICE] < it[1][TYPE_TERROR][AUCTION_PRICE] || it[1][TYPE_TERROR][AUCTION_PRICE] == 0) {
									it[1][TYPE_TERROR] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
								}
							} else if (auction[AUCTION_NAME].includes("Aurora")) {
								if (auction[AUCTION_PRICE] < it[1][TYPE_AURORA][AUCTION_PRICE] || it[1][TYPE_AURORA][AUCTION_PRICE] == 0) {
									it[1][TYPE_AURORA] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
								}
							} else {
								if (auction[AUCTION_PRICE] < it[1][TYPE_FERVOR][AUCTION_PRICE] || it[1][TYPE_FERVOR][AUCTION_PRICE] == 0) {
									it[1][TYPE_FERVOR] = [auction[AUCTION_UUID], auction[AUCTION_NAME], auction[AUCTION_PRICE], auction[AUCTION_LORE]]
								}
							}
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
		ChatLib.chat(constants.format.OBFUSCATED + constants.format.BOLD + `!!!` + constants.format.RESET +
			constants.color.AQUA + ` Auctions for ` + constants.color.DARK_PURPLE + constants.format.BOLD + typesSelected + ` ` + tierSelected + ` ` +
			constants.format.RESET + `(` + constants.color.WHITE + getLastUpdateString() + `) ` +
			constants.format.RESET + constants.format.OBFUSCATED + constants.format.BOLD + `!!!`)
		shardList.forEach(it => {
			var i = 0
			if (it[0].equals(typesSelected)) {
				var found = false
				it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
				it[2].every(function(it2) {
					new Message(
						new TextComponent(constants.color.AQUA + `Attribute Shard ` + it[0] + ` ` + tierSelected + ` ` + constants.color.yellow + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
					new TextComponent(constants.color.AQUA + it2[AUCTION_NAME] + ` ` + constants.color.yellow + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
					new TextComponent(constants.color.AQUA + it2[AUCTION_NAME] + ` ` + constants.color.yellow + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
		ChatLib.chat(constants.format.OBFUSCATED + constants.format.BOLD + `!!!` + constants.format.RESET +
			constants.color.AQUA + ` Auctions for ` + constants.color.DARK_PURPLE + constants.format.BOLD + `Tier ` + tierSelected + ` ` +
			constants.format.RESET + `(` + constants.color.WHITE + getLastUpdateString() + `) ` +
			constants.format.RESET + constants.format.OBFUSCATED + constants.format.BOLD + `!!!`)
		shardList.forEach(it => {
			var i = 0
			var found = false
			it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
			it[2].every(function(it2) {
				new Message(
					new TextComponent(constants.color.AQUA + `Attribute Shard ` + it[0] + ` ` + tierSelected + ` ` + constants.color.yellow + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
	ChatLib.chat(constants.format.OBFUSCATED + constants.format.BOLD + `!!!` + constants.format.RESET +
		constants.color.AQUA + ` Auctions for ` + constants.color.DARK_PURPLE + constants.format.BOLD + typesSelected[0] + ` ` + typesSelected[1] + ` ` +
		constants.format.RESET + `(` + constants.color.WHITE + getLastUpdateString() + `) ` +
		constants.format.RESET + constants.format.OBFUSCATED + constants.format.BOLD + `!!!`)
	dualAttributesList.forEach(it => {
		var found = false
		for (let i = 0; i < 4; i++) {
			if (it[1][i][AUCTION_PRICE] != 0) {
				var it2 = it[1][i]
				new Message(
					new TextComponent(constants.color.AQUA + it2[AUCTION_NAME] + ` ` + constants.color.yellow + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
				new TextComponent(constants.color.AQUA + it[1][AUCTION_NAME] + ` ` + constants.color.yellow + (it[1][AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
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
