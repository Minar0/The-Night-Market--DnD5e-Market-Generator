#I use this guy to run through all the .jsons in item_tables and set the default pricing for magic items without a price
import os
import json

#Rarity mapping
rarity_to_value = {
    "common":    '100 gp',
    "uncommon":  '500 gp',
    "rare":      '5000 gp',
    "very rare": '50000 gp',
    "legendary": '500000 gp',
    "artifact":  '1000000 gp',
}

folder_path = "./item_tables"

def process_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Failed to decode JSON in file: {file_path}")
            return

    modified = False

    def update_value(obj):
        nonlocal modified
        if isinstance(obj, dict):
            for item in obj.values():
                update_value(item)
            if 'Rarity' in obj and 'Value' in obj and 'Locked' not in obj:
                rarity = obj['Rarity']
                if rarity in rarity_to_value:
                    obj['Value'] = rarity_to_value[rarity]
                    modified = True
        elif isinstance(obj, list):
            for item in obj:
                update_value(item)

    update_value(data)

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes: {file_path}")

def process_all_jsons(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            process_json_file(file_path)


#Main
process_all_jsons(folder_path) #python my beloved