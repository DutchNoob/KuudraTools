import settings from "./settings"
import request from "../requestV2"
import { decompress } from "./utils"
import { COLOR_DARK_BLACK, COLOR_DARK_BLUE, COLOR_DARK_GREEN, COLOR_DARK_AQUA, COLOR_DARK_RED } from "./utils"
import { COLOR_DARK_PURPLE, COLOR_GOLD, COLOR_GRAY, COLOR_DARK_GRAY, COLOR_BLUE, COLOR_GREEN, COLOR_AQUA } from "./utils"
import { COLOR_RED, COLOR_LIGHT_PURPLE, COLOR_YELLOW, COLOR_WHITE } from "./utils"
import { FORMAT_OBFUSCATED, FORMAT_BOLD, FORMAT_STRIKETHROUGH, FORMAT_UNDERLINE, FORMAT_ITALIC, FORMAT_RESET } from "./utils"
import { AUCTION_UUID, AUCTION_NAME, AUCTION_PRICE, AUCTION_LORE} from "./utils"
import { TYPE_AURORA, TYPE_CRIMSON, TYPE_TERROR, TYPE_FERVOR} from "./utils"



var mPage = 0;
var mTierSelected
var mTypesSelected

const mSearchType_DUAL = 0
const mSearchType_LOWEST = 1
const mSearchType_SHARDS = 2
var mSearchType

const validAttributes = [
	"MP", "MR", "DOM", "VET", "VIT", "MF"
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
	["MP", "Mana Pool", []],
	["DOM", "Dominance", []],
	["VIT", "Vitality", []],
	["MR", "Mana Regeneration", []],
	["VET", "Veteran", []]
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

export function getLowestPriceForAttributes(types) {
	mSearchType = mSearchType_DUAL
	mTypesSelected = types
	mTierSelected = 0
	init()
	ChatLib.chat(COLOR_GREEN + `Starting price info type ` + COLOR_DARK_PURPLE + types[0] + ` ` + types[1]);
	parseAuctions()
}

export function getLowestPriceForAttributeLevel(types, tier) {
	mSearchType = mSearchType_LOWEST
	mTypesSelected = types
	mTierSelected = tier
	init()
	ChatLib.chat(COLOR_GREEN + `Starting price info type ` + COLOR_DARK_PURPLE  + types + ` tier ` + tier);
	parseAuctions()
}

export function getShardPrices(tier) {
	mSearchType = mSearchType_SHARDS
	mTypesSelected = ""
	mTierSelected = tier
	init()
	ChatLib.chat(COLOR_GREEN + `Starting price info ` + COLOR_DARK_PURPLE  + `tier ` + tier);
	parseAuctions()
}

function init() {
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
	mPage = 0
}

function parseAuctions() {
	var url = `https://api.hypixel.net/skyblock/auctions?page=` + mPage
	request({url: url, json: false})
    .then(function(response) {
        let obj = JSON.parse(response)
		if (!obj.success) {
			return false
		}
		obj.auctions.forEach(function(auction) {
			let itemNBT  = decompress(auction.item_bytes)
			let itemObj = itemNBT.toObject().i
			if (itemObj.length == 1 && auction.bin) {
				var lore = itemObj[0].tag.display.Name + "\n"
				for (let j = 0; j < itemObj[0].tag.display.Lore.length; j++) {
					lore += itemObj[0].tag.display.Lore[j] + "\n"
				}
				if (auction.item_name.equals("Attribute Shard")) {
					let str = ChatLib.removeFormatting(auction.item_lore).split(/\n/)[0].replace(/[^a-zA-Z ]/g, "")
					shardList.forEach(it => {
						if (str.includes(it[1])) {
							let s = str.split(it[1])[1].replaceAll(" ", "")
							if (s.length == mTierSelected) {
								it[2].push([auction.uuid, auction.item_name, auction.starting_bid, lore])
							}
						}
					})
				}
				if (armorpieces.some(s => auction.item_name.includes(s))) {
					var add = checkAttributePresent(itemObj[0])
					var wantedLevel = 1
					if (mTierSelected == 0) {
						wantedLevel = 2
					}
					if (add == wantedLevel) {
						if (mTierSelected != 0) {
							tierOnlyList.forEach(it => {
								if (auction.item_name.includes(it[0])) {
									it[1].push([auction.uuid, auction.item_name, auction.starting_bid, lore])
								}
							})
						} else {
							dualAttributesList.forEach(it => {
								if (auction.item_name.includes(it[0])) {
									if (auction.item_name.includes("Crimson")) {
										if (auction.starting_bid < it[1][TYPE_CRIMSON][AUCTION_PRICE] || it[1][TYPE_CRIMSON][AUCTION_PRICE] == 0) {
											it[1][TYPE_CRIMSON] = [auction.uuid, auction.item_name, auction.starting_bid, lore]
										}
									} else if (auction.item_name.includes("Terror")) {
										if (auction.starting_bid < it[1][TYPE_TERROR][AUCTION_PRICE] || it[1][TYPE_TERROR][AUCTION_PRICE] == 0) {
											it[1][TYPE_TERROR] = [auction.uuid, auction.item_name, auction.starting_bid, lore]
										}
									} else if (auction.item_name.includes("Aurora")) {
										if (auction.starting_bid < it[1][TYPE_AURORA][AUCTION_PRICE] || it[1][TYPE_AURORA][AUCTION_PRICE] == 0) {
											it[1][TYPE_AURORA] = [auction.uuid, auction.item_name, auction.starting_bid, lore]
										}
									} else {
										if (auction.starting_bid < it[1][TYPE_FERVOR][AUCTION_PRICE] || it[1][TYPE_FERVOR][AUCTION_PRICE] == 0) {
											it[1][TYPE_FERVOR] = [auction.uuid, auction.item_name, auction.starting_bid, lore]
										}
									}
								}
							})
						}
					}
				}
				equipmentList.forEach(it => {
					if (itemObj[0].tag.ExtraAttributes.id.includes(it[0])) {
						var add = checkAttributePresent(itemObj[0])
						var wantedLevel = 1
						if (mTierSelected == 0) {
							wantedLevel = 2
						}
						if (add == wantedLevel) {
							if (mTierSelected != 0) {
								it[2].push([auction.uuid, auction.item_name, auction.starting_bid, lore])
							} else {
								if (auction.starting_bid < it[1][AUCTION_PRICE] || it[1][AUCTION_PRICE] == 0) {
									it[1] = [auction.uuid, auction.item_name, auction.starting_bid, lore]
								}
							}
						}
					}
				})
			}
		})
		if (mPage % 10 == 0) {
			ChatLib.chat(COLOR_GREEN + `Working ` + obj.page + `/` + obj.totalPages);
		}
		mPage += 1
		if (obj.page < obj.totalPages - 1) {
			parseAuctions()
			return
		}
		if (mSearchType == mSearchType_LOWEST) {
			ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
				COLOR_AQUA +` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + mTypesSelected + ` ` + mTierSelected + ` ` +
				FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
			shardList.forEach(it => {
				var i = 0
				if (it[0].equals(mTypesSelected)) {
					it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
					it[2].every(function(it2) {
						new Message(
							new TextComponent(COLOR_AQUA + `Attribute Shard ` + it[0] + ` ` + mTierSelected + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
								.setHover("show_text", it2[AUCTION_LORE])
								.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
						).chat()
						i += 1
						if (i > settings.numberOfAuctions) { return false }
						return true
					})
					ChatLib.chat("")
				}
			})
			tierOnlyList.forEach(it => {
				var i = 0
				it[1].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
				it[1].every(function(it2) {
					new Message(
						new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
							.setHover("show_text", it2[AUCTION_LORE])
							.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
					).chat()
					i += 1
					if (i > settings.numberOfAuctions) { return false }
					return true
				})
				ChatLib.chat("")
			})
			equipmentList.forEach(it => {
				var i = 0
				it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
				it[2].every(function(it2) {
					new Message(
						new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
							.setHover("show_text", it2[AUCTION_LORE])
							.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
					).chat()
					i += 1
					if (i > settings.numberOfAuctions) { return false }
					return true
				})
				ChatLib.chat("")
			})
			initStructs()
			return
		}
		if (mSearchType == mSearchType_SHARDS) {
			ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
				COLOR_AQUA +` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + `Tier ` + mTierSelected + ` ` +
				FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
			shardList.forEach(it => {
				var i = 0
				it[2].sort((a, b) => a[AUCTION_PRICE] - b[AUCTION_PRICE])
				it[2].every(function(it2) {
					new Message(
						new TextComponent(COLOR_AQUA + `Attribute Shard ` + it[0] + ` ` + mTierSelected + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
							.setHover("show_text", it2[AUCTION_LORE])
							.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
					).chat()
					i += 1
					if (i > settings.numberOfAuctions) { return false }
					return true
				})
				ChatLib.chat("")
			})
			initStructs()
			return
		}
		ChatLib.chat(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
			COLOR_AQUA +` Auctions for ` + COLOR_DARK_PURPLE + FORMAT_BOLD + mTypesSelected[0] + ` ` + mTypesSelected[1] + ` ` +
			FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`)
		dualAttributesList.forEach(it => {
			for (let i = 0; i < 4; i++) {
				if (it[1][i][AUCTION_PRICE] != 0) {
					var it2 = it[1][i]
					new Message(
						new TextComponent(COLOR_AQUA + it2[AUCTION_NAME] + ` ` + COLOR_YELLOW + (it2[AUCTION_PRICE] / 1000000).toFixed(2) + `m`)
							.setHover("show_text", it2[AUCTION_LORE])
							.setClick("run_command","/viewauction " + it2[AUCTION_UUID])
					).chat()
				}
			}
			ChatLib.chat("")
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
		return
    })
	.catch(function(error) {
		initStructs()
        print(error);
    })
}

function checkAttributePresent(obj) {
	var add = 0
	if (obj && obj.tag  && obj.tag.ExtraAttributes) {
		if (obj.tag.ExtraAttributes.attributes.mana_pool != undefined && mTypesSelected.includes("MP")) {
			if (obj.tag.ExtraAttributes.attributes.mana_pool == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
		if (obj.tag.ExtraAttributes.attributes.dominance != undefined && mTypesSelected.includes("DOM")) {
			if (obj.tag.ExtraAttributes.attributes.dominance == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
		if (obj.tag.ExtraAttributes.attributes.mana_regeneration != undefined && mTypesSelected.includes("MR")) {
			if (obj.tag.ExtraAttributes.attributes.mana_regeneration == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
		if (obj.tag.ExtraAttributes.attributes.veteran != undefined && mTypesSelected.includes("VET")) {
			if (obj.tag.ExtraAttributes.attributes.veteran == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
		if (obj.tag.ExtraAttributes.attributes.mending != undefined && mTypesSelected.includes("VIT")) {
			if (obj.tag.ExtraAttributes.attributes.mending == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
		if (obj.tag.ExtraAttributes.attributes.magic_find != undefined && mTypesSelected.includes("MF")) {
			if (obj.tag.ExtraAttributes.attributes.magic_find == mTierSelected || mTierSelected == 0) {
				add += 1
			}
		}
	}
	return add
}

export function isValidAttribute(attr) {
	if (validAttributes.some(s => attr.equals(s))) {
		return true
	}
	return false
}
