import request from "../requestV2"

export const COLOR_DARK_BLACK = '&0'
export const COLOR_DARK_BLUE = '&1'
export const COLOR_DARK_GREEN = '&2'
export const COLOR_DARK_AQUA = '&3'
export const COLOR_DARK_RED = '&4'
export const COLOR_DARK_PURPLE = '&5'
export const COLOR_GOLD = '&6'
export const COLOR_GRAY = '&7'
export const COLOR_DARK_GRAY = '&8'
export const COLOR_BLUE = '&9'
export const COLOR_GREEN = '&a'
export const COLOR_AQUA = '&b'
export const COLOR_RED = '&c'
export const COLOR_LIGHT_PURPLE = '&d'
export const COLOR_YELLOW = '&e'
export const COLOR_WHITE = '&f'
export const FORMAT_OBFUSCATED = '&k'
export const FORMAT_BOLD = '&l'
export const FORMAT_STRIKETHROUGH = '&m'
export const FORMAT_UNDERLINE = '&n'
export const FORMAT_ITALIC = '&o'
export const FORMAT_RESET = '&r'
export const CHECK_OK = COLOR_GREEN + FORMAT_BOLD + '✔' + FORMAT_RESET
export const CHECK_NOK = COLOR_RED + FORMAT_BOLD + '✖' + FORMAT_RESET

export const AUCTION_UUID = 0
export const AUCTION_NAME = 1
export const AUCTION_PRICE = 2
export const AUCTION_LORE = 3
export const AUCTION_EXTRA_ATTRIBUTES = 4

export const TYPE_AURORA = 0
export const TYPE_CRIMSON = 1
export const TYPE_TERROR = 2
export const TYPE_FERVOR = 3
export const TYPE_HOLLOW = 4

export const CMDTAG = "kuudratools"
export const CMDALIAS = "kt"


export const getSbProfiles = (uuid, apiKey) => request(`https://api.hypixel.net/skyblock/profiles?key=${apiKey}&uuid=${uuid}`).then(a => JSON.parse(a)).catch(e => null)
export const getRecentProfile = (uuid, profiles=null, apiKey=null) => {
    uuid = uuid.replace(/-/g, "")
    const getRecent = (profiles) => !profiles.profiles || !profiles.profiles.length ? null : profiles.profiles.find(a => a.selected) ?? profiles[0]
    if (profiles) return getRecent(profiles)
    return getSbProfiles(uuid, apiKey).then(profiles => getRecent(profiles)).catch(e => null)
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
