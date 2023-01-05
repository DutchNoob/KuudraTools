import settings from "../settings"
import constants from "../utils/constants.json"
import * as utils from "../utils/utils"

const kuudraTiers = {
    "none": constants.color.DARK_GRAY + "Basic",
    "hot": constants.color.GRAY + "Hot",
    "burning": constants.color.yellow + "Burning",
    "fiery": constants.color.RED + "Fiery",
    "infernal": constants.color.DARK_RED + "Infernal"
}

export function getInfo(player) {
	if (!settings.apiKey) {
		ChatLib.chat(constants.color.RED + `ERROR: Please enter your Hypxel API key in ` + constants.color.AQUA + `/` + CMDTAG + ` settings`);
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

    utils.getMojangInfo(player).then(mojangInfo => {
        if (!mojangInfo) return ChatLib.chat(constants.color.RED + `Error: No player found with that name!`)
        let {name, id} = mojangInfo
		utils.getRecentProfile(id, null, settings.apiKey).then(profile => {
			if (profile == undefined || profile.members[id] == undefined || 
				profile.members[id].inv_contents == undefined || profile.members[id].inv_contents.data == undefined) {
				ChatLib.chat("&cERROR: user probably on wrong profile");
				return
			}
			let invContentNBT  = utils.decompress(profile.members[id].inv_contents.data)
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
			let wardrobeContentsNBT  = utils.decompress(profile.members[id].wardrobe_contents.data)
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
				a += `\n${kuudraTiers[b]}` + constants.color.WHITE + `: ` + constants.color.green + `${data[b]}`
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
				new TextComponent(constants.format.OBFUSCATED + constants.format.BOLD + `!!!` + constants.format.RESET +
				constants.color.AQUA + constants.format.BOLD + ` ${name} ` + constants.format.RESET +
				constants.color.DARK_PURPLE + `Weight: ` + constants.color.yellow + `${kuudraWeight} ` + 
				constants.color.DARK_PURPLE + `Completions: ` + constants.color.yellow + `${totalComps} ` +
				constants.format.RESET + constants.format.OBFUSCATED + constants.format.BOLD + `!!!`).setHover("show_text", hoverStr)
			).chat()
			if (hasWitherImpactBlade) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Wither impact weapon found`)
						.setHover("show_text", hasWitherImpactBlade)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` No wither impact weapon found!`)
				).chat()

			}
			if (hasTerminatorSE) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Terminator (Soul eater)`)
						.setHover("show_text", hasTerminatorSE)
				).chat()
			}
			if (hasTerminatorFT) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Terminator (Fatal tempo)`)
						.setHover("show_text", hasTerminatorFT)
				).chat()
			}
			if (hasTerminatorDuplex) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Terminator (Duplex)`)
						.setHover("show_text", hasTerminatorDuplex)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` No terminator (Duplex) found`)
				).chat()
			}
			if (gyrokineticwand) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Gyrokenetic wand`)
						.setHover("show_text", gyrokineticwand)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` No gyrokenetic wand found`)
				).chat()
			}
			if (hasPrecursorEye) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Precursor eye`)
						.setHover("show_text", hasPrecursorEye)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` No precursor eye`)
				).chat()
			}
			if (hasLevel200Gdrag) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Level 200 Golden dragon(s)`)
						.setHover("show_text", hasLevel200Gdrag)
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` No level 200 Golden dragon found)`)
				).chat()
			}
			if (bankAmount > 950000000) {
				new Message(
					new TextComponent(CHECK_OK + constants.color.green + ` Bank amount: ` + (bankAmount / 1000000).toFixed(0) + `m`)
						.setHover("show_text", bankAmount.toFixed(0))
				).chat()
			} else {
				new Message(
					new TextComponent(CHECK_NOK + constants.color.RED + ` Bank amount: ` + (bankAmount / 1000000).toFixed(0) + `m`)
						.setHover("show_text", bankAmount.toFixed(0))
				).chat()
			}
		}).catch(e => ChatLib.chat(constants.color.RED + `Error: ${e}`))
	}).catch(e => ChatLib.chat(constants.color.RED + `Error: ${e}`))
}
