import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中__dirname不可用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 物品和方块材质解析器类
 * 用于解析行为包和材质包，提取物品和方块的材质路径
 * 
 * @class TexturePathParser
 * @example
 * const parser = new TexturePathParser({
 *   bdsPath: 'C:/path/to/bds',
 *   outputPath: 'C:/path/to/output.json',
 *   worldName: 'Bedrock level'
 * });
 * const result = parser.run();
 * parser.saveToFile();
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
     * 解析行为包中的物品定义
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

            // 解析物品
            const itemsPath = path.join(packPath, 'items');
            if (fs.existsSync(itemsPath)) {
                this.readJsonFiles(itemsPath, (filePath) => {
                    this.parseItemFile(filePath);
                });
            }

            // 解析方块
            const blocksPath = path.join(packPath, 'blocks');
            if (fs.existsSync(blocksPath)) {
                this.readJsonFiles(blocksPath, (filePath) => {
                    this.parseBlockFile(filePath);
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
     * 解析物品文件
     */
    parseItemFile(filePath) {
        const content = this.parseJsonFile(filePath);
        if (!content) return;

        try {
            if (content['minecraft:item'] && content['minecraft:item'].description) {
                const identifier = content['minecraft:item'].description.identifier;
                if (identifier) {
                    // 提取命名空间
                    const [namespace] = identifier.split(':');
                    if (namespace) {
                        this.namespaces.add(namespace);
                    }
                    this.result[identifier] = null; // 占位，稍后从材质包中获取
                }
            }
        } catch (err) {
            console.warn(`解析物品文件失败: ${filePath}`, err.message);
        }
    }

    /**
     * 解析方块文件
     */
    parseBlockFile(filePath) {
        const content = this.parseJsonFile(filePath);
        if (!content) return;

        try {
            if (content['minecraft:block'] && content['minecraft:block'].description) {
                const identifier = content['minecraft:block'].description.identifier;
                if (identifier) {
                    // 提取命名空间
                    const [namespace] = identifier.split(':');
                    if (namespace) {
                        this.namespaces.add(namespace);
                    }
                    this.result[identifier] = null; // 占位，稍后从材质包中获取
                }
            }
        } catch (err) {
            console.warn(`解析方块文件失败: ${filePath}`, err.message);
        }
    }

    /**
     * 解析材质包中的材质定义
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

            // 扫描所有可能的材质定义文件
            this.scanTextureFiles(packPath);
        }

        if (customPacks.length === 0) {
            console.log(`    - 未找到自定义材质包（已排除原版包）`);
        } else {
            console.log(`    - 共找到 ${customPacks.length} 个自定义材质包`);
        }
    }

    /**
     * 扫描材质包中的所有材质文件
     */
    scanTextureFiles(packPath) {
        const texturesPath = path.join(packPath, 'textures');
        if (!fs.existsSync(texturesPath)) return;

        // 扫描item_texture.json
        const itemTexturePath = path.join(texturesPath, 'item_texture.json');
        if (fs.existsSync(itemTexturePath)) {
            const content = this.parseJsonFile(itemTexturePath);
            if (content && content.texture_data) {
                for (const [key, value] of Object.entries(content.texture_data)) {
                    this.processTextureData(key, value);
                }
            }
        }

        // 扫描terrain_texture.json
        const terrainTexturePath = path.join(texturesPath, 'terrain_texture.json');
        if (fs.existsSync(terrainTexturePath)) {
            const content = this.parseJsonFile(terrainTexturePath);
            if (content && content.texture_data) {
                for (const [key, value] of Object.entries(content.texture_data)) {
                    this.processTextureData(key, value);
                }
            }
        }

        // 扫描blocks和items目录中的png文件
        const blocksPath = path.join(texturesPath, 'blocks');
        if (fs.existsSync(blocksPath)) {
            this.scanPngFiles(blocksPath, 'blocks');
        }

        const itemsPath = path.join(texturesPath, 'items');
        if (fs.existsSync(itemsPath)) {
            this.scanPngFiles(itemsPath, 'items');
        }
    }

    /**
     * 处理材质数据，支持aux值
     */
    processTextureData(key, value) {
        const textures = value.textures;
        
        if (!textures) return;

        // 如果是数组，处理aux值
        if (Array.isArray(textures)) {
            textures.forEach((texture, index) => {
                // 数组索引就是aux值
                const actualTexture = typeof texture === 'string' ? texture : texture.path;
                if (actualTexture) {
                    this.matchTextureToIdentifier(key, actualTexture, index);
                }
            });
        } else {
            // 单个材质，aux值为0
            this.matchTextureToIdentifier(key, textures, 0);
        }
    }

    /**
     * 将材质与标识符匹配
     */
    matchTextureToIdentifier(key, texturePath, auxValue = 0) {
            // 使用动态收集的命名空间
            const possibleIdentifiers = [];
            
            // 添加所有收集到的命名空间
            for (const namespace of this.namespaces) {
                possibleIdentifiers.push(`${namespace}:${key}`);
            }
            
            // 添加minecraft命名空间和原始key
            possibleIdentifiers.push(`minecraft:${key}`);
            possibleIdentifiers.push(key);
    
            for (const identifier of possibleIdentifiers) {
                if (this.result.hasOwnProperty(identifier)) {
                    // 如果标识符已存在，检查是否需要转换为aux格式
                    const existingValue = this.result[identifier];
                    
                    if (existingValue === null) {
                        // 单个材质，使用aux格式
                        this.result[identifier] = {
                            [auxValue]: texturePath
                        };
                    } else if (typeof existingValue === 'string') {
                        // 已有单个材质，转换为aux格式
                        this.result[identifier] = {
                            "0": existingValue,
                            [auxValue]: texturePath
                        };
                    } else if (typeof existingValue === 'object') {
                        // 已是aux格式，添加新材质
                        existingValue[auxValue] = texturePath;
                    }
    
                    return;
                }
            }
    
            // 如果没有匹配到，尝试模糊匹配
                    for (const identifier in this.result) {
                        if (this.result[identifier] !== null) continue;
                        const idParts = identifier.split(':');
                        if (idParts.length === 2 && idParts[1] === key) {
                            // 使用aux格式
                            this.result[identifier] = {
                                [auxValue]: texturePath
                            };
                            return;
                        }
                    }        }

    /**
     * 扫描PNG文件并添加到结果中
     */
    scanPngFiles(dirPath, type) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
            if (!file.isFile() || !file.name.endsWith('.png')) continue;

            const nameWithoutExt = file.name.replace('.png', '');
            const texturePath = `textures/${type}/${nameWithoutExt}`;

            // 尝试匹配所有可能的命名空间
            this.matchTextureToIdentifier(nameWithoutExt, texturePath);
        }
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
        this.removeNullEntries();

        console.log(`\n解析完成！共找到 ${Object.keys(this.result).length} 个物品/方块。`);

        return this.result;
    }

    /**
     * 保存结果到文件
     */
    saveToFile() {
        const json = JSON.stringify(this.result, null, 4);
        fs.writeFileSync(this.outputPath, json, 'utf8');
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
            // 处理aux格式的材质
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
                // 处理单个材质
                let found = false;

                // 检查全局材质包
                if (this.checkTextureInDir(this.resourcePacksPath, textureData)) {
                    found = true;
                }

                // 检查世界材质包
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
     */
    checkTextureInDir(packsDir, texturePath) {
        if (!fs.existsSync(packsDir)) return false;

        const packs = fs.readdirSync(packsDir, { withFileTypes: true });

        for (const pack of packs) {
            if (!pack.isDirectory()) continue;

            const packPath = path.join(packsDir, pack.name);
            const fullTexturePath = path.join(packPath, texturePath);

            // 检查PNG文件
            if (fs.existsSync(fullTexturePath + '.png')) {
                return true;
            }

            // 检查JSON文件（对于item_texture.json等定义的材质）
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
            console.log('\n缺失的材质列表:');
            for (const [identifier, texturePath] of Object.entries(missing)) {
                console.log(`  - ${identifier}: ${texturePath}`);
            }
        }

        return { existing, missing };
    }
}

// 主程序
const isMainModule = process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (isMainModule) {
    // 配置示例
    const config = {
        bdsPath: path.join(__dirname, '../../../../'), // BDS根目录
        outputPath: path.join(__dirname, '../../../../texture_paths_output.json'), // 输出文件路径
        worldName: 'Bedrock level' // 指定要解析的世界名称，不指定则解析所有世界
    };

    const parser = new TexturePathParser(config);

    const result = parser.run();
    parser.saveToFile();

    // 验证材质文件是否存在
    parser.validateTextures();

    // 输出部分结果
    console.log('\n解析结果（前10个）:');
    const entries = Object.entries(result).slice(0, 10);
    console.log(JSON.stringify(Object.fromEntries(entries), null, 2));
}