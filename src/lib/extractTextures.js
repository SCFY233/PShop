import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中__dirname不可用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 方块材质面优先级：同 aux 多面时按此顺序选取代表面（侧面优先）
const FACE_PRIORITY = ['side', '*', 'up', 'down', 'north', 'south', 'east', 'west'];

// brarchive 格式魔数: 7D 27 25 B1 A0 52 70 26
const BRARCHIVE_MAGIC = Buffer.from([0x7D, 0x27, 0x25, 0xB1, 0xA0, 0x52, 0x70, 0x26]);

/**
 * 读取 brarchive 归档文件，返回 { filename: Buffer } 映射
 * brarchive 格式:
 *   - 文件头 16 字节: 8字节魔数 + 4字节文件数(LE) + 4字节版本(LE)
 *   - 目录: file_count * 256 字节，每条目:
 *     1字节名称长度 + 名称 + 填充至248 + 4字节偏移(LE) + 4字节大小(LE)
 *   - 数据: 原始文件数据堆叠
 */
function readBrarchive(filePath) {
    const data = fs.readFileSync(filePath);
    if (data.length < 16) return {};

    // 校验魔数
    if (!data.subarray(0, 8).equals(BRARCHIVE_MAGIC)) {
        return {};
    }

    const fileCount = data.readUInt32LE(8);
    const dataStart = 16 + fileCount * 256;
    const result = {};

    for (let i = 0; i < fileCount; i++) {
        const entryStart = 16 + i * 256;
        const nameLen = data[entryStart];
        const name = data.subarray(entryStart + 1, entryStart + 1 + nameLen).toString('utf8');
        const dataOffset = data.readUInt32LE(entryStart + 248);
        const fileSize = data.readUInt32LE(entryStart + 252);

        if (fileSize === 0) continue;

        const fileData = data.subarray(dataStart + dataOffset, dataStart + dataOffset + fileSize);
        result[name] = fileData;
    }

    return result;
}

/**
 * 从 brarchive 中读取 JSON 文件并对每个调用 callback
 */
function readBrarchiveJsonFiles(brarchivePath, callback) {
    if (!fs.existsSync(brarchivePath)) return;

    const files = readBrarchive(brarchivePath);
    for (const [name, buffer] of Object.entries(files)) {
        if (name.endsWith('.json')) {
            callback(name, buffer);
        }
    }
}

/**
 * 解析 Buffer 中的 JSON 内容，支持带注释
 */
function parseJsonBuffer(buffer) {
    try {
        const content = buffer.toString('utf8');
        const cleanedContent = content
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');
        return JSON.parse(cleanedContent);
    } catch (err) {
        return null;
    }
}

/**
 * 物品和方块材质解析器类
 * 用于解析行为包和材质包，提取物品和方块的材质路径
 *
 * 解析思路：
 * - 行为包（BP）为权威来源：物品读取 minecraft:icon，方块读取 material_instances/item_visual/permutations
 * - 材质包（RP）提供材质表：item_texture.json 与 terrain_texture.json 构建 key -> 路径 映射
 * - 方块回退：BP 未定义 material_instances 时（如 HiddenYears），查 RP 根目录 blocks.json 的面映射
 * - 最终按 aux 格式输出：{"cc:xxx": {"0": "path", "1": "path"}}，未匹配保留 null
 *
 * @class TexturePathParser
 * @example
 * const parser = new TexturePathParser({
 *   bdsPath: 'C:/path/to/bds',
 *   outputPath: 'C:/path/to/output.json',
 *   worldName: 'Bedrock level'
 * });
 * const result = parser.run();
 */
export class TexturePathParser {
    /**
     * 创建解析器实例
     * @param {Object} config - 配置对象
     * @param {string} config.bdsPath - BDS根目录路径
     * @param {string} config.outputPath - 输出文件路径
     * @param {string} [config.worldName] - 要解析的世界名称，不指定则解析所有世界
     * @param {string[]} [config.vanillaPacks] - 原版包名称前缀列表
     */
    constructor(config) {
        if (!config.bdsPath) {
            throw new Error('必须提供bdsPath参数');
        }
        if (!config.outputPath) {
            throw new Error('必须提供outputPath参数');
        }

        this.bdsPath = config.bdsPath;
        this.outputPath = config.outputPath;
        this.worldName = config.worldName || null; // null表示解析所有世界
        this.vanillaPacks = config.vanillaPacks || ['vanilla', 'chemistry', 'editor', 'experimental_', 'server_'];

        this.behaviorPacksPath = path.join(this.bdsPath, 'behavior_packs');
        this.resourcePacksPath = path.join(this.bdsPath, 'resource_packs');
        this.worldsPath = path.join(this.bdsPath, 'worlds');

        // 材质表：item_texture.json / terrain_texture.json 的 key -> 路径(字符串或数组)
        this.textureTable = {};
        // 物品图标：identifier -> item_texture.json 的 key
        this.itemIcons = {};
        // 方块材质：identifier -> { default: {face:key}, itemVisual: {face:key}, permutations: [{face:key}, ...] }
        this.blockData = {};
        // blocks.json（RP根目录）方块标识符 -> {face: textureKey}
        // 用于 BP 方块未定义 material_instances 时的回退（如 HiddenYears 的方块）
        this.blocksJsonTable = {};

        this.result = {};
        this.namespaces = new Set(); // 收集所有命名空间
    }

    /**
     * 检查是否为原版包
     */
    isVanillaPack(packName) {
        return this.vanillaPacks.some(prefix => packName.startsWith(prefix));
    }

    /**
     * 递归读取目录下的所有JSON文件
     */
    readJsonFiles(dir, callback) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                this.readJsonFiles(fullPath, callback);
            } else if (file.isFile() && file.name.endsWith('.json')) {
                callback(fullPath);
            }
        }
    }

    /**
     * 解析JSON文件，支持带注释的JSON
     */
    parseJsonFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 移除单行和多行注释
            const cleanedContent = content
                .replace(/\/\/.*$/gm, '') // 移除单行注释
                .replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行注释
            return JSON.parse(cleanedContent);
        } catch (err) {
            return null;
        }
    }

    /**
     * 解析行为包中的物品和方块定义
     */
    parseBehaviorPacks() {
        console.log('正在解析行为包...');

        // 解析全局行为包
        this.parseBehaviorPacksInDir(this.behaviorPacksPath);

        // 解析worlds目录中的行为包
        if (fs.existsSync(this.worldsPath)) {
            const worlds = fs.readdirSync(this.worldsPath, { withFileTypes: true });

            for (const world of worlds) {
                if (!world.isDirectory()) continue;

                // 如果指定了世界名称，只解析指定的世界
                if (this.worldName && this.worldName !== world.name) {
                    continue;
                }

                const worldPath = path.join(this.worldsPath, world.name);
                const worldBehaviorPacksPath = path.join(worldPath, 'behavior_packs');

                if (fs.existsSync(worldBehaviorPacksPath)) {
                    console.log(`  - 解析世界: ${world.name}`);
                    this.parseBehaviorPacksInDir(worldBehaviorPacksPath);
                }
            }
        }
    }

    /**
     * 解析指定目录中的行为包
     * 支持两种结构:
     *   1. 展开目录: blocks/*.json, items/*.json (新版 CCR / HiddenYears)
     *   2. brarchive: __brarchive/blocks.brarchive, __brarchive/items.brarchive (旧版 CoreCraft)
     */
    parseBehaviorPacksInDir(packsDir) {
        if (!fs.existsSync(packsDir)) return;

        const packs = fs.readdirSync(packsDir, { withFileTypes: true });
        const customPacks = [];

        for (const pack of packs) {
            if (!pack.isDirectory()) continue;
            if (this.isVanillaPack(pack.name)) continue;

            customPacks.push(pack.name);
            const packPath = path.join(packsDir, pack.name);

            console.log(`    - 解析包: ${pack.name}`);

            // 解析物品 - 展开目录
            const itemsPath = path.join(packPath, 'items');
            if (fs.existsSync(itemsPath)) {
                this.readJsonFiles(itemsPath, (filePath) => {
                    this.parseItemFile(filePath);
                });
            }

            // 解析物品 - brarchive（旧版 CoreCraft）
            const itemsBrarchive = path.join(packPath, '__brarchive', 'items.brarchive');
            if (fs.existsSync(itemsBrarchive)) {
                console.log(`      - 从 brarchive 读取物品: items.brarchive`);
                readBrarchiveJsonFiles(itemsBrarchive, (name, buffer) => {
                    this.parseItemBuffer(name, buffer);
                });
            }

            // 解析方块 - 展开目录
            const blocksPath = path.join(packPath, 'blocks');
            if (fs.existsSync(blocksPath)) {
                this.readJsonFiles(blocksPath, (filePath) => {
                    this.parseBlockFile(filePath);
                });
            }

            // 解析方块 - brarchive（旧版 CoreCraft）
            const blocksBrarchive = path.join(packPath, '__brarchive', 'blocks.brarchive');
            if (fs.existsSync(blocksBrarchive)) {
                console.log(`      - 从 brarchive 读取方块: blocks.brarchive`);
                readBrarchiveJsonFiles(blocksBrarchive, (name, buffer) => {
                    this.parseBlockBuffer(name, buffer);
                });
            }
        }

        if (customPacks.length === 0) {
            console.log(`    - 未找到自定义行为包（已排除原版包）`);
        } else {
            console.log(`    - 共找到 ${customPacks.length} 个自定义行为包`);
        }
    }

    /**
     * 解析物品文件，读取 identifier 与 minecraft:icon
     */
    parseItemFile(filePath) {
        const content = this.parseJsonFile(filePath);
        if (!content) return;
        this.parseItemContent(content);
    }

    /**
     * 从 brarchive Buffer 解析物品文件
     */
    parseItemBuffer(name, buffer) {
        const content = parseJsonBuffer(buffer);
        if (!content) return;
        this.parseItemContent(content);
    }

    /**
     * 解析物品 JSON 内容的公共逻辑
     */
    parseItemContent(content) {
        try {
            const item = content['minecraft:item'];
            if (!item || !item.description || !item.description.identifier) return;

            const identifier = item.description.identifier;
            const [namespace] = identifier.split(':');
            if (namespace) this.namespaces.add(namespace);

            // minecraft:icon 可能在 components 下，也可能直接挂在 item 下（兼容多版本）
            const components = item.components || {};
            const iconRaw = components['minecraft:icon'] !== undefined
                ? components['minecraft:icon']
                : item['minecraft:icon'];

            let iconKey = null;
            if (typeof iconRaw === 'string') {
                iconKey = iconRaw;
            } else if (iconRaw && typeof iconRaw === 'object' && iconRaw.texture) {
                iconKey = iconRaw.texture;
            }

            this.itemIcons[identifier] = iconKey;
        } catch (err) {
            // 静默忽略解析错误
        }
    }

    /**
     * 解析方块文件，读取 material_instances / item_visual / permutations 的各面材质 key
     */
    parseBlockFile(filePath) {
        const content = this.parseJsonFile(filePath);
        if (!content) return;
        this.parseBlockContent(content);
    }

    /**
     * 从 brarchive Buffer 解析方块文件
     */
    parseBlockBuffer(name, buffer) {
        const content = parseJsonBuffer(buffer);
        if (!content) return;
        this.parseBlockContent(content);
    }

    /**
     * 解析方块 JSON 内容的公共逻辑
     */
    parseBlockContent(content) {
        try {
            const block = content['minecraft:block'];
            if (!block || !block.description || !block.description.identifier) return;

            const identifier = block.description.identifier;
            const [namespace] = identifier.split(':');
            if (namespace) this.namespaces.add(namespace);

            const components = block.components || {};

            // 默认材质（components.minecraft:material_instances）
            const defaultFaceMap = this.extractFaceMap(components['minecraft:material_instances']);

            // 物品栏视觉材质（components.minecraft:item_visual.material_instances）
            let itemVisualFaceMap = null;
            const itemVisual = components['minecraft:item_visual'];
            if (itemVisual && itemVisual.material_instances) {
                itemVisualFaceMap = this.extractFaceMap(itemVisual.material_instances);
            }

            // permutations 中的材质覆盖
            const permutations = [];
            if (Array.isArray(block.permutations)) {
                for (const perm of block.permutations) {
                    const permComponents = perm.components || {};
                    const faceMap = this.extractFaceMap(permComponents['minecraft:material_instances']);
                    if (Object.keys(faceMap).length > 0) {
                        permutations.push(faceMap);
                    }
                }
            }

            this.blockData[identifier] = {
                default: defaultFaceMap,
                itemVisual: itemVisualFaceMap,
                permutations
            };
        } catch (err) {
            // 静默忽略解析错误
        }
    }

    /**
     * 从 material_instances 提取 {face: textureKey} 映射
     */
    extractFaceMap(materialInstances) {
        const faceMap = {};
        if (!materialInstances || typeof materialInstances !== 'object') return faceMap;

        for (const [face, data] of Object.entries(materialInstances)) {
            if (!data) continue;
            // data 可能是 { texture: "cc:xxx", render_method: "..." } 或字符串简写
            if (typeof data === 'string') {
                faceMap[face] = data;
            } else if (typeof data === 'object' && data.texture) {
                faceMap[face] = data.texture;
            }
        }
        return faceMap;
    }

    /**
     * 从多个面中按优先级选取代表材质 key（侧面优先）
     */
    selectFaceTexture(faceMap) {
        if (!faceMap) return null;
        for (const face of FACE_PRIORITY) {
            if (faceMap[face]) return faceMap[face];
        }
        // 回退：任意一个面
        const keys = Object.keys(faceMap);
        return keys.length ? faceMap[keys[0]] : null;
    }

    /**
     * 解析材质包中的材质定义，构建 textureTable
     */
    parseResourcePacks() {
        console.log('正在解析材质包...');

        // 解析全局材质包
        this.parseResourcePacksInDir(this.resourcePacksPath);

        // 解析worlds目录中的材质包
        if (fs.existsSync(this.worldsPath)) {
            const worlds = fs.readdirSync(this.worldsPath, { withFileTypes: true });

            for (const world of worlds) {
                if (!world.isDirectory()) continue;

                // 如果指定了世界名称，只解析指定的世界
                if (this.worldName && this.worldName !== world.name) {
                    continue;
                }

                const worldPath = path.join(this.worldsPath, world.name);
                const worldResourcePacksPath = path.join(worldPath, 'resource_packs');

                if (fs.existsSync(worldResourcePacksPath)) {
                    console.log(`  - 解析世界: ${world.name}`);
                    this.parseResourcePacksInDir(worldResourcePacksPath);
                }
            }
        }
    }

    /**
     * 解析指定目录中的材质包
     */
    parseResourcePacksInDir(packsDir) {
        if (!fs.existsSync(packsDir)) return;

        const packs = fs.readdirSync(packsDir, { withFileTypes: true });
        const customPacks = [];

        for (const pack of packs) {
            if (!pack.isDirectory()) continue;
            if (this.isVanillaPack(pack.name)) continue;

            customPacks.push(pack.name);
            const packPath = path.join(packsDir, pack.name);

            console.log(`    - 解析包: ${pack.name}`);

            // 扫描材质定义文件，构建材质表
            this.scanTextureFiles(packPath);
        }

        if (customPacks.length === 0) {
            console.log(`    - 未找到自定义材质包（已排除原版包）`);
        } else {
            console.log(`    - 共找到 ${customPacks.length} 个自定义材质包`);
        }
    }

    /**
     * 扫描材质包中的 item_texture.json / terrain_texture.json / blocks.json
     * 支持两种结构:
     *   1. 展开目录: textures/item_texture.json (新版 CCR / HiddenYears)
     *   2. brarchive: __brarchive/textures.brarchive 中包含 item_texture.json 等 (旧版 CoreCraft RP)
     * - item_texture.json / terrain_texture.json: 构建 key -> 路径 材质表
     * - blocks.json (RP根目录): 构建方块标识符 -> {face: textureKey} 映射，用于 BP 无 material_instances 时回退
     */
    scanTextureFiles(packPath) {
        const texturesPath = path.join(packPath, 'textures');
        if (fs.existsSync(texturesPath)) {
            // item_texture.json
            const itemTexturePath = path.join(texturesPath, 'item_texture.json');
            if (fs.existsSync(itemTexturePath)) {
                const content = this.parseJsonFile(itemTexturePath);
                if (content && content.texture_data) {
                    for (const [key, value] of Object.entries(content.texture_data)) {
                        this.addTextureData(key, value.textures);
                    }
                }
            }

            // terrain_texture.json
            const terrainTexturePath = path.join(texturesPath, 'terrain_texture.json');
            if (fs.existsSync(terrainTexturePath)) {
                const content = this.parseJsonFile(terrainTexturePath);
                if (content && content.texture_data) {
                    for (const [key, value] of Object.entries(content.texture_data)) {
                        this.addTextureData(key, value.textures);
                    }
                }
            }
        }

        // blocks.json（RP 根目录，vanilla 风格方块材质映射）
        const blocksJsonPath = path.join(packPath, 'blocks.json');
        if (fs.existsSync(blocksJsonPath)) {
            this.parseBlocksJson(blocksJsonPath);
        }

        // 从 brarchive 读取材质定义文件（旧版 CoreCraft RP）
        const texturesBrarchive = path.join(packPath, '__brarchive', 'textures.brarchive');
        if (fs.existsSync(texturesBrarchive)) {
            console.log(`      - 从 brarchive 读取材质定义: textures.brarchive`);
            const files = readBrarchive(texturesBrarchive);

            // item_texture.json
            if (files['item_texture.json']) {
                const content = parseJsonBuffer(files['item_texture.json']);
                if (content && content.texture_data) {
                    for (const [key, value] of Object.entries(content.texture_data)) {
                        this.addTextureData(key, value.textures);
                    }
                }
            }

            // terrain_texture.json
            if (files['terrain_texture.json']) {
                const content = parseJsonBuffer(files['terrain_texture.json']);
                if (content && content.texture_data) {
                    for (const [key, value] of Object.entries(content.texture_data)) {
                        this.addTextureData(key, value.textures);
                    }
                }
            }
        }
    }

    /**
     * 解析 RP 根目录的 blocks.json
     * 格式：{ "format_version": [...], "<blockIdentifier>": { "textures": "key" | {face: key, ...} } }
     * textures 为字符串时视作 '*' 面；为对象时按面写入
     */
    parseBlocksJson(blocksJsonPath) {
        const content = this.parseJsonFile(blocksJsonPath);
        if (!content || typeof content !== 'object') return;

        for (const [identifier, data] of Object.entries(content)) {
            // 跳过 format_version 等元字段
            if (identifier === 'format_version') continue;
            if (!data || typeof data !== 'object') continue;

            const textures = data.textures;
            if (textures === undefined) continue;

            const faceMap = {};
            if (typeof textures === 'string') {
                // 单一材质键，视作通配面
                faceMap['*'] = textures;
            } else if (typeof textures === 'object') {
                // 面映射 {up, down, side, north, south, east, west}
                for (const [face, key] of Object.entries(textures)) {
                    if (typeof key === 'string') {
                        faceMap[face] = key;
                    }
                }
            }

            if (Object.keys(faceMap).length > 0) {
                this.blocksJsonTable[identifier] = faceMap;
            }
        }
    }

    /**
     * 将一条 texture_data 条目写入材质表
     * textures 可为字符串、字符串数组或 {path: "..."} 对象
     */
    addTextureData(key, textures) {
        if (textures === undefined || textures === null) return;

        if (typeof textures === 'string') {
            this.textureTable[key] = textures;
        } else if (Array.isArray(textures)) {
            const arr = textures
                .map(t => (typeof t === 'string' ? t : (t && t.path)))
                .filter(t => t);
            if (arr.length > 0) this.textureTable[key] = arr.length === 1 ? arr[0] : arr;
        } else if (typeof textures === 'object' && textures.path) {
            this.textureTable[key] = textures.path;
        }
    }

    /**
     * 在材质表中查找 key 对应的路径
     * 回退: 无命名空间（不含 ":"）的 key 视为原版 terrain_texture 键，
     *       按原版约定映射为 textures/blocks/<key>
     * @returns {string|string[]|null} 字符串路径、路径数组（多 aux 变体）或 null
     */
    resolveTextureKey(key) {
        if (!key) return null;
        const val = this.textureTable[key];
        if (val !== undefined) return val;
        // 原版键回退：不含命名空间的 key（如 "gold_ore"、"sandstone_top"）
        if (typeof key === 'string' && !key.includes(':')) {
            return `textures/blocks/${key}`;
        }
        return null;
    }

    /**
     * 根据物品图标 key 解析材质路径，输出 aux 格式
     */
    buildItemResult(iconKey) {
        const resolved = this.resolveTextureKey(iconKey);
        if (resolved === null) return null;

        // 字符串 -> {"0": path}
        if (typeof resolved === 'string') {
            return { 0: resolved };
        }
        // 数组 -> {"0": path0, "1": path1, ...}
        if (Array.isArray(resolved)) {
            const map = {};
            resolved.forEach((p, i) => { map[i] = p; });
            return map;
        }
        return null;
    }

    /**
     * 根据方块材质数据组装 aux 格式结果
     * - aux 0: 物品栏视觉（itemVisual）优先，否则取默认（components）代表面
     * - aux 1..n: 每个 permutations 中含材质覆盖的代表面
     * - 同 aux 多面取侧面（FACE_PRIORITY）
     * - 路径去重
     * - 回退: BP 无 material_instances 时，查 RP 根目录 blocks.json（blocksJsonTable）
     */
    buildBlockResult(blockInfo, identifier) {
        const variantKeys = [];

        // 默认变体：itemVisual 优先（物品栏展示），否则取 components 默认
        const defaultFaceMap = blockInfo.itemVisual || blockInfo.default;
        const defaultKey = this.selectFaceTexture(defaultFaceMap);
        if (defaultKey) variantKeys.push(defaultKey);

        // permutations 变体
        for (const perm of blockInfo.permutations) {
            const key = this.selectFaceTexture(perm);
            if (key) variantKeys.push(key);
        }

        // 回退: BP 未定义 material_instances 时，使用 RP 根目录 blocks.json 的面映射
        if (variantKeys.length === 0) {
            const blocksJsonFaceMap = this.blocksJsonTable[identifier];
            const fallbackKey = this.selectFaceTexture(blocksJsonFaceMap);
            if (fallbackKey) variantKeys.push(fallbackKey);
        }

        if (variantKeys.length === 0) return null;

        // 逐 key 解析为路径，展开数组型 aux 变体，去重后分配 aux
        const auxMap = {};
        let aux = 0;
        const seen = new Set();

        for (const key of variantKeys) {
            const resolved = this.resolveTextureKey(key);
            if (resolved === null) continue;

            const paths = typeof resolved === 'string' ? [resolved] : (Array.isArray(resolved) ? resolved : []);
            for (const p of paths) {
                if (!p || seen.has(p)) continue;
                seen.add(p);
                auxMap[aux++] = p;
            }
        }

        return Object.keys(auxMap).length > 0 ? auxMap : null;
    }

    /**
     * 组装最终结果：遍历物品与方块，查材质表填充路径
     */
    buildResult() {
        console.log('正在组装材质映射...');

        // 物品
        let itemMatched = 0;
        for (const [identifier, iconKey] of Object.entries(this.itemIcons)) {
            const auxMap = this.buildItemResult(iconKey);
            this.result[identifier] = auxMap;
            if (auxMap !== null) itemMatched++;
        }
        console.log(`  - 物品: ${itemMatched}/${Object.keys(this.itemIcons).length} 个匹配到材质`);

        // 方块
        let blockMatched = 0;
        for (const [identifier, blockInfo] of Object.entries(this.blockData)) {
            const auxMap = this.buildBlockResult(blockInfo, identifier);
            this.result[identifier] = auxMap;
            if (auxMap !== null) blockMatched++;
        }
        console.log(`  - 方块: ${blockMatched}/${Object.keys(this.blockData).length} 个匹配到材质`);
    }

    /**
     * 尝试从原版材质包中获取缺失的材质路径
     */
    fillFromVanilla() {
        console.log('跳过原版材质包（不使用原版材质）');
        // 不从原版材质包获取数据
    }

    /**
     * 移除没有材质的物品
     */
    removeNullEntries() {
        for (const key in this.result) {
            if (this.result[key] === null) {
                delete this.result[key];
            }
        }
    }

    /**
     * 运行解析器
     */
    run() {
        console.log('开始解析...');
        console.log(`BDS路径: ${this.bdsPath}`);
        console.log(`输出路径: ${this.outputPath}`);
        if (this.worldName) {
            console.log(`指定世界: ${this.worldName}`);
        } else {
            console.log('解析所有世界');
        }
        console.log('');

        this.parseBehaviorPacks();
        this.parseResourcePacks();
        this.buildResult();
        // 保留未匹配项为 null（便于排查），如需清除可调用 removeNullEntries()
        this.saveToFile();
        console.log(`\n解析完成！共记录 ${Object.keys(this.result).length} 个物品/方块。`);

        return this.result;
    }

    /**
     * 保存结果到文件
     */
    saveToFile() {
        const json = JSON.stringify(this.result, null, 4);
        File.writeTo(this.outputPath, json);
        console.log(`结果已保存到: ${this.outputPath}`);
    }

    /**
     * 检查材质文件是否实际存在
     * @returns {Object} 包含存在和不存在材质的对象
     */
    checkTexturesExistence() {
        const existing = {};
        const missing = {};

        for (const [identifier, textureData] of Object.entries(this.result)) {
            if (textureData === null) continue;

            // 处理 aux 格式的材质 {"0": path, "1": path}
            if (typeof textureData === 'object') {
                let allFound = true;
                const auxTextures = {};

                for (const [auxValue, texturePath] of Object.entries(textureData)) {
                    let found = false;

                    // 检查全局材质包
                    if (this.checkTextureInDir(this.resourcePacksPath, texturePath)) {
                        found = true;
                    }

                    // 检查世界材质包
                    if (!found && this.worldName && fs.existsSync(this.worldsPath)) {
                        const worldPath = path.join(this.worldsPath, this.worldName);
                        const worldResourcePacksPath = path.join(worldPath, 'resource_packs');

                        if (fs.existsSync(worldResourcePacksPath)) {
                            if (this.checkTextureInDir(worldResourcePacksPath, texturePath)) {
                                found = true;
                            }
                        }
                    }

                    auxTextures[auxValue] = texturePath;
                    if (!found) {
                        allFound = false;
                    }
                }

                if (allFound) {
                    existing[identifier] = textureData;
                } else {
                    missing[identifier] = textureData;
                }
            } else {
                // 处理单个材质（字符串）
                let found = false;

                if (this.checkTextureInDir(this.resourcePacksPath, textureData)) {
                    found = true;
                }

                if (!found && this.worldName && fs.existsSync(this.worldsPath)) {
                    const worldPath = path.join(this.worldsPath, this.worldName);
                    const worldResourcePacksPath = path.join(worldPath, 'resource_packs');

                    if (fs.existsSync(worldResourcePacksPath)) {
                        if (this.checkTextureInDir(worldResourcePacksPath, textureData)) {
                            found = true;
                        }
                    }
                }

                if (found) {
                    existing[identifier] = textureData;
                } else {
                    missing[identifier] = textureData;
                }
            }
        }

        return { existing, missing };
    }

    /**
     * 在指定目录中检查材质文件是否存在
     * 兼容 .png / .tga / .texture_set.json 多种格式
     */
    checkTextureInDir(packsDir, texturePath) {
        if (!fs.existsSync(packsDir)) return false;

        const packs = fs.readdirSync(packsDir, { withFileTypes: true });

        for (const pack of packs) {
            if (!pack.isDirectory()) continue;

            const packPath = path.join(packsDir, pack.name);
            const fullTexturePath = path.join(packPath, texturePath);

            // 检查 PNG 文件
            if (fs.existsSync(fullTexturePath + '.png')) {
                return true;
            }

            // 检查 TGA 文件
            if (fs.existsSync(fullTexturePath + '.tga')) {
                return true;
            }

            // 检查 texture_set.json（PBR 材质集，主色层文件名同路径）
            if (fs.existsSync(fullTexturePath + '.texture_set.json')) {
                return true;
            }

            // 检查路径本身（无扩展名或其他情况）
            if (fs.existsSync(fullTexturePath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 验证材质文件并输出报告
     */
    validateTextures() {
        console.log('\n正在验证材质文件...');
        const { existing, missing } = this.checkTexturesExistence();

        console.log(`✅ 存在的材质: ${Object.keys(existing).length} 个`);
        console.log(`❌ 缺失的材质: ${Object.keys(missing).length} 个`);

        if (Object.keys(missing).length > 0) {
            console.log('\n缺失的材质列表:(已自动回退,无需担心)');
            for (const [identifier, texturePath] of Object.entries(missing)) {
                console.log(`  - ${identifier}: ${JSON.stringify(texturePath)}`);
            }
        }

        return { existing, missing };
    }
}
