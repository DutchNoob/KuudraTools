import {
    @TextProperty,
	@SliderProperty,
	@SwitchProperty,
    @Vigilant,
} from '../Vigilance/index'

@Vigilant("KuudraTools", "KuudraTools", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General"]
        return categories.indexOf(a.name) - categories.indexOf(b.name)
    }
})
class Settings {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", 
`
&b&nKuudraTools ${JSON.parse(FileLib.read("KuudraTools", "metadata.json")).version}

&fMade By DutchNoob_
`
        )
    }

    @TextProperty({
        name: "Hypixel API key",
        description: "",
        category: "General"
    })
    apiKey = ""
	
	
    @SliderProperty({
        name: "Number of auctions to show",
        description: "(default 10)",
        min: 1,
        max: 50,
        category: "General",
    })
    numberOfAuctions = 10;

    @SliderProperty({
        name: "Time between auction updates ",
        description: "Value in minutes (default 10)",
        min: 1,
        max: 60,
        category: "General",
    })
    auctionUpdateInterval = 10;
}

export default new Settings    
