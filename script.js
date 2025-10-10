//~~~~~~~~~~~~~~~~~~~~~ MERCHANTS ~~~~~~~~~~~~~~~~~~~~~\\
merchants = [
  new GearMerchant("Jeff","A simple man selling simple items"),
  new PotionMerchant("Egore", "Obsessed with poisons. Try not to tarry too long here"),
  new ArmorMerchant("Drelshk", "A tallish dwarf who wields a hammer almost as deftly as his brother wields dwarven swears"),
  new WeaponMerchant("Podolshk", "A roundish dwarf who wields dwarven swears almost as deftly as his brother wields a hammer"),
  new MagicMerchant("Fichi", "A soft-spoken drow, yet you get the sense she knows how to get the best deal"),
  new TatooMerchant("Hela", "Lively and deft with the needle, many come to her for her arcane tattoos. She also does (nonmagical) tattoos."),
  new VehicleMerchant("Dallas", "A rather friendly shipwright with a side buisness for anything ridable"),
  new CrazyMerchant("Tentacled  Creature Statue", "The statue doesn't speak, but offers some strange items for sale. Everyone else seems to give it a wide birth"),
];


//~~~~~~~~~~~~~~~~~~~~~ INIT CODE ~~~~~~~~~~~~~~~~~~~~~\\
document.getElementById("generateBtn").addEventListener("click", generateShops);
document.getElementById("saveBtn").addEventListener("click", saveInventories);
document.getElementById("exportBtn").addEventListener("click", exportPlayerHTML);
document.getElementById("saveBtn").disabled = true;
document.getElementById("exportBtn").disabled = true;