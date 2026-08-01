import { Minecraft } from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js";
const writeY = mc.getServerProtocolVersion() >= 944
    ? (bs, y) => bs.writeVarInt(y)
    : (bs, y) => bs.writeUnsignedVarInt(y);
export function sendUpdateBlockPacket(player, pos, runtimeId, layer = 0, flags = 3) {
    const bs = new BinaryStream();
    bs.writeVarInt(pos.x);
    writeY(bs, pos.y);
    bs.writeVarInt(pos.z);
    bs.writeUnsignedVarInt(Number(runtimeId));
    bs.writeUnsignedVarInt(Number(layer));
    bs.writeUnsignedVarInt(Number(flags));
    return player.sendPacket(bs.createPacket(0x15));
}
/**
发送 BlockActorDataPacket (ID 56)
用于更新客户端指定坐标的方块实体 NBT 数据
*/
export function sendBlockActorDataPacket(player, pos, nbt) {
    const bs = new BinaryStream();
    bs.writeVarInt(pos.x);
    writeY(bs, pos.y);
    bs.writeVarInt(pos.z);
    bs.writeCompoundTag(nbt);
    return player.sendPacket(bs.createPacket(56));
}
// ==========================================
// NBT 构建工具
// ==========================================
/**
构建单面文本 NBT 复合标签
@param {string} text - 文本内容
@param {string} owner - 文本所有者 (用于过滤)
@param {boolean} persistFormatting - 是否保留格式化代码 (§)
@param {number} color - 文本颜色 (ARGB 整数)
@returns {NbtCompound} 木牌单面文本 NBT
*/
export function buildSignTextNBT(text, owner = "PShop", persistFormatting = true, color = -16777216) {
    const tag = new NbtCompound();
    tag.setString("FilteredText", "");
    tag.setByte("HideGlowOutline", 0);
    tag.setByte("IgnoreLighting", 0);
    tag.setByte("PersistFormatting", persistFormatting ? 1 : 0);
    tag.setInt("SignTextColor", color);
    tag.setString("Text", text);
    tag.setString("TextOwner", owner);
    return tag;
}
// ==========================================
// 核心 API
// ==========================================
/**
更新木牌文本 (支持真实修改与虚拟发包)
@param {Player|Player[]} players - 目标玩家(数组)
@param {number} x - X 坐标
@param {number} y - Y 坐标
@param {number} z - Z 坐标
@param {Object} [options] - 配置项
@param {string} [options.frontText=""] - 正面文本
@param {string} [options.backText=""] - 背面文本
@param {boolean} [options.persistFormatting=true] - 保留格式
@param {number} [options.frontColor=-16777216] - 正面颜色
@param {number} [options.backColor=-16777216] - 背面颜色
@param {boolean} [options.clientOnly=false] - true=仅客户端显示(假木牌),不修改服务端NBT
@param {number} [options.customRuntimeId] - 自定义方块RuntimeId (clientOnly为true且原位置不是木牌时必填)
@param {boolean} [options.forceRefresh=true] - 是否发送假RuntimeId打破客户端缓存
@param {number} [options.dimid] - 维度ID
@returns {boolean} 是否成功
*/
export function updateSignText(players, x, y, z, options = {}) {
    try {
        const playerList = Array.isArray(players) ? players : [players];
        if (playerList.length === 0) return false;
        // 解构默认参数
        const {
            frontText = "", backText = "",
            persistFormatting = true,
            frontColor = -16777216, backColor = -16777216,
            clientOnly = false,
            forceRefresh = true,
            dimid = playerList[0].pos.dimid
        } = options;
        const pos = { x, y, z };
        const block = mc.getBlock(x, y, z, dimid);
        // 确定正确的 RuntimeId
        const correctRuntimeId = Minecraft.getBlockRuntimeId(block.type, block.tileData);
        const ownerName = playerList[0].realName || "";
        const nbt = block?.getBlockEntity() ? block.getBlockEntity().getNbt() : new NbtCompound();
        nbt.setTag("FrontText", buildSignTextNBT(frontText, ownerName, persistFormatting, frontColor));
        nbt.setTag("BackText", buildSignTextNBT(backText, ownerName, persistFormatting, backColor));
        nbt.setString("id", "Sign");
        nbt.setByte("isMovable", 1);
        nbt.setInt("x", x);
        nbt.setInt("y", y);
        nbt.setInt("z", z);
        if (!clientOnly && block) {
            block.getBlockEntity().setNbt(nbt);
        }
        // 准备打破缓存的假 RuntimeId
        const fakeRuntimeId = forceRefresh ? correctRuntimeId + 1 : null;
        // 向每个玩家发送数据包
        for (const player of playerList) {
            try {
                // 1. 发送假 RuntimeId 打破客户端缓存
                if (fakeRuntimeId !== null) {
                    sendUpdateBlockPacket(player, pos, fakeRuntimeId, 0, 3);
                }
                // 2. 发送正确的方块状态
                sendUpdateBlockPacket(player, pos, correctRuntimeId, 0, 3);
                // 3. 发送方块实体数据 (文本 NBT)
                if (!sendBlockActorDataPacket(player, pos, nbt)) {
                    throw new Error("发送 BlockActorDataPacket 失败");
                }
            } catch (e) {
                logger.error(`[SignAPI] 向玩家 ${player.realName} 发包错误: ${e}`);
                return false;
            }
        }
        return true;
    } catch (e) {
        logger.error(`[SignAPI] 更新木牌文本错误: ${e}`);
        return false;
    }
}
let fakeItemUniqueIdStart = 0x10000000
function getFakeItemUniqueId(fakeItemUniqueId) {
    if (mc.getEntity(fakeItemUniqueId)) {
        return getFakeItemUniqueId(fakeItemUniqueId + 1);
    } else {
        fakeItemUniqueIdStart = fakeItemUniqueId + 1;
        return fakeItemUniqueId;
    }
}


// ==========================================
// [使用示例]
// ==========================================

// mc.listen("onChat", (player, msg) => {
//     if (msg === "signtest") {
//         // 1. 获取玩家面前的坐标 (脚上一格)
//         let pos = player.blockPos;
//         let x = pos.x, y = pos.y + 1, z = pos.z;

//         // 2. 获取木牌的 RuntimeId (以橡木挂牌为例)

//         // 3. 调用虚拟发包函数
//         updateSignText(player, x, y, z, {
//             backText: "Back\n§l§b[TEST]\n§r§aHello World!",
//             frontText: "Front\n§l§b[TEST]\n§r§aBy Packet!",
//             clientOnly: true,
//         });

//         setTimeout(() => player.refreshChunks(), 2000); // 刷新区块,检测发包是否成功
//         return false; // 拦截这条聊天信息,不广播给其他人
//     }
// });





/**
 * 通过 物品对象 和 坐标 创建 添加掉落物实体 数据包
 * @type {(item: Item, pos: FloatPos) => {id: bigint, pkt: Packet}}
 * @warning 创建出来的物品最多在客户端存在 32.305833 分钟，需要每半小时发一次 SetActorData 数据包
 * @author 子沐呀 QQ 1756150362
 * @since 2026-07-27
 */
const createAddItemActorPacket = (() => {
    let mDecrementingID = 9223372036854775807n;
    return (item, pos) => {
        const id = --mDecrementingID;
        const stream = new BinaryStream();
        stream.writeVarInt64(id.toString()); // uniqueId
        stream.writeUnsignedVarInt64(id.toString()); // runtimeId
        stream.writeItem(item);
        stream.writeFloat(pos.x);
        stream.writeFloat(pos.y);
        stream.writeFloat(pos.z);
        stream.writeFloat(0);
        stream.writeFloat(0);
        stream.writeFloat(0);
        stream.writeUnsignedVarInt(3); // length
        stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
        stream.writeUnsignedVarInt(/* DataItemType::Short */1);
        stream.writeSignedShort(-32767);
        stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
        stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
        stream.writeBool(true);
        stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
        stream.writeUnsignedVarInt(/* DataItemType::String */4);
        stream.writeString("菲露露可爱捏~");
        stream.writeBool(false);
        return { id, pkt: stream.createPacket(/* MinecraftPacketIds::AddItemActor */15, true) }; // 开启raw，使用乱发模式OwO
    };
})();

/**
 * 创建 更新掉落物存在时间 数据包（也可以更新别的，自己玩）
* @type {(id: bigint) => Packet}
* 
* @author 子沐呀 QQ 1756150362
* @since 2026-07-27
*/
const createUpdateItemActorAgePacket = (() => {
    return (id) => {
        const stream = new BinaryStream();
        stream.writeUnsignedVarInt64(id.toString()); // runtimeId
        stream.writeUnsignedVarInt(3); // length
        stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
        stream.writeUnsignedVarInt(/* DataItemType::Short */1);
        stream.writeSignedShort(-32767);
        stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
        stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
        stream.writeBool(true);
        stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
        stream.writeUnsignedVarInt(/* DataItemType::String */4);
        stream.writeString("真可爱呀~");
        stream.writeUnsignedVarInt(0);
        stream.writeUnsignedVarInt(0);
        stream.writeUnsignedVarInt(0);
        return stream.createPacket(/* MinecraftPacketIds::SetActorData */39, true);
    };
})();

/**
 * 创建 删除实体 数据包
* @type {(id: bigint) => Packet}
* 
* @author 子沐呀 QQ 1756150362
* @since 2026-07-27
 */
const createRemoveItemActorPacket = (() => {
    return (id) => {
        const stream = new BinaryStream();
        stream.writeVarInt64(id.toString()); // uniqueId
        return stream.createPacket(/* MinecraftPacketIds::RemoveActor */14, true);
    }
})();
const item = mc.newItem("minecraft:apple", 64);
const { id, pkt } = createAddItemActorPacket(item, { x: 0, y: 104, z: 0 });
logger.warn(id.toString());
mc.getPlayer("ColdestCarp5592").sendPacket(pkt);
mc.getPlayer("ColdestCarp5592").sendPacket(createUpdateItemActorAgePacket(id));
mc.getPlayer("ColdestCarp5592").sendPacket(createRemoveItemActorPacket(id));
