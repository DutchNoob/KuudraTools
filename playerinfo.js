import settings from "./settings"
import { COLOR_DARK_BLACK, COLOR_DARK_BLUE, COLOR_DARK_GREEN, COLOR_DARK_AQUA, COLOR_DARK_RED } from "./utils"
import { COLOR_DARK_PURPLE, COLOR_GOLD, COLOR_GRAY, COLOR_DARK_GRAY, COLOR_BLUE, COLOR_GREEN, COLOR_AQUA } from "./utils"
import { COLOR_RED, COLOR_LIGHT_PURPLE, COLOR_YELLOW, COLOR_WHITE } from "./utils"
import { FORMAT_OBFUSCATED, FORMAT_BOLD, FORMAT_STRIKETHROUGH, FORMAT_UNDERLINE, FORMAT_ITALIC, FORMAT_RESET } from "./utils"
import { CHECK_OK, CHECK_NOK } from "./utils"
import { CMDTAG } from "./utils"
import { getRecentProfile, getMojangInfo, decompress } from "./utils"



const kuudraTiers = {
    "none": COLOR_DARK_GRAY + "Basic",
    "hot": COLOR_GRAY + "Hot",
    "burning": COLOR_YELLOW + "Burning",
    "fiery": COLOR_RED + "Fiery",
    "infernal": COLOR_DARK_RED + "Infernal"
}

export function getPlayerInfo(player) {
	if (!settings.apiKey) {
		ChatLib.chat(COLOR_RED + `ERROR: Please enter your Hypxel API key in ` + COLOR_AQUA + `/` + CMDTAG + ` settings`)
		return
	}
	var hasWitherImpactBlade = ""
	var hasTerminatorSE = ""
	var hasTerminatorDuplex = ""
	var hasTerminatorFT = ""
	var gyrokineticwand = ""
	var hasPrecursorEye = ""
	var hasLevel200Gdrag = 0
	var bankAmount = 0

    getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return ChatLib.chat(COLOR_RED + `Error: No player found with that name!`)
        let {name, id} = mojangInfo
		getRecentProfile(id, null, settings.apiKey).then(profile => {
			if (profile == undefined || profile.members[id] == undefined || 
				profile.members[id].inv_contents == undefined || profile.members[id].inv_contents.data == undefined) {
				ChatLib.chat("&cERROR: user probably on wrong profile")
				return
			}
			let invContentNBT  = decompress(profile.members[id].inv_contents.data)
			let invObj = invContentNBT.toObject().i
			for (let i = 0; i < invObj.length; i++) {
				if (invObj[i] == undefined || invObj[i].tag == undefined || invObj[i].tag.ExtraAttributes == undefined) {
					continue
				}
				var witherblades = [ "HYPERION", "SCYLLA", "ASTRAEA", "VALKYRIE" ]
				if (witherblades.some(s => invObj[i].tag.ExtraAttributes.id.includes(s))) {
					if (invObj[i].tag.ExtraAttributes.ability_scroll.length != 3) {
						continue
					}
					hasWitherImpactBlade = invObj[i].tag.display.Name + "\n"
					for (let j = 0; j < invObj[i].tag.display.Lore.length; j++) {
						hasWitherImpactBlade += invObj[i].tag.display.Lore[j] + "\n"
					}
					continue
				}
				var hasDuplex = false
				var hasFT = false
				var hasSoulEater = false
				let tmp = ""
				if (invObj[i].tag.ExtraAttributes.id.equals("TERMINATOR")) {
					tmp = invObj[i].tag.display.Name + "\n"
					for (let j = 0; j < invObj[i].tag.display.Lore.length; j++) {
						tmp += invObj[i].tag.display.Lore[j] + "\n"
						if (invObj[i].tag.display.Lore[j].includes("Duplex")) {
							hasDuplex = true
						}
						if (invObj[i].tag.display.Lore[j].includes("Fatal Tempo")) {
							hasFT = true
						}
						if (invObj[i].tag.display.Lore[j].includes("Soul Eater")) {
							hasSoulEater = true
						}
					}
					if (hasDuplex) {
						hasTerminatorDuplex = tmp
					}
					if (hasFT) {
						hasTerminatorFT = tmp
					}
					if (hasSoulEater) {
						hasTerminatorSE = tmp
					}
					continue
				}
				if (invObj[i].tag.ExtraAttributes.id.equals("GYROKINETIC_WAND")) {
					gyrokineticwand = invObj[i].tag.display.Name + "\n"
					for (let j = 0; j < invObj[i].tag.display.Lore.length; j++) {
						gyrokineticwand += invObj[i].tag.display.Lore[j] + "\n"
					}
				}
				if (invObj[i].tag.ExtraAttributes.id.equals("PRECURSOR_EYE")) {
					hasPrecursorEye = invObj[i].tag.display.Name + "\n"
					for (let j = 0; j < invObj[i].tag.display.Lore.length; j++) {
						hasPrecursorEye += invObj[i].tag.display.Lore[j] + "\n"
					}
				}
			}
			let wardrobeContentsNBT  = decompress(profile.members[id].wardrobe_contents.data)
			let wardrobeObj = wardrobeContentsNBT.toObject().i
			for (let i = 0; i < wardrobeObj.length; i++) {
				if (wardrobeObj[i] == undefined || wardrobeObj[i].tag == undefined || wardrobeObj[i].tag.ExtraAttributes == undefined) {
					continue
				}
				if (wardrobeObj[i].tag.ExtraAttributes.id.equals("PRECURSOR_EYE")) {
					hasPrecursorEye = wardrobeObj[i].tag.display.Name + "\n"
					for (let j = 0; j < wardrobeObj[i].tag.display.Lore.length; j++) {
						hasPrecursorEye += wardrobeObj[i].tag.display.Lore[j] + "\n"
					}
				}
			}
			let pets = profile.members[id].pets
			for (let i = 0; i < pets.length; i++) {
				if (pets[i].type.equals("GOLDEN_DRAGON") && pets[i].exp > 210255385) {
					hasLevel200Gdrag += 1
				}
			}
			let bank = profile.banking
			if (bank != undefined) {
				bankAmount = bank.balance
			}

			let data = profile.members[id].nether_island_player_data.kuudra_completed_tiers
			let totalComps = 0
			let kuudraWeight = 0
			let hoverStr = Object.keys(kuudraTiers).reduce((a, b) => {
				if (!(b in data)) return a
				a += `\n${kuudraTiers[b]}` + COLOR_WHITE + `: ` + COLOR_GREEN + `${data[b]}`
				totalComps += data[b]
				/*
				 * Basic: 0.5
				 * Hot: 1
				 * Burning: 2
				 * Fiery: 4
				 * Infernal: 8
				*/
				switch (b) {
					case "none":
						kuudraWeight += (data[b] * 0.5)
						break
					case "hot":
						kuudraWeight += (data[b] * 1)
						break
					case "burning":
						kuudraWeight += (data[b] * 2)
						break
					case "fiery":
						kuudraWeight += (data[b] * 4)
						break
					case "infernal":
						kuudraWeight += (data[b] * 8)
						break
				}
				return a
			}, "&eKuudra tiers completed")
			new Message(
				new TextComponent(FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!` + FORMAT_RESET +
				COLOR_AQUA + FORMAT_BOLD + ` ${name} ` + FORMAT_RESET +
				COLOR_DARK_PURPLE + `Weight: ` + COLOR_YELLOW + `${kuudraWeight} ` + 
				COLOR_DARK_PURPLE + `Completions: ` + COLOR_YELLOW + `${totalComps} ` +
				FORMAT_RESET + FORMAT_OBFUSCATED + FORMAT_BOLD + `!!!`).setHover("show_text", hoverStr)
			).chat()
			if (hasWitherImpactBlade) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Wither impact weapon found`)
						.setHover("show_text", hasWitherImpactBlade)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` No wither impact weapon found!`)
				).chat()

			}
			if (hasTerminatorSE) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Terminator (Soul eater)`)
						.setHover("show_text", hasTerminatorSE)
				).chat()
			}
			if (hasTerminatorFT) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Terminator (Fatal tempo)`)
						.setHover("show_text", hasTerminatorFT)
				).chat()
			}
			if (hasTerminatorDuplex) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Terminator (Duplex)`)
						.setHover("show_text", hasTerminatorDuplex)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` No terminator (Duplex) found`)
				).chat()
			}
			if (gyrokineticwand) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Gyrokenetic wand`)
						.setHover("show_text", gyrokineticwand)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` No gyrokenetic wand found`)
				).chat()
			}
			if (hasPrecursorEye) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Precursor eye`)
						.setHover("show_text", hasPrecursorEye)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` No precursor eye`)
				).chat()
			}
			if (hasLevel200Gdrag) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Level 200 Golden dragon(s)`)
						.setHover("show_text", hasLevel200Gdrag)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` No level 200 Golden dragon found)`)
				).chat()
			}
			if (bankAmount > 950000000) {
				new Message(
					new TextComponent(CHECK_OK + COLOR_GREEN + ` Bank amount: ` + (bankAmount / 1000000).toFixed(0) + `m`)
						.setHover("show_text", bankAmount.toFixed(0))
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + COLOR_RED + ` Bank amount: ` + (bankAmount / 1000000).toFixed(0) + `m`)
						.setHover("show_text", bankAmount.toFixed(0))
				).chat()
			}
		}).catch(e => ChatLib.chat(COLOR_RED + `Error: ${e}`))
	}).catch(e => ChatLib.chat(COLOR_RED + `Error: ${e}`))
}
