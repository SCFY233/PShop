import { GMLIB_BinaryStream, Minecraft } from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js";
import { getAddPos, getItemInfo, getPosFromPosObj, getPosObjFromPos, getSameItemCount, ReplaceStr, getMaxCount, getItemDisplayName } from "./lib.js";
import { SignBlockMap, signtileDataMap, sideMap, lang, moneyname } from "../consts.js";
//鸣谢:子沐 Gemini 千问
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
    tag.setByte("IgnoreLighting", 1);
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
        if (!block) return false; 
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
 * 往 BinaryStream 中写入无符号变长 64 位整数 (VarInt64)
 * @param {BinaryStream} bs - LegacyScriptEngine 的二进制流对象
 * @param {BigInt|String|Number} uvalue - 要写入的 64 位无符号整数
 */
function writeUnsignedVarInt64ToStream(bs, uvalue) {
    let val = BigInt(uvalue);

    do {
        let next_byte = Number(val & 0x7Fn);
        val >>= 7n;
        if (val !== 0n) {
            next_byte |= 0x80;
        }
        // 调用 BinaryStream 对象的写入单字节方法
        bs.writeUnsignedChar(next_byte);

    } while (val !== 0n);
}
/**
 * 写入有符号变长 64 位整数 (VarInt64)
 * 采用 ZigZag 编码将有符号数映射为无符号数后写入
 * @param {BinaryStream} bs - LegacyScriptEngine 的二进制流对象
 * @param {BigInt|String|Number} ivalue - 要写入的 64 位有符号整数
 */
function writeVarInt64ToStream(bs, ivalue) {
    let val = BigInt(ivalue);

    // 1. 64 位有符号数的 ZigZag 编码
    // 公式: (val << 1) ^ (val >> 63)  [针对补码负数符号位扩展]
    let zigzag = (val << 1n) ^ (val >> 63n);

    // 2. 按照无符号 VarInt 逻辑写入
    do {
        let next_byte = Number(zigzag & 0x7Fn);
        zigzag >>= 7n;
        if (zigzag !== 0n) {
            next_byte |= 0x80;
        }
        bs.writeUnsignedChar(next_byte);
    } while (zigzag !== 0n);
}
export let mDecrementingID = 9223372036854775807n;
// /**
//  * 通过 物品对象 和 坐标 创建 添加掉落物实体 数据包
//  * @type {(item: Item, pos: FloatPos) => {id: bigint, pkt: Packet}}
//  * @warning 创建出来的物品最多在客户端存在 32.305833 分钟,需要每半小时发一次 SetActorData 数据包
//  * @author 子沐呀 QQ 1756150362
//  * @since 2026-07-27
//  */
// const createAddItemActorPacket = (() => {
//     return (item, pos) => {
//         const id = --mDecrementingID;
//         const stream = new GMLIB_BinaryStream();
//         stream.writePacketHeader(15)
//         writeVarInt64ToStream(stream, id.toString()); // uniqueId
//         writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
//         stream.writeItem(item);
//         stream.writeFloat(pos.x);
//         stream.writeFloat(pos.y);
//         stream.writeFloat(pos.z);
//         stream.writeFloat(0);
//         stream.writeFloat(0);
//         stream.writeFloat(0);
//         stream.writeUnsignedVarInt(3); // length
//         stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
//         stream.writeUnsignedVarInt(/* DataItemType::Short */1);
//         stream.writeSignedShort(-32767);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
//         stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
//         stream.writeBool(true);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
//         stream.writeUnsignedVarInt(/* DataItemType::String */4);
//         stream.writeString("菲露露可爱捏~");
//         stream.writeBool(false);
//         stream.sendTo(mc.getPlayer("ColdestCarp5592"))
//         return { id, }; // 开启raw,使用乱发模式OwO
//     };
// })();

// /**
//  * 创建 更新掉落物存在时间 数据包(也可以更新别的,自己玩)
// * @type {(id: bigint) => Packet}
// *
// * @author 子沐呀 QQ 1756150362
// * @since 2026-07-27
// */
// const createUpdateItemActorAgePacket = (() => {
//     return (id) => {
//         const stream = new BinaryStream();
//         writeUnsignedVarInt64ToStream(stream, id.toString()); // runtimeId
//         stream.writeUnsignedVarInt(3); // length
//         stream.writeUnsignedVarInt(/* ActorDataIDs::ClientEvent */24);
//         stream.writeUnsignedVarInt(/* DataItemType::Short */1);
//         stream.writeSignedShort(-32767);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::NametagAlwaysShow */81);
//         stream.writeUnsignedVarInt(/* DataItemType::Byte */0);
//         stream.writeBool(true);
//         stream.writeUnsignedVarInt(/* ActorDataIDs::Name */4);
//         stream.writeUnsignedVarInt(/* DataItemType::String */4);
//         stream.writeString("真可爱呀~");
//         stream.writeUnsignedVarInt(0);
//         stream.writeUnsignedVarInt(0);
//         stream.writeUnsignedVarInt(0);
//         return stream.createPacket(/* MinecraftPacketIds::SetActorData */39, true);
//     };
// })();

// /**
//  * 创建 删除实体 数据包
// * @type {(id: bigint) => Packet}
// *
// * @author 子沐呀 QQ 1756150362
// * @since 2026-07-27
//  */
// const createRemoveItemActorPacket = (() => {
//     return (id) => {
//         const stream = new BinaryStream();
//         writeVarInt64ToStream(stream, id.toString()); // uniqueId
//         return stream.createPacket(/* MinecraftPacketIds::RemoveActor */14, true);
//     }
// })();
// const item = mc.newItem("minecraft:bedrock", 64);
// const { id } = createAddItemActorPacket(item, { x: 0, y: 104, z: 0 });
// logger.warn(id.toString());
// mc.getPlayer("ColdestCarp5592").sendPacket(createUpdateItemActorAgePacket(id));
// // mc.getPlayer("ColdestCarp5592").sendPacket(createRemoveItemActorPacket(id));
/**
 * 木牌/假木牌实体类(完全复用现有发包与 NBT 函数)
 */
/**
 * 精简版 Sign 类(剔除大循环续期,改由 setText 手动推送更新)
 */
// /**
//  * @typedef {Object} SignOptions
//  * @property {string} [frontText=""] - 木牌正面显示的文本内容
//  * @property {string} [backText=""] - 木牌背面显示的文本内容
//  * @property {boolean} [persistFormatting=true] - 是否保留样式/颜色格式代码 (§)
//  * @property {number} [frontColor=-16777216] - 正面文本颜色 (ARGB 整数)
//  * @property {number} [backColor=-16777216] - 背面文本颜色 (ARGB 整数)
//  * @property {boolean} [clientOnly=true] - 是否仅客户端显示(假木牌,不修改服务端真实方块 NBT)
//  * @property {number} [visibleDistance=16] - 触发发包显示的玩家可视距离(单位:格)
//  * @property {number} [checkInterval=1000] - 玩家靠近/离开的定时检测间隔(毫秒)
//  */
// export class Sign {
//     /**
//      * 创建一个木牌对象
//      * @param {IntPos|{x: number, y: number, z: number, dimid?: number}} pos - 木牌的目标世界坐标
//      * @param {SignOptions} [options={}] - 木牌的配置项
//      */
//     constructor(pos, options = {}) {
//         this.pos = { x: pos.x, y: pos.y, z: pos.z, dimid: pos.dimid ?? 0 };
//         this.frontText = options.frontText ?? "";
//         this.backText = options.backText ?? "";
//         this.persistFormatting = options.persistFormatting ?? true;
//         this.frontColor = options.frontColor ?? -16777216;
//         this.backColor = options.backColor ?? -16777216;
//         this.clientOnly = options.clientOnly ?? true;
//         this.visibleDistance = options.visibleDistance ?? 16;
//         this.checkInterval = options.checkInterval ?? 1000;

//         this.activePlayers = new Set();
//         this._checkTimer = null;

//         if (!this.clientOnly) this._saveToServer();
//         this.start();
//     }

//     _getNbt(owner = "PShop") {
//         const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.pos.dimid);
//         const nbt = block?.getBlockEntity()?.getNbt() || new NbtCompound();
//         nbt.setTag("FrontText", buildSignTextNBT(this.frontText, owner, this.persistFormatting, this.frontColor));
//         nbt.setTag("BackText", buildSignTextNBT(this.backText, owner, this.persistFormatting, this.backColor));
//         nbt.setString("id", "Sign");
//         nbt.setByte("isMovable", 1);
//         nbt.setInt("x", this.pos.x); nbt.setInt("y", this.pos.y); nbt.setInt("z", this.pos.z);
//         return nbt;
//     }

//     _saveToServer() {
//         const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.pos.dimid);
//         if (block?.getBlockEntity()) block.getBlockEntity().setNbt(this._getNbt());
//     }

//     _sendPacket(player) {
//         if (!player) return;
//         const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.pos.dimid);
//         const rid = block ? Minecraft.getBlockRuntimeId(block.type, block.tileData) : 0;
//         sendUpdateBlockPacket(player, this.pos, rid + 1, 0, 3);
//         sendUpdateBlockPacket(player, this.pos, rid, 0, 3);
//         sendBlockActorDataPacket(player, this.pos, this._getNbt(player.realName || ""));
//     }

//     _restoreBlock(player) {
//         if (!player) return;
//         const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.pos.dimid);
//         if (!block) return;
//         const rid = Minecraft.getBlockRuntimeId(block.type, block.tileData);
//         sendUpdateBlockPacket(player, this.pos, rid + 1, 0, 3);
//         sendUpdateBlockPacket(player, this.pos, rid, 0, 3);
//         if (block.getBlockEntity()) sendBlockActorDataPacket(player, this.pos, block.getBlockEntity().getNbt());
//     }

//     _checkNearby() {
//         mc.getOnlinePlayers().forEach(pl => {
//             if (!pl) return;
//             const inRange = pl.pos.dimid === this.pos.dimid && pl.distanceTo(getPosFromPosObj(this.pos)) <= this.visibleDistance;
//             const hasPl = this.activePlayers.has(pl.uniqueId);

//             if (inRange && !hasPl) {
//                 this._sendPacket(pl);
//                 this.activePlayers.add(pl.uniqueId);
//             } else if (!inRange && hasPl) {
//                 if (this.clientOnly) this._restoreBlock(pl);
//                 this.activePlayers.delete(pl.uniqueId);
//             }
//         });
//     }

//     /** 手动触发并向当前处于范围内的玩家推送新文本 */
//     setText(front = "", back = "") {
//         this.frontText = front;
//         this.backText = back;
//         if (!this.clientOnly) this._saveToServer();

//         this.activePlayers.forEach(uuid => {
//             const pl = mc.getPlayer(uuid);
//             if (pl) this._sendPacket(pl);
//             else this.activePlayers.delete(uuid);
//         });
//     }

//     start() {
//         if (this._checkTimer) return;
//         this._checkNearby();
//         this._checkTimer = setInterval(() => this._checkNearby(), this.checkInterval);
//     }

//     destroy() {
//         if (this._checkTimer) clearInterval(this._checkTimer);
//         if (this.clientOnly) {
//             this.activePlayers.forEach(uuid => {
//                 const pl = mc.getPlayer(uuid);
//                 if (pl) this._restoreBlock(pl);
//             });
//         }
//         this.activePlayers.clear();
//     }
// }
/**
 * @description 掉落物实体数据包封装(支持单玩家,玩家数组,全员发送及 5min 自动续期,使用自定义物品名称与数量)
 * @author 子沐呀 是春风呀233 Gemini
 * @since 2026-07-27
 */


let globalDecrementingID = 9223372036854775807n;
// export class DropItem {
//     /**
//      * 创建一个假掉落物对象
//      * @param {Item} item 物品对象
//      * @param {FloatPos} pos 坐标
//      * @param {object} [options] 配置项
//      * @param {number} [options.visibleDistance=16] 玩家触发显示的距离(格)
//      * @param {number} [options.checkInterval=1000] 短循环:检测玩家进出的间隔(ms)
//      * @param {number} [options.renewInterval=300000] 大循环:给范围玩家发续期包的间隔(ms),默认5分钟
//      */
//     constructor(item, pos, options = {}) {
//         this.id = --globalDecrementingID;
//         this.item = item;
//         this.pos = pos;
//         this.displayName = getItemDisplayName(item);

//         this.visibleDistance = options.visibleDistance || 16;
//         this.checkInterval = options.checkInterval || 1000;
//         this.renewInterval = options.renewInterval || 5 * 60 * 1000; // 默认 5 分钟

//         // 维护当前能看见该掉落物的玩家集合 (Set<Player>)
//         this.activePlayers = new Set();

//         this._checkTimer = null;
//         this._renewTimer = null;
//         // 实例化即开启双循环机制
//         this.start()
//     }

//     /**
//      * 严格还原原版的 AddItemActor (ID: 15) 数据包构建
//      * @private
//      */
//     _buildAddPacketStream() {
//         const stream = new GMLIB_BinaryStream();

//         // 1. Packet Header
//         stream.writePacketHeader(15);

//         // 2. ID 写入
//         writeVarInt64ToStream(stream, this.id.toString()); // uniqueId
//         writeUnsignedVarInt64ToStream(stream, this.id.toString()); // runtimeId

//         // 3. 物品对象
//         stream.writeItem(this.item);

//         // 4. 坐标
//         stream.writeFloat(this.pos.x);
//         stream.writeFloat(this.pos.y);
//         stream.writeFloat(this.pos.z);

//         // 5. 速度 Motion (X, Y, Z)
//         stream.writeFloat(0);
//         stream.writeFloat(0);
//         stream.writeFloat(0);

//         // 6. 属性 Metadata / ActorData (严格按照原代码顺序)
//         stream.writeUnsignedVarInt(3); // Metadata 数量: 3

//         // --- 属性 1: ClientEvent ---
//         stream.writeUnsignedVarInt(24); // ActorDataIDs::ClientEvent
//         stream.writeUnsignedVarInt(1);  // DataItemType::Short
//         stream.writeSignedShort(32767);

//         // --- 属性 2: NametagAlwaysShow ---
//         stream.writeUnsignedVarInt(81); // ActorDataIDs::NametagAlwaysShow
//         stream.writeUnsignedVarInt(0);  // DataItemType::Byte
//         stream.writeBool(true);

//         // --- 属性 3: Name ---
//         stream.writeUnsignedVarInt(4);  // ActorDataIDs::Name
//         stream.writeUnsignedVarInt(4);  // DataItemType::String
//         stream.writeString(this.displayName);

//         // 7. 末尾标记 (与原版完全一致)
//         stream.writeBool(false);

//         return stream;
//     }

//     /**
//      * 严格还原原版的 RemoveActor (ID: 14) 数据包构建
//      * @private
//      */
//     _buildRemovePacketStream() {
//         const stream = new GMLIB_BinaryStream();
//         stream.writePacketHeader(14); // RemoveActor 数据包
//         writeVarInt64ToStream(stream, this.id.toString()); // uniqueId
//         return stream;
//     }

//     /**
//      * 给指定玩家发生成包
//      * @private
//      */
//     _sendSpawnPacket(player) {
//         if (!player) return;
//         const stream = this._buildAddPacketStream();
//         stream.sendTo(player);
//     }

//     /**
//      * 给指定玩家发移除包
//      * @private
//      */
//     _sendRemovePacket(player) {
//         if (!player) return;
//         const stream = this._buildRemovePacketStream();
//         stream.sendTo(player);
//     }

//     /**
//      * [短循环]检测周围玩家:靠近则发初始包加入大循环;远离则发移除包并剔除
//      * @private
//      */
//     _checkNearbyPlayers() {
//         const allOnline = mc.getOnlinePlayers();
//         allOnline.forEach(player => {
//             if (!player || player.pos.dimid !== this.pos.dimid) {
//                 // 异维度玩家如果之前在列表中,剔除并发移除包
//                 if (this.activePlayers.has(player.uniqueId)) {
//                     this._sendRemovePacket(player);
//                     this.activePlayers.delete(player.uniqueId);
//                 }
//                 return;
//             }
//             if (player.pos.dimid == this.pos.dimid && player.distanceTo(getPosFromPosObjthis.pos) <= this.visibleDistance) {
//                 // 靠近:如果还没在 activePlayers 里,发初始包并加入大循环数组
//                 if (!this.activePlayers.has(player.uniqueId)) {
//                     this._sendRemovePacket(player); // 防重发先刷掉
//                     this._sendSpawnPacket(player);
//                     this.activePlayers.add(player.uniqueId);
//                 }
//             } else {
//                 // 远离:如果在 activePlayers 里,发移除包并剔除
//                 if (this.activePlayers.has(player.uniqueId)) {
//                     this._sendRemovePacket(player);
//                     this.activePlayers.delete(player.uniqueId);
//                 }
//             }
//         });
//     }

//     /**
//      * [大循环]为当前已在附近的 activePlayers 定期刷新续期包
//      * @private
//      */
//     _renewForActivePlayers() {
//         if (this.activePlayers.size === 0) return;

//         this.activePlayers.forEach(player => {
//             const pl = mc.getPlayer(player);
//             if (pl) {
//                 // 先删后发,完成客户端假掉落物续期
//                 this._sendRemovePacket(pl);
//                 this._sendSpawnPacket(pl);
//             } else {
//                 // 清除离线玩家
//                 this.activePlayers.delete(player);
//             }
//         });
//     }

//     /**
//      * 启动定时任务
//      */
//     start() {
//         if (this._checkTimer || this._renewTimer) return;

//         // 1. 立即执行一次短循环检测
//         this._checkNearbyPlayers();

//         // 2. 短循环:持续检测附近进入/离开的玩家
//         this._checkTimer = setInterval(() => {
//             this._checkNearbyPlayers();
//         }, this.checkInterval);

//         // 3. 大循环:对留在 activePlayers 里的玩家批量续期
//         this._renewTimer = setInterval(() => {
//             this._renewForActivePlayers();
//         }, this.renewInterval);
//     }

//     /**
//      * 彻底销毁这个假掉落物实体
//      */
//     destroy() {
//         // 停止循环
//         if (this._checkTimer) {
//             clearInterval(this._checkTimer);
//             this._checkTimer = null;
//         }
//         if (this._renewTimer) {
//             clearInterval(this._renewTimer);
//             this._renewTimer = null;
//         }

//         // 给所有能看到的玩家发移除包
//         this.activePlayers.forEach(player => {
//             const pl = mc.getPlayer(player);
//             if (pl) {
//                 this._sendRemovePacket(pl);
//             }
//         });

//         // 清空玩家数组
//         this.activePlayers.clear();
//     }
// }
export function getItemChestFloatPosFromIntPos({ x, y, z, dimid }) {
    return new FloatPos(x + 0.5, y + 0.85, z + 0.5, dimid)
}
// const testitem1 = mc.newItem("apple", 1)
// testitem1.setDisplayName("114514")
// const testitem2 = mc.newItem("bedrock", 1)
// const fakeDrop = new DropItem(testitem1, getItemChestFloatPosFromIntPos({ x: 0, y: 106, z: 0, dimid: 0 }), {
//     visibleDistance: 12,    // 玩家距离 12 格以内才显示
//     checkInterval: 2000,    // 每 1 秒检测一次附近玩家(短循环)
//     renewInterval: 280000   // 每 4 分钟对范围内的玩家续期一次发包(大循环)
// });
function formatSignLine(line) {
    if (!line) return '';
    const chars = Array.from(line);
    let hasWide = false;

    // 检测是否包含全角字符（中文、全角标点等）
    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '§' || chars[i] === '&') { i++; continue; }
        if (chars[i].charCodeAt(0) > 255) { hasWide = true; break; }
    }

    const maxW = hasWide ? 241 : 90;
    const halfW = hasWide ? 114 : 42;
    const tokens = [];
    let totalWidth = 0;

    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '§' || chars[i] === '&') {
            tokens.push({ t: chars[i] + (chars[i + 1] || ''), w: 0 });
            i++;
        } else {
            const c = chars[i];
            const w = hasWide
                ? (c.charCodeAt(0) > 255 ? 22 : "!.,:;'i|lI".includes(c) ? 4 : "mwMW".includes(c) ? 15 : 11)
                : ("!.,:;'|i".includes(c) ? 2 : "l`".includes(c) ? 3 : " \"()*I[]t{}".includes(c) ? 4 : "<>fk".includes(c) ? 5 : "@~".includes(c) ? 7 : 6);
            tokens.push({ t: c, w });
            totalWidth += w;
        }
    }

    if (totalWidth <= maxW) return tokens.map(x => x.t).join('');

    let left = "", right = "", lw = 0, rw = 0;
    for (let i = 0; i < tokens.length && lw + tokens[i].w <= halfW; i++) {
        left += tokens[i].t;
        lw += tokens[i].w;
    }
    for (let i = tokens.length - 1; i >= 0 && rw + tokens[i].w <= halfW; i--) {
        right = tokens[i].t + right;
        rw += tokens[i].w;
    }

    return left + "..." + right;
}

/**
 * @typedef {Object} ChestShopOptions
 * @property {string} [frontText=""] - 木牌正面显示的文本内容
 * @property {string} [backText=""] - 木牌背面显示的文本内容
 * @property {boolean} [persistFormatting=true] - 是否保留样式/颜色格式代码 (§)
 * @property {number} [frontColor=-16777216] - 正面文本颜色 (ARGB 整数)
 * @property {number} [backColor=-16777216] - 背面文本颜色 (ARGB 整数)
 * @property {boolean} [clientOnly=false] - 是否仅客户端显示(假木牌,不修改服务端真实方块 NBT)
 * @property {number} [visibleDistance=32] - 触发发包显示的玩家可视距离(单位:格)
 * @property {number} [checkInterval=1500] - 玩家靠近/离开的定时检测间隔(毫秒)
 * @property {number} [renewInterval=300000] - 假掉落物大循环续期发包的间隔(ms),默认5分钟
 */
export class ChestShop {
    /**
     * 创建一个箱子商店对象(合并假木牌与假掉落物)
     * @param {IntPos|{x: number, y: number, z: number, dimid?: number}} chestPos - 商店箱子的中心坐标(用于判定玩家距离)
     * @param {Item} item - 商店展示的掉落物对象
     * @param {ChestShopOptions} [options={}] - 配置项
     */
    constructor(chestPos, item, options = {}) {
        this.side = sideMap[options.side] ?? "north"
        this.chestPos = getPosFromPosObj(chestPos);
        this.signPos = getAddPos(this.chestPos, SignBlockMap[this.side])
        this.dropItemPos = getItemChestFloatPosFromIntPos(this.chestPos);
        this.money = options.money
        this.owner = options.owner

        this.isSystem = options.isSystem ?? false
        this.type = options.type ?? "sell"

        this.id = --globalDecrementingID;
        this.item = mc.newItem(NBT.parseSNBT(item).setByte("Count", 1));
        this.displayName = getItemDisplayName(this.item);
        this.ownerName = this.isSystem ? lang.get("chestshop.system") : data.fromUuid(this.owner)?.name ?? "???",
        this.frontText = options.frontText ?? "";
        this.backText = options.backText ?? "";
        this.persistFormatting = options.persistFormatting ?? true;
        this.frontColor = options.frontColor ?? -16777216;
        this.backColor = options.backColor ?? -16777216;
        this.clientOnly = options.clientOnly ?? false;
        this.showItem = options.showItem ?? true
        this.visibleDistance = options.visibleDistance || 32;
        this.checkInterval = options.checkInterval || 1500;
        this.renewInterval = options.renewInterval || 5 * 60 * 1000;
        this.allowHopperPush = options.allowHopperPush ?? false
        this.allowHopperSearch = options.allowHopperSearch ?? false

        this.activePlayers = new Set();
        this._checkTimer = null;
        this._renewTimer = null;

        if (!this.clientOnly) this._saveSignToServer();
        this.start();
    }

    // ======================== 告示牌原本逻辑 ========================

    _getSignNbt(owner = "PShop") {
        const block = mc.getBlock(this.signPos.x, this.signPos.y, this.signPos.z, this.signPos.dimid);
        const nbt = block?.getBlockEntity()?.getNbt() || new NbtCompound();
        nbt.setTag("FrontText", buildSignTextNBT(this.frontText, owner, this.persistFormatting, this.frontColor));
        nbt.setTag("BackText", buildSignTextNBT(this.backText, owner, this.persistFormatting, this.backColor));
        nbt.setString("id", "Sign");
        nbt.setInt("x", this.signPos.x); nbt.setInt("y", this.signPos.y); nbt.setInt("z", this.signPos.z);
        return nbt;
    }

    _saveSignToServer() {
        const block = mc.getBlock(this.signPos.x, this.signPos.y, this.signPos.z, this.signPos.dimid);
        if (block?.getBlockEntity()) block.getBlockEntity().setNbt(this._getSignNbt());
    }

    _sendSignPacket(player) {
        if (!player) return;
        const block = mc.getBlock(this.signPos.x, this.signPos.y, this.signPos.z, this.signPos.dimid);
        const rid = block ? Minecraft.getBlockRuntimeId(block.type, block.tileData) : 0;
        sendUpdateBlockPacket(player, this.signPos, rid + 1, 0, 3);
        sendUpdateBlockPacket(player, this.signPos, rid, 0, 3);
        sendBlockActorDataPacket(player, this.signPos, this._getSignNbt(player.realName || ""));
    }

    _restoreSignBlock(player) {
        if (!player) return;
        const block = mc.getBlock(this.signPos.x, this.signPos.y, this.signPos.z, this.signPos.dimid);
        if (!block) return;
        const rid = Minecraft.getBlockRuntimeId(block.type, block.tileData);
        sendUpdateBlockPacket(player, this.signPos, rid + 1, 0, 3);
        sendUpdateBlockPacket(player, this.signPos, rid, 0, 3);
        if (block.getBlockEntity()) sendBlockActorDataPacket(player, this.signPos, block.getBlockEntity().getNbt());
    }

    /** 告示牌:手动触发并向当前处于范围内的玩家推送新文本 */
    setSignText(front = "", back = "") {
        this.frontText = front;
        this.backText = back;
        if (!this.clientOnly) this._saveSignToServer();

        this.activePlayers.forEach(uuid => {
            const pl = mc.getPlayer(uuid);
            if (pl) this._sendSignPacket(pl);
            else this.activePlayers.delete(uuid);
        });
    }

    // ======================== 假掉落物原本逻辑 ========================

    _buildAddPacketStream() {
        const stream = new GMLIB_BinaryStream();
        stream.writePacketHeader(15);
        writeVarInt64ToStream(stream, this.id.toString());
        writeUnsignedVarInt64ToStream(stream, this.id.toString());
        stream.writeItem(this.item);

        stream.writeFloat(this.dropItemPos.x);
        stream.writeFloat(this.dropItemPos.y);
        stream.writeFloat(this.dropItemPos.z);

        stream.writeFloat(0);
        stream.writeFloat(0);
        stream.writeFloat(0);

        stream.writeUnsignedVarInt(3);
        stream.writeUnsignedVarInt(24);
        stream.writeUnsignedVarInt(1);
        stream.writeSignedShort(32767);
        stream.writeUnsignedVarInt(81);
        stream.writeUnsignedVarInt(0);
        stream.writeBool(true);
        stream.writeUnsignedVarInt(4);
        stream.writeUnsignedVarInt(4);
        stream.writeString(this.displayName);
        stream.writeBool(false);

        return stream;
    }

    _buildRemovePacketStream() {
        const stream = new GMLIB_BinaryStream();
        stream.writePacketHeader(14);
        writeVarInt64ToStream(stream, this.id.toString());
        return stream;
    }

    _sendSpawnPacket(player) {
        if (!player) return;
        const stream = this._buildAddPacketStream();
        stream.sendTo(player);
    }

    _sendRemovePacket(player) {
        if (!player) return;
        const stream = this._buildRemovePacketStream();
        stream.sendTo(player);
    }

    // ======================== 合并与复用的循环逻辑 ========================

    /**
     * [短循环]检测周围玩家进出(合并 DropItem 和 Sign 的判定逻辑)
     */
    _checkNearbyPlayers() {
        const allOnline = mc.getOnlinePlayers();
        allOnline.forEach(player => {
            if (!player || player.pos.dimid !== this.chestPos.dimid) {
            // 异维度玩家如果之前在列表中,剔除并发移除包
                if (this.activePlayers.has(player.uniqueId)) {
                    this._sendRemovePacket(player); // 掉落物发移除包
                    if (this.clientOnly) this._restoreSignBlock(player); // 木牌恢复本体
                    this.activePlayers.delete(player.uniqueId);
                }
                return;
            }
            // 使用 chestPos 作为基准点计算距离
            const inRange = player.distanceTo(getPosFromPosObj(this.chestPos)) <= this.visibleDistance;
            const hasPl = this.activePlayers.has(player.uniqueId);
            if (inRange && !hasPl) {
                // 靠近:如果还没在 activePlayers 里,发包并加入大循环
                this._sendRemovePacket(player); // 防重发先刷掉假掉落物
                if (this.showItem) {
                    this._sendSpawnPacket(player);  // 生成假掉落物
                }
                this._sendSignPacket(player);   // 生成假木牌数据
                this.updatesign()
                this.activePlayers.add(player.uniqueId);
            } else if (!inRange && hasPl) {
                // 远离:如果在 activePlayers 里,发移除包并剔除
                this._sendRemovePacket(player); // 移除假掉落物
                if (this.clientOnly) this._restoreSignBlock(player); // 恢复本体木牌
                this.activePlayers.delete(player.uniqueId);
            }
        });
    }

    /**
     * [大循环]为当前已在附近的 activePlayers 定期刷新掉落物续期包
     */
    _renewForActivePlayers() {
        if (this.activePlayers.size === 0) return;

        this.activePlayers.forEach(uuid => {
            const pl = mc.getPlayer(uuid);
            if (pl) {
                // 先删后发,完成客户端假掉落物续期 (木牌不需要大循环续期)
                if (this.showItem) {
                    this._sendRemovePacket(pl);
                    this._sendSpawnPacket(pl);
                }
                this.updatesign()
            } else {
                // 清除离线玩家
                this.activePlayers.delete(uuid);
            }
        });
    }
    getItemCountinChest() {
        if (this.isSystem) {
            return lang.get("chestshop.infinite");
        }
        const block = mc.getBlock(this.chestPos.x, this.chestPos.y, this.chestPos.z, this.chestPos.dimid);
        if (!block) return 0
        const chest = block.getContainer()
        if (!chest) return 0
        return getSameItemCount(chest.getAllItems(), this.item)
    }
    updatesign() {
        const count = this.getItemCountinChest()
        const ct = mc.getBlock(this.chestPos.x, this.chestPos.y, this.chestPos.z, this.chestPos.dimid)?.getContainer()
        if (ct == null) return
        const maxCount = getMaxCount(ct, this.item)
        const lines = lang.gets(["chestshop.sign.line1", "chestshop.sign.line2", "chestshop.sign.line3", "chestshop.sign.line4"])
        if (count == 0 && this.type == "sell") lines[1] = lang.get("chestshop.sign.line2.null")
        if (count == maxCount && this.type == "buy") lines[1] = lang.get("chestshop.sign.line2.full")
        let action = ""
        switch (this.type) {
            case "buy":
                action = lang.get("chestshop.action.buy")
                break
            default:
                action = lang.get("chestshop.action.sell")
                break
        }
        if (mc.getBlock(this.signPos)?.isAir) mc.setBlock(this.signPos, "minecraft:wall_sign", signtileDataMap[this.side])
        const displayCount = this.isSystem ? count : (this.type == "sell" ? count : maxCount - count);
        this.setSignText(lines.map(line => formatSignLine(ReplaceStr(line, {
            count: displayCount,
            plname: this.ownerName,
            money: this.money,
            moneyname,
            itemname: this.displayName,
            action,
        }))).join("\n"))
    }
    /**
     * 启动定时任务
     */
    start() {
        if (this._checkTimer || this._renewTimer) return;

        // 立即执行一次短循环检测
        this._checkNearbyPlayers();
        // 短循环:持续检测附近进入/离开的玩家
        this._checkTimer = setInterval(() => {
            this._checkNearbyPlayers();
        }, this.checkInterval);

        // 大循环:对留在 activePlayers 里的玩家进行掉落物续期
        this._renewTimer = setInterval(() => {
            this._renewForActivePlayers();
        }, this.renewInterval);
        if (this.activePlayers.size > 0) this.updatesign()
    }

    /**
     * 彻底销毁这个商店对象实体
     */
    destroy() {
        // 停止循环
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
            this._checkTimer = null;
        }
        if (this._renewTimer) {
            clearInterval(this._renewTimer);
            this._renewTimer = null;
        }

        // 给所有能看到的玩家发移除包 & 还原木牌
        this.activePlayers.forEach(uuid => {
            const pl = mc.getPlayer(uuid);
            if (pl) {
                this._sendRemovePacket(pl); // 掉落物
                if (this.clientOnly) this._restoreSignBlock(pl); // 木牌
            }
        });

        // 清空玩家数组
        this.activePlayers.clear();
    }
}



/**
 * 向指定玩家发送仅其自己可见的客户端声音 (数据包 ID 86)
 * 
 * @param {Player} player - LLSE 的玩家对象
 * @param {Object} [sound] - 声音配置对象
 * @param {string} sound.sound - 基岩版声音事件名称，如 'note.harp', 'random.levelup'
 * @param {number} [sound.volume=1.0] - 音量 (大于 1.0 通常会增加传播距离，但因为是发给个人，主要影响响度)
 * @param {number} [sound.pitch=1.0] - 音高 (通常范围 0.0 ~ 2.0，1.0为原音)
 * @param {IntPos|FloatPos|{x: number, y: number, z: number}} [options.pos] - 声音发出的 3D 坐标 {x, y, z}。如果不传，则默认在玩家头部位置播放
 * @returns {boolean} 是否发送成功
 */
export function playClientSound(player, sound = { sound: "114514", volume: 1.0, pitch: 1.0 }, options = {}) {
    if (!player || !player.sendPacket) {
        return false;
    }
    // 解析配置参数，设定默认值
    const pos = options.pos || {
        x: player.pos.x,
        y: player.pos.y + 0.37, // 默认在玩家头部/耳边播放
        z: player.pos.z
    };
    const volume = options.volume !== undefined ? options.volume : 1.0;
    const pitch = options.pitch !== undefined ? options.pitch : 1.0;
    const bs = new BinaryStream();
    // 1. 写入声音名称
    bs.writeString(sound.sound);

    // 2. 写入坐标 (基岩版发声坐标精度为 1/8)
    bs.writeVarInt(Math.round(pos.x * 8));
    bs.writeUnsignedVarInt(Math.round(pos.y * 8));
    bs.writeVarInt(Math.round(pos.z * 8));

    // 3. 写入音量和音高
    bs.writeFloat(volume);
    bs.writeFloat(pitch);

    // 4. 创建 ID 为 86 的 PlaySoundPacket 并发送
    const packet = bs.createPacket(86);
    return player.sendPacket(packet);

}

/**
 * 尝试通过 ContainerClosePacket (47) 清空 UI
 * 
 * @param {Player} player - 目标玩家对象
 * @returns {boolean} 是否发送成功
 */
export function closeChatByContainer(player) {
    if (!player || !player.sendPacket) return false;

    try {
        const bs = new BinaryStream();

        // 写入 Window ID: 0 通常代表玩家的物品栏/背包，也可以尝试传入 -1 或 255
        bs.writeByte(0);
        // 写入是否由服务端主导关闭 (Server-side)
        bs.writeBool(true);

        // ContainerClosePacket 的数据包 ID 为 47
        return player.sendPacket(bs.createPacket(47));
    } catch (e) {
        logger.error(`[PacketAPI] 发送 ContainerClosePacket 错误: ${e}`);
        return false;
    }
}