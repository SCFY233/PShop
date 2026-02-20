import { config } from '../consts.js'
/**
 * 解析物品NBT
 * @param {NbtCompound} nbt 物品NBT
 * @param {Array<string>} otherdeletes 需要额外删除的NBT标签
 * @returns {Object|null} 物品信息，解析失败返回null
 */
export function parseItemNbt(nbt, otherdeletes = []) {
    try {
        if (nbt == null) return null;
        const nbtobj = nbt instanceof NbtCompound ? NBTtoObject(nbt) : { ...nbt };
        const nbtConfig = config.get("nbt");
        delete nbtobj.WasPickedUp;
        delete nbtobj.Damage;
        if (nbtobj.Block) {
            delete nbtobj.Block.version;
        }
        if (nbtobj.tag && typeof nbtobj.tag === "object") {
            if (!nbtConfig.MatchBucketEntityCustomName) {
                const nameTags = ['CustomName', 'AppendCustomName', 'BodyID', 'GroupName'];
                nameTags.forEach(tag => delete nbtobj.tag[tag]);
            }
            if (!nbtConfig.MatchRepairCost) {
                delete nbtobj.tag.RepairCost;
            }
            const entityTags = [
                'FallDistance', 'Fire', 'Strength', 'Sheared', 'trackingHandle',
                'definitions', 'UniqueID', 'Pos', 'Rotation', 'Motion',
                'CustomNameVisible', 'LastDimensionId', 'OnGround', 'PortalCooldown',
                'IsGlobal', 'IsAutonomous', 'LinksTag', 'LootDropped', 'StrengthMax',
                'OwnerNew', 'Sitting', 'IsOrphaned', 'IsOutOfControl', 'Saddled',
                'Chested', 'ShowBottom', 'IsGliding', 'IsSwimming', 'IsEating',
                'IsScared', 'IsStunned', 'IsRoaring', 'SkinID', 'Persistent', 'Tags',
                'Air', 'InLove', 'LoveCause', 'BreedCooldown', 'ChestItems',
                'InventoryVersion', 'LootTable', 'LootTableSeed', 'DamageTime', 'GeneArray',
                'entries', 'TimeStamp', 'HasExecuted', 'CountTime', 'TrustedPlayersAmount',
                'TrustedPlayer', 'fogCommandStack', 'properties', 'map_uuid', 'map_name_index',
                'wasJustBrewed', 'Slot', 'Invulnerable',
            ];
            entityTags.forEach(tag => delete nbtobj.tag[tag]);
            const nbtobjItems = nbtobj.tag.Items || [];
            const chargedItem = nbtobj.tag.ChargedItem || "";
            delete nbtobj.tag.Items;
            delete nbtobj.tag.ChargedItem;
            if (nbtobj.tag.Damage === 0) {
                delete nbtobj.tag.Damage;
            }
            return {
                parsednbtobj: nbtobj,
                nbtItems: nbtobjItems,
                chargedItem,
            };
        }
        if (!nbtobj.tag) {
            nbtobj.tag = {};
        }
        for (const tag of otherdeletes) {
            delete nbtobj[tag];
        }
        return {
            parsednbtobj: nbtobj,
            NBTItems: [],
            chargedItem: null,
        };
    } catch (e) {
        logger.error(`[parseItemNbt] 解析NBT失败: ${e.message}`);
        return null;
    }
}
/**
 * 解析物品SNBT
 * @param {String} snbt 物品SNBT
 * @returns {Object|null} 物品信息，解析失败返回null
 */
export const parseItemSNBT = (snbt) => parseItemNbt(NBT.parseSNBT(snbt))
/**
 * 将NBT对象转换为JavaScript对象
 * @param {NbtCompound | NbtList} nbt NBT对象
 * @returns {Object | Array} 转换后的JavaScript对象或数组
 */
export function NBTtoObject(nbt) {
    try {
        const simpleTypes = [NBT.Byte, NBT.Short, NBT.Int, NBT.Long, NBT.Float, NBT.Double, NBT.String];
        if (nbt.getType() === NBT.Compound) {
            const obj = {};
            const keys = nbt.getKeys();
            for (const key of keys) {
                const tag = nbt.getTag(key);
                const tagType = tag.getType();
                if (simpleTypes.includes(tagType)) {
                    obj[key] = tag.get();
                } else if (tagType === NBT.ByteArray) {
                    obj[key] = tag.getData();
                } else if (tagType === NBT.List || tagType === NBT.Compound) {
                    obj[key] = NBTtoObject(tag);
                }
            }
            return obj;
        } else if (nbt.getType() === NBT.List) {
            const array = [];
            const size = nbt.getSize();
            for (let i = 0; i < size; i++) {
                const tag = nbt.getTag(i);
                const tagType = tag.getType();
                if (simpleTypes.includes(tagType)) {
                    array.push(tag.get());
                } else if (tagType === NBT.ByteArray) {
                    array.push(tag.getData());
                } else if (tagType === NBT.List || tagType === NBT.Compound) {
                    array.push(NBTtoObject(tag));
                }
            }
            return array;
        }
        return null;
    } catch (e) {
        logger.error(`[NBTtoObject] 转换NBT对象失败: ${e.message}`);
        return null;
    }
}