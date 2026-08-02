import { GMLIB_BinaryStream, Minecraft } from "../../../GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.js";
import { getItemInfo } from "./lib.js";
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
    tag.setByte("IgnoreLighting", 0);
    tag.setByte("PersistFormatting", persistFormatting ? 1 : 0);
    tag.setInt("SignTextColor", color);
    tag.setString("Text", text);
    tag.setString("TextOwner", owner);
    return tag;
}
// // ==========================================
// // 核心 API
// // ==========================================
// /**
// 更新木牌文本 (支持真实修改与虚拟发包)
// @param {Player|Player[]} players - 目标玩家(数组)
// @param {number} x - X 坐标
// @param {number} y - Y 坐标
// @param {number} z - Z 坐标
// @param {Object} [options] - 配置项
// @param {string} [options.frontText=""] - 正面文本
// @param {string} [options.backText=""] - 背面文本
// @param {boolean} [options.persistFormatting=true] - 保留格式
// @param {number} [options.frontColor=-16777216] - 正面颜色
// @param {number} [options.backColor=-16777216] - 背面颜色
// @param {boolean} [options.clientOnly=false] - true=仅客户端显示(假木牌),不修改服务端NBT
// @param {number} [options.customRuntimeId] - 自定义方块RuntimeId (clientOnly为true且原位置不是木牌时必填)
// @param {boolean} [options.forceRefresh=true] - 是否发送假RuntimeId打破客户端缓存
// @param {number} [options.dimid] - 维度ID
// @returns {boolean} 是否成功
// */
// export function updateSignText(players, x, y, z, options = {}) {
//     try {
//         const playerList = Array.isArray(players) ? players : [players];
//         if (playerList.length === 0) return false;
//         // 解构默认参数
//         const {
//             frontText = "", backText = "",
//             persistFormatting = true,
//             frontColor = -16777216, backColor = -16777216,
//             clientOnly = false,
//             forceRefresh = true,
//             dimid = playerList[0].pos.dimid
//         } = options;
//         const pos = { x, y, z };
//         const block = mc.getBlock(x, y, z, dimid);
//         // 确定正确的 RuntimeId
//         const correctRuntimeId = Minecraft.getBlockRuntimeId(block.type, block.tileData);
//         const ownerName = playerList[0].realName || "";
//         const nbt = block?.getBlockEntity() ? block.getBlockEntity().getNbt() : new NbtCompound();
//         nbt.setTag("FrontText", buildSignTextNBT(frontText, ownerName, persistFormatting, frontColor));
//         nbt.setTag("BackText", buildSignTextNBT(backText, ownerName, persistFormatting, backColor));
//         nbt.setString("id", "Sign");
//         nbt.setByte("isMovable", 1);
//         nbt.setInt("x", x);
//         nbt.setInt("y", y);
//         nbt.setInt("z", z);
//         if (!clientOnly && block) {
//             block.getBlockEntity().setNbt(nbt);
//         }
//         // 准备打破缓存的假 RuntimeId
//         const fakeRuntimeId = forceRefresh ? correctRuntimeId + 1 : null;
//         // 向每个玩家发送数据包
//         for (const player of playerList) {
//             try {
//                 // 1. 发送假 RuntimeId 打破客户端缓存
//                 if (fakeRuntimeId !== null) {
//                     sendUpdateBlockPacket(player, pos, fakeRuntimeId, 0, 3);
//                 }
//                 // 2. 发送正确的方块状态
//                 sendUpdateBlockPacket(player, pos, correctRuntimeId, 0, 3);
//                 // 3. 发送方块实体数据 (文本 NBT)
//                 if (!sendBlockActorDataPacket(player, pos, nbt)) {
//                     throw new Error("发送 BlockActorDataPacket 失败");
//                 }
//             } catch (e) {
//                 logger.error(`[SignAPI] 向玩家 ${player.realName} 发包错误: ${e}`);
//                 return false;
//             }
//         }
//         return true;
//     } catch (e) {
//         logger.error(`[SignAPI] 更新木牌文本错误: ${e}`);
//         return false;
//     }
// }
/**
 * @file SignBlock.js
 * @description 假/真木牌方块实体对象（支持玩家动态进出广播、客户端缓存打破与周期发包续期）
 * @author 子沐呀 是春风呀233
 * @since 2026-07-27
 */

export class SignBlock {
    /**
     * 创建一个木牌方块控制对象
     * @param {IntPos|Object} pos 方块坐标 { x, y, z, dimid }
     * @param {Object} [options] 配置项
     * @param {string} [options.frontText=""] - 正面文本
     * @param {string} [options.backText=""] - 背面文本
     * @param {boolean} [options.persistFormatting=true] - 保留格式 (§)
     * @param {number} [options.frontColor=-16777216] - 正面颜色 (ARGB)
     * @param {number} [options.backColor=-16777216] - 背面颜色 (ARGB)
     * @param {boolean} [options.clientOnly=true] - true=仅客户端发包显示(假木牌); false=修改服务端物理NBT
     * @param {boolean} [options.forceRefresh=true] - 发送假RuntimeId打破客户端缓存
     * @param {number} [options.visibleDistance=32] - 玩家触发显示的距离（格）
     * @param {number} [options.checkInterval=1000] - 短循环：检测玩家进出视距的间隔(ms)
     * @param {number} [options.renewInterval=240000] - 大循环：已在视距内玩家的自动刷包续期间隔(ms)
     */
    constructor(pos, options = {}) {
        this.pos = { x: pos.x, y: pos.y, z: pos.z };
        this.dimid = pos.dimid ?? 0;

        // 文本与样式配置
        this.frontText = options.frontText ?? "";
        this.backText = options.backText ?? "";
        this.persistFormatting = options.persistFormatting ?? true;
        this.frontColor = options.frontColor ?? -16777216;
        this.backColor = options.backColor ?? -16777216;

        // 运行参数
        this.clientOnly = options.clientOnly ?? true;
        this.forceRefresh = options.forceRefresh ?? true;
        this.visibleDistance = options.visibleDistance ?? 32;
        this.checkInterval = options.checkInterval ?? 1000;
        this.renewInterval = options.renewInterval ?? 4 * 60 * 1000;

        // 维护当前视距内已发包的玩家 Set (存储 player.uniqueId)
        this.activePlayers = new Set();

        this._checkTimer = null;
        this._renewTimer = null;

        // 初始化服务端真实 NBT (如果非 clientOnly)
        if (!this.clientOnly) {
            this._applyServerNBT();
        }

        // 实例化即开启双循环机制
        this.start();
    }

    /**
     * 构建当前木牌的 NBT 数据结构
     * @private
     */
    _buildNBT(ownerName = "PShop") {
        const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.dimid);
        const nbt = block?.getBlockEntity() ? block.getBlockEntity().getNbt() : new NbtCompound();

        nbt.setTag("FrontText", buildSignTextNBT(this.frontText, ownerName, this.persistFormatting, this.frontColor));
        nbt.setTag("BackText", buildSignTextNBT(this.backText, ownerName, this.persistFormatting, this.backColor));
        nbt.setString("id", "Sign");
        nbt.setByte("isMovable", 1);
        nbt.setInt("x", this.pos.x);
        nbt.setInt("y", this.pos.y);
        nbt.setInt("z", this.pos.z);

        return nbt;
    }

    /**
     * 同步更新服务端物理方块 NBT
     * @private
     */
    _applyServerNBT() {
        try {
            const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.dimid);
            if (block && block.getBlockEntity()) {
                const nbt = this._buildNBT();
                block.getBlockEntity().setNbt(nbt);
            }
        } catch (e) {
            logger.error(`[SignBlock] 更新服务端 NBT 失败: ${e}`);
        }
    }

    /**
     * 给单个玩家发送完整的木牌更新数据包序列
     * @private
     */
    _sendSignPacket(player) {
        if (!player) return;
        try {
            const block = mc.getBlock(this.pos.x, this.pos.y, this.pos.z, this.dimid);
            if (!block) return;

            const correctRuntimeId = Minecraft.getBlockRuntimeId(block.type, block.tileData);
            const fakeRuntimeId = this.forceRefresh ? correctRuntimeId + 1 : null;
            const nbt = this._buildNBT(player.realName || "PShop");

            // 1. 发送假 RuntimeId 打破客户端方块缓存
            if (fakeRuntimeId !== null) {
                sendUpdateBlockPacket(player, this.pos, fakeRuntimeId, 0, 3);
            }
            // 2. 发送正确的方块状态
            sendUpdateBlockPacket(player, this.pos, correctRuntimeId, 0, 3);
            // 3. 发送方块实体 NBT 数据
            sendBlockActorDataPacket(player, this.pos, nbt);
        } catch (e) {
            logger.error(`[SignBlock] 向玩家 ${player.realName} 发送木牌包失败: ${e}`);
        }
    }

    /**
     * 动态更新木牌文本内容并自动刷包
     * @param {string} frontText 正面文本
     * @param {string} [backText] 背面文本
     */
    updateText(frontText, backText = this.backText) {
        this.frontText = frontText;
        this.backText = backText;

        // 如果影响物理服务端则同步更新
        if (!this.clientOnly) {
            this._applyServerNBT();
        }

        // 立即向当前处于激活范围内的所有玩家推送新文本数据包
        this.activePlayers.forEach(uid => {
            const player = mc.getPlayer(uid);
            if (player) {
                this._sendSignPacket(player);
            } else {
                this.activePlayers.delete(uid);
            }
        });
    }

    /**
     * 【短循环】检测周围玩家视距：靠近则发包入队；远离则移除标记
     * @private
     */
    _checkNearbyPlayers() {
        const allOnline = mc.getOnlinePlayers();
        allOnline.forEach(player => {
            if (!player || player.pos.dimid !== this.dimid) {
                // 异维度玩家剔除
                if (this.activePlayers.has(player.uniqueId)) {
                    this.activePlayers.delete(player.uniqueId);
                }
                return;
            }

            // 判断玩家距离
            if (player.distanceTo(this.pos) <= this.visibleDistance) {
                // 靠近：如果还没在 activePlayers 里，发包并记录
                if (!this.activePlayers.has(player.uniqueId)) {
                    this._sendSignPacket(player);
                    this.activePlayers.add(player.uniqueId);
                }
            } else {
                // 远离：剔除（无需发销毁包，离开视距客户端自动清理）
                if (this.activePlayers.has(player.uniqueId)) {
                    this.activePlayers.delete(player.uniqueId);
                }
            }
        });
    }

    /**
     * 【大循环】为当前已在附近的 activePlayers 定期重刷续期包，防止区块重载/同步丢失
     * @private
     */
    _renewForActivePlayers() {
        if (this.activePlayers.size === 0) return;

        this.activePlayers.forEach(uid => {
            const player = mc.getPlayer(uid);
            if (player) {
                this._sendSignPacket(player);
            } else {
                // 清理已离线玩家
                this.activePlayers.delete(uid);
            }
        });
    }

    /**
     * 启动定时任务
     */
    start() {
        if (this._checkTimer || this._renewTimer) return;

        // 1. 立即执行一次短循环检测
        this._checkNearbyPlayers();

        // 2. 短循环：持续检测附近进入/离开视距的玩家
        this._checkTimer = setInterval(() => {
            this._checkNearbyPlayers();
        }, this.checkInterval);

        // 3. 大循环：对在 activePlayers 里的玩家批量刷包续期
        this._renewTimer = setInterval(() => {
            this._renewForActivePlayers();
        }, this.renewInterval);
    }

    /**
     * 彻底销毁这个木牌控制对象并停止循环
     */
    destroy() {
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
            this._checkTimer = null;
        }
        if (this._renewTimer) {
            clearInterval(this._renewTimer);
            this._renewTimer = null;
        }
        this.activePlayers.clear();
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
//  * @warning 创建出来的物品最多在客户端存在 32.305833 分钟，需要每半小时发一次 SetActorData 数据包
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
//         return { id, }; // 开启raw，使用乱发模式OwO
//     };
// })();

// /**
//  * 创建 更新掉落物存在时间 数据包（也可以更新别的，自己玩）
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
 * @description 掉落物实体数据包封装（支持单玩家、玩家数组、全员发送及 5min 自动续期，使用自定义物品名称与数量）
 * @author 子沐呀 是春风呀233
 * @since 2026-07-27
 */

/**
 * 获取物品的显示名称
 */
function getItemDisplayName(item) {
    const translateCode = (typeof config !== 'undefined' && config.get)
        ? (config.get("itemtranslateCode") ?? "zh_CN")
        : "zh_CN";
    const baseName = item.getTranslateName(translateCode);
    const itemInfo = typeof getItemInfo === 'function' ? getItemInfo(item) : {};
    return itemInfo.CustomName || baseName;
}
let globalDecrementingID = 9223372036854775807n;
export class DropItem {
    /**
     * 创建一个假掉落物对象
     * @param {Item} item 物品对象
     * @param {FloatPos} pos 坐标
     * @param {object} [options] 配置项
     * @param {number} [options.visibleDistance=16] 玩家触发显示的距离（格）
     * @param {number} [options.checkInterval=1000] 短循环：检测玩家进出的间隔(ms)
     * @param {number} [options.renewInterval=300000] 大循环：给范围玩家发续期包的间隔(ms)，默认5分钟
     */
    constructor(item, pos, options = {}) {
        this.id = --globalDecrementingID;
        this.item = item;
        this.pos = pos;
        this.displayName = getItemDisplayName(item);

        this.visibleDistance = options.visibleDistance || 16;
        this.checkInterval = options.checkInterval || 1000;
        this.renewInterval = options.renewInterval || 5 * 60 * 1000; // 默认 5 分钟

        // 维护当前能看见该掉落物的玩家集合 (Set<Player>)
        this.activePlayers = new Set();

        this._checkTimer = null;
        this._renewTimer = null;
        // 实例化即开启双循环机制
        this.start()
    }

    /**
     * 严格还原原版的 AddItemActor (ID: 15) 数据包构建
     * @private
     */
    _buildAddPacketStream() {
        const stream = new GMLIB_BinaryStream();

        // 1. Packet Header
        stream.writePacketHeader(15);

        // 2. ID 写入
        writeVarInt64ToStream(stream, this.id.toString()); // uniqueId
        writeUnsignedVarInt64ToStream(stream, this.id.toString()); // runtimeId

        // 3. 物品对象
        stream.writeItem(this.item);

        // 4. 坐标
        stream.writeFloat(this.pos.x);
        stream.writeFloat(this.pos.y);
        stream.writeFloat(this.pos.z);

        // 5. 速度 Motion (X, Y, Z)
        stream.writeFloat(0);
        stream.writeFloat(0);
        stream.writeFloat(0);

        // 6. 属性 Metadata / ActorData (严格按照原代码顺序)
        stream.writeUnsignedVarInt(3); // Metadata 数量: 3

        // --- 属性 1: ClientEvent ---
        stream.writeUnsignedVarInt(24); // ActorDataIDs::ClientEvent
        stream.writeUnsignedVarInt(1);  // DataItemType::Short
        stream.writeSignedShort(32767);

        // --- 属性 2: NametagAlwaysShow ---
        stream.writeUnsignedVarInt(81); // ActorDataIDs::NametagAlwaysShow
        stream.writeUnsignedVarInt(0);  // DataItemType::Byte
        stream.writeBool(true);

        // --- 属性 3: Name ---
        stream.writeUnsignedVarInt(4);  // ActorDataIDs::Name
        stream.writeUnsignedVarInt(4);  // DataItemType::String
        stream.writeString(this.displayName);

        // 7. 末尾标记 (与原版完全一致)
        stream.writeBool(false);

        return stream;
    }

    /**
     * 严格还原原版的 RemoveActor (ID: 14) 数据包构建
     * @private
     */
    _buildRemovePacketStream() {
        const stream = new GMLIB_BinaryStream();
        stream.writePacketHeader(14); // RemoveActor 数据包
        writeVarInt64ToStream(stream, this.id.toString()); // uniqueId
        return stream;
    }

    /**
     * 给指定玩家发生成包
     * @private
     */
    _sendSpawnPacket(player) {
        if (!player) return;
        const stream = this._buildAddPacketStream();
        stream.sendTo(player);
    }

    /**
     * 给指定玩家发移除包
     * @private
     */
    _sendRemovePacket(player) {
        if (!player) return;
        const stream = this._buildRemovePacketStream();
        stream.sendTo(player);
    }

    /**
     * 【短循环】检测周围玩家：靠近则发初始包加入大循环；远离则发移除包并剔除
     * @private
     */
    _checkNearbyPlayers() {
        const allOnline = mc.getOnlinePlayers();
        allOnline.forEach(player => {
            if (!player || player.pos.dimid !== this.pos.dimid) {
                // 异维度玩家如果之前在列表中，剔除并发移除包
                if (this.activePlayers.has(player.uniqueId)) {
                    this._sendRemovePacket(player);
                    this.activePlayers.delete(player.uniqueId);
                }
                return;
            }
            if (player.distanceTo(this.pos) <= this.visibleDistance) {
                // 靠近：如果还没在 activePlayers 里，发初始包并加入大循环数组
                if (!this.activePlayers.has(player.uniqueId)) {
                    this._sendRemovePacket(player); // 防重发先刷掉
                    this._sendSpawnPacket(player);
                    this.activePlayers.add(player.uniqueId);
                }
            } else {
                // 远离：如果在 activePlayers 里，发移除包并剔除
                if (this.activePlayers.has(player.uniqueId)) {
                    this._sendRemovePacket(player);
                    this.activePlayers.delete(player.uniqueId);
                }
            }
        });
    }

    /**
     * 【大循环】为当前已在附近的 activePlayers 定期刷新续期包
     * @private
     */
    _renewForActivePlayers() {
        if (this.activePlayers.size === 0) return;

        this.activePlayers.forEach(player => {
            const pl = mc.getPlayer(player);
            if (pl) {
                // 先删后发，完成客户端假掉落物续期
                this._sendRemovePacket(pl);
                this._sendSpawnPacket(pl);
            } else {
                // 清除离线玩家
                this.activePlayers.delete(player);
            }
        });
    }

    /**
     * 启动定时任务
     */
    start() {
        if (this._checkTimer || this._renewTimer) return;

        // 1. 立即执行一次短循环检测
        this._checkNearbyPlayers();

        // 2. 短循环：持续检测附近进入/离开的玩家
        this._checkTimer = setInterval(() => {
            this._checkNearbyPlayers();
        }, this.checkInterval);

        // 3. 大循环：对留在 activePlayers 里的玩家批量续期
        this._renewTimer = setInterval(() => {
            this._renewForActivePlayers();
        }, this.renewInterval);
    }

    /**
     * 彻底销毁这个假掉落物实体
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

        // 给所有能看到的玩家发移除包
        this.activePlayers.forEach(player => {
            const pl = mc.getPlayer(player);
            if (pl) {
                this._sendRemovePacket(pl);
            }
        });

        // 清空玩家数组
        this.activePlayers.clear();
    }
}
export function getItemChestFloatPosFromIntPos({ x, y, z, dimid }) {
    return new FloatPos(x + 0.5, y - 0.2, z + 0.5, dimid)
}
// const testitem1 = mc.newItem("apple", 1)
// testitem1.setDisplayName("114514")
// const testitem2 = mc.newItem("bedrock", 1)
// const fakeDrop = new DropItem(testitem1, getItemChestFloatPosFromIntPos({ x: 0, y: 106, z: 0, dimid: 0 }), {
//     visibleDistance: 12,    // 玩家距离 12 格以内才显示
//     checkInterval: 2000,    // 每 1 秒检测一次附近玩家（短循环）
//     renewInterval: 280000   // 每 4 分钟对范围内的玩家续期一次发包（大循环）
// });