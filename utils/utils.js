import request from "../../requestV2"
import constants from "./constants.json"

export const CHECK = {
    TRUE: constants.color.green + constants.format.bold + "✔" + constants.format.reset,
    FALSE: constants.color.red + constants.format.bold + "✖" + constants.format.reset
}

export const getSkyblockProfiles = (uuid, apiKey) => request(`https://api.hypixel.net/skyblock/profiles?key=${apiKey}&uuid=${uuid}`).then(a => JSON.parse(a)).catch(e => null)
export const getRecentProfile = (uuid, profiles=null, apiKey=null) => {
    uuid = uuid.replace(/-/g, "")
    const getRecent = (profiles) => !profiles.profiles || !profiles.profiles.length ? null : profiles.profiles.find(a => a.selected) ?? profiles[0]
    if (profiles) return getRecent(profiles)
    return getSkyblockProfiles(uuid, apiKey).then(profiles => getRecent(profiles)).catch(e => null)
}
export const getMojangInfo = (player) => {
    if (player.length > 16) return request(`https://sessionserver.mojang.com/session/minecraft/profile/${player}`).then(a => JSON.parse(a)).catch(e => null)
    return request(`https://api.mojang.com/users/profiles/minecraft/${player}`).then(a => JSON.parse(a)).catch(e => null)
}

const ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream")
const Base64 = Java.type("java.util.Base64")
const CompressedStreamTools = Java.type("net.minecraft.nbt.CompressedStreamTools")
export function decompress(compressed) {
    if (compressed === null || compressed.length == 0) {
        return null
    }
    return new NBTTagCompound(CompressedStreamTools.func_74796_a(new ByteArrayInputStream(Base64.getDecoder().decode(compressed))))
}
