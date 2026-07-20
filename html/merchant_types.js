//Classes that represent the various merchants

class Merchant {
    constructor(name = "Jimmy Jeneric", lore = "You really shouldn't use the Merchant superclass...") {
        this.table_loc = "item_tables";
        this.table_name = "adventuring_gear.json"; //These'll be combined into the full path of ./table_loc/table_name

        this.item_table = []; //Full list of items that the merchant could sell
        this.inventory = {}; //Current items that the merchant is selling, organized by section
        this.sections = [{
            name: "Items",
            filter: () => true,
            sort: (item0, item1) => this.nameSort(item0, item1),
            volatility: 10,
            amount: 8,
            shuffle: true
        }]; //Used to set up sections of a merchants inventory

        //Used in the merchantLuck system. 
        this.merchantLuck;
        this.luck_range = 30;

        //Characterization variables
        this.name = name;
        this.lore = lore;
        this.type = "Generic"
        this.last_luck;
    }

    //Loads the respective json item table
    async loadItems() {
        const response = await fetch(`${this.table_loc}/${this.table_name}`);
        this.item_table = await response.json();
        console.log(`Loaded ${this.item_table.length} items for ${this.type} merchant: ${this.name}`);
    }

    //Fisher-Yates shuffle because I am a Serious Programmer. 
    //Who stole this code from the internet.
    //But it's Very fast.
    //https://bost.ocks.org/mike/shuffle/
    shuffleArray(array) {
        let unsorted_elements = array.length;
        let tmp, i;

        while (unsorted_elements) {
            i = Math.floor(Math.random() * unsorted_elements--);
            tmp = array[unsorted_elements];
            array[unsorted_elements] = array[i];
            array[i] = tmp;
        }
        return array;
    }

    //Sets up the merchants inventory based on the section filters
    setInventory() {
        this.rerollMerchantLuck();
        this.inventory = {};

        for (const section of this.sections) { //Loop through each desired section and sets up it's items
            let section_items = {};

            if (section.filter)
                section_items= this.item_table.filter(section.filter);

            //Adjusts price randomely
            for (const item of section_items) { //OF NOT IN
                const default_price = parseFloat(item.Value);
                let next_price= this.getPrice(default_price, section.volatility);
                if (section.scale) {next_price = Math.round(next_price - (next_price * (section.scale / 100)));}
                if (next_price <= 0) next_price=1;

                const next_price_str = next_price.toLocaleString() //makes it look pretty
                item.Value = item.Value.replace(/\d+/, next_price_str);
            }

            if (section.shuffle === true)
                section_items = this.shuffleArray([...section_items]);
            if (section.amount)
                section_items = section_items.slice(0, section.amount);
            if (section.sort)
                section_items = section_items.sort(section.sort);


            this.inventory[section.name] = section_items
        }
    }

    //merchantLuck system. Changes the price of items based on a random price volatility and the merchant luck
    getRandPercent(range) {
        return Math.trunc((Math.random() - 0.5) * (range * 2));
    }
    rerollMerchantLuck() {
        this.merchantLuck = this.getRandPercent(this.luck_range);
    }
    getPrice(default_price, volatility = 0) {
        let price_range = this.merchantLuck + this.getRandPercent(volatility);
        let new_price = Math.round(default_price - (default_price * (price_range / 100)));
        return new_price;
    }

    //Generates the div that represents each item in the store
    genItemDiv(item) {
        const div = document.createElement("div");
        div.className = "shopItem";


        //me when i create columns
        const name_col = document.createElement("span");
        name_col.className = "item-name";
        if (item.Attunement === "requires attunement")
            name_col.textContent = item.Name + " (A)";
        else
            name_col.textContent = item.Name;

        const type_col = document.createElement("span");
        type_col.className = "item-type";
        type_col.textContent = item.Type;
        if (item.Type == "") type_col.textContent = "(BUG) No specified type";
        else type_col.textContent = item.Type;

        const rarity_col = document.createElement("span");
        rarity_col.className = "item-rarity";
        if (item.Rarity == "none") rarity_col.textContent = "Mundane";
        else rarity_col.textContent = item.Rarity;

        const value_col = document.createElement("span");
        value_col.className = "item-value";
        if (item.Value == "") value_col.textContent = "(BUG) No monetary value"; //If you see this, there's a bug
        else value_col.textContent = item.Value;

        div.appendChild(name_col);
        div.appendChild(type_col);
        div.appendChild(rarity_col);
        div.appendChild(value_col);


        //Add tooltip
        if (item.Text != "") {
            const tooltip = document.createElement("span");
            tooltip.className = "tooltiptext";
            tooltip.textContent = item.Text;
            div.appendChild(tooltip);

            div.addEventListener('mouseenter', () => {
                const rect = tooltip.getBoundingClientRect();
                if (rect.top < 0) {
                    tooltip.style.top = '125%';
                    tooltip.style.bottom = 'auto';
                    tooltip.classList.add('tooltip-flipped');
                }
            });
            div.addEventListener('mouseleave', () => {
                tooltip.style.bottom = '125%';
                tooltip.style.top = 'auto';
                tooltip.classList.remove('tooltip-flipped');
            });
        }

        return div;
    }

    render() {
        document.getElementById("shopName").innerText = this.name;
        document.getElementById("shopLore").innerText = this.lore;

        const items_div = document.getElementById("shopItems");
        items_div.innerHTML = "";

        for (const sectionName in this.inventory) {
            const items = this.inventory[sectionName];
            if (items.length === 0) {
                console.log(`Empty section generated for ${this.type} merchant: ${this.name}!`);
                continue;
            }

            const sectionConfig = this.sections.find(s => s.name === sectionName);
            const isSpecial = sectionConfig?.special || false;

            //Header text
            const sectionHeader = document.createElement("h3");
            sectionHeader.className = "sectionHeader";
            if (isSpecial) {
                sectionHeader.classList.add("special-section");
            }
            sectionHeader.textContent = sectionName;
            items_div.appendChild(sectionHeader);

            //Container
            const sectionContainer = document.createElement("div");
            sectionContainer.className = "sectionContainer";
            if (isSpecial) {
                sectionContainer.classList.add("special-section");
            }

            //Columns
            const headerRow = document.createElement("div");
            headerRow.className = "item-header";
            headerRow.innerHTML = `
                <span>Name</span>
                <span>Type</span>
                <span>Rarity</span>
                <span>Value</span>`;
            sectionContainer.appendChild(headerRow);

            //Add items to section
            for (const item of items) {
                sectionContainer.appendChild(this.genItemDiv(item));
            }
            items_div.appendChild(sectionContainer);
        }

    }

    //I'm putting common section filters here
    noMagicFilter(item) { return item.Rarity === "none"; }
    onlyMagicFilter(item) { return item.Rarity !== "none"; } //Oops All Magic Items
    commonFilter(item) { return item.Rarity === "common"; }
    uncommonFilter(item) { return item.Rarity === "uncommon"; }
    rareFilter(item) { return item.Rarity === "rare"; }
    veryRareFilter(item) { return item.Rarity === "very rare"; }
    legendaryFilter(item) { return item.Rarity === "legendary"; }

    nameSort(item0, item1) { return item0.Name.localeCompare(item1.Name) }
    typeSort(item0, item1) { return item0.Type.localeCompare(item1.Type) }
    priceSort(item0, item1) { 
        const price0 = parseFloat(item0.Value.replace(/,/g, '').replace(' gp', ''));
        const price1 = parseFloat(item1.Value.replace(/,/g, '').replace(' gp', ''));
        return price0 - price1;}
    raritySort(item0, item1) {
        const rarityTypes = [
            "none",
            "common",
            "uncommon",
            "rare",
            "very rare",
            "legendary"
        ];

        const getWeight = (item) => {
            const index = rarityTypes.findIndex(type => item.Rarity === type); // Use === instead of includes
            return index === -1 ? 0 : index;
        };


        return getWeight(item0) - getWeight(item1);
    }
}

class ArmorMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "armor.json";
        this.type = "Armorer";

        this.sections = [
        {
            name: "Today's Special",
            filter: (item) => this.legendaryFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 30,
            amount: 1,
            shuffle: true,
            special: true
        }, {
            name: "Common Magic Armor",
            filter: (item) => this.commonFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 15,
            amount: 10,
            shuffle: true
        }, {
            name: "Uncommon Magic Armor",
            filter: (item) => this.uncommonFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 20,
            amount: 5,
            shuffle: true
        }, {
            name: "Rare Magic Armor",
            filter: (item) => this.rareFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 30,
            amount: 3,
            shuffle: true
        },{
            name: "Very Rare Magic Armor",
            filter: (item) => this.veryRareFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 20,
            amount: 2,
            shuffle: true
        }, {
            name: "Standard Armor",
            filter: (item) => this.noMagicFilter(item),
            sort: (item0, item1) => this.armorSort(item0, item1),
            volatility: 10
            
        }];
    }

    armorSort(item0, item1) {
        const armorTypes = ["light armor", "medium armor", "heavy armor"];

        const getWeight = (item) => {
            const index = armorTypes.findIndex(type => item.Type.includes(type));
            return index === -1 ? 3 : index;
        };

        return getWeight(item0) - getWeight(item1);
    }
}

class WeaponMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "weapons.json";
        this.type = "Weaponry";

        this.sections = [{
            name: "Weapon Of The Day",
            filter: (item) => this.legendaryFilter(item),
            sort: (item0, item1) => this.weaponSort(item0, item1),
            volatility: 30,
            amount: 1,
            shuffle: true,
            special: true
        }, {
            name: "Uncommon Magic Weapons",
            filter: (item) => this.uncommonFilter(item),
            sort: (item0, item1) => this.weaponSort(item0, item1),
            volatility: 20,
            amount: 5,
            shuffle: true
        }, {
            name: "Rare Magic Weapons",
            filter: (item) => this.rareFilter(item),
            sort: (item0, item1) => this.weaponSort(item0, item1),
            volatility: 30,
            amount: 5,
            shuffle: true
        }, {
            name: "Very Rare Magic Weapons",
            filter: (item) => this.veryRareFilter(item),
            sort: (item0, item1) => this.weaponSort(item0, item1),
            volatility: 20,
            amount: 3,
            shuffle: true
        }, {
            name: "Standard Weapons",
            filter: (item) => this.noMagicFilter(item),
            sort: (item0, item1) => this.weaponSort(item0, item1),
            volatility: 10
        }];
    }

    weaponSort(item0, item1) {
        const weaponTypes = ["simple weapon", "martial weapon", "ranged weapon"];

        const getWeight = (item) => {
            const index = weaponTypes.findIndex(type => item.Type.includes(type));
            return index === -1 ? 3 : index; //Wooooo trinary operators
        };

        return getWeight(item0) - getWeight(item1);
    }
}

class MagicMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "magic_items.json";
        this.type = "Mage";

        this.sections = [{
            name: "Fichi's Find!",
            filter: (item) => this.legendaryFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 30,
            amount: 1,
            shuffle: true,
            special: true
        }, {
            name: "Common Magic Items",
            filter: (item) => this.commonFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
            amount: 10,
            shuffle: true
        }, {
            name: "Uncommon Magic Items",
            filter: (item) => this.uncommonFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
            amount: 7,
            shuffle: true
        }, {
            name: "Rare Magic Items",
            filter: (item) => this.rareFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 30,
            amount: 5,
            shuffle: true
        }, {
            name: "Very Rare Magic Items",
            filter: (item) => this.veryRareFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
            amount: 3,
            shuffle: true
        }, {
            name: "Foci",
            filter: (item) => this.noMagicFilter(item),
            sort: (item0, item1) => this.nameSort(item0, item1),
            volatility: 10
        }];
    }
}

class TatooMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "tattoos.json";
        this.type = "Tattoo Artist";
        this.luck_range = 0;;

        this.sections = [{
            name: "Permanent Tattoos",
            filter: (item) => !this.singleUseFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 10
        } ,{
            name: "Single Use Tattoos",
            filter: (item) => this.singleUseFilter(item),
            sort: (item0, item1) => this.raritySort(item0, item1)
        }];
    }
    singleUseFilter(item) { return item.Type.includes("single use"); }
}

class PotionMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "potions.json";
        this.type = "Apothecary";

        this.sections = [{
            name: "Healing Potions - yeah you're gonna want these",
            filter: (item) => this.healingPotFilter(item),
            sort: (item0, item1) => this.raritySort(item0, item1),
        }, {
            name: "Poisons (No questions asked)",
            filter: (item) => this.poisonPotFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
            amount: 5,
            shuffle: true
        }, {
            name: "Whatever I cooked up in the back",
            filter: (item) => (!this.healingPotFilter(item) && !this.poisonPotFilter(item)),
            sort: (item0, item1) => this.raritySort(item0, item1),
            scale: 90,
            amount: 7,
            shuffle: true
        }];
    }

    healingPotFilter(item) { return item.Type.includes("healing"); }
    poisonPotFilter(item) { return item.Type.includes("poison"); }
}

class CrazyMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "all.json";
        this.type = "???";

        this.sections = [{
            name: "buy them....",
            filter: (item) => true,
            sort: (item0, item1) => this.raritySort(item0, item1),
            volatility:90,
            shuffle: true,
            amount: 3,
            special: true
        }];
    }
}

class VehicleMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "vehicles.json";
        this.type = "Shipwright";

        this.sections = [{
            name: "Me ships. Might needa bito dustin', but thay float fine",
            filter: (item) => this.shipFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 30,
            amount: 3,
            shuffle: true
        }, {
            name: "Horses and thangs kinda like horses. Ye needa' place ta put 'em acourse",
            filter: (item) => this.horseFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
            amount: 5,
            shuffle: true
        }, {
            name: "Tack and Harness. Fer yer horses",
            filter: (item) => this.tnhFilter(item),
            sort: (item0, item1) => this.priceSort(item0, item1),
        }];
    }

    shipFilter(item) { return item.Type.includes("vehicle"); }
    horseFilter(item) { return item.Type.includes("mount"); }
    tnhFilter(item) { return item.Type.includes("tack and harness"); }
}

class GearMerchant extends Merchant {
    constructor(name, lore) {
        super(name, lore);
        this.table_name = "adventuring_gear.json";
        this.type = "Basic Gear";
        this.luck_range = 10;

        this.sections = [{
            name: "Gear",
            filter: () => true,
            sort: (item0, item1) => this.priceSort(item0, item1),
            volatility: 20,
        }];
    }
}