import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class TexturePathGenerator {
    constructor(options = {}) {
        this.bdsPath = options.bdsPath || '../../../../';
        this.resourcePacksPath = path.join(this.bdsPath, 'resource_packs');
        this.outputPath = options.outputPath || path.join(this.bdsPath, 'textures_path.json');
        this.textureData = {};
        this.options = {
            prioritizeVanilla: options.prioritizeVanilla !== false,
            parseBlocks: options.parseBlocks !== false,
            parseItems: options.parseItems !== false,
            onlyPacks: options.onlyPacks || [],
            excludePacks: options.excludePacks || []
        };
    }
    readJsonFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                content = this.removeJsonComments(content);
                return JSON.parse(content);
            }
        } catch (error) {
            console.error(`读取文件失败: ${filePath}`, error);
        }
        return null;
    }
    removeJsonComments(jsonString) {
        jsonString = jsonString.replace(/\/\/.*$/gm, '');
        jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        return jsonString;
    }
    getResourcePackDirs() {
        const packs = [];
        if (fs.existsSync(this.resourcePacksPath)) {
            let items = fs.readdirSync(this.resourcePacksPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            if (this.options.excludePacks.length > 0) {
                items = items.filter(item => !this.options.excludePacks.includes(item));
            }
            if (this.options.onlyPacks.length > 0) {
                items = items.filter(item => this.options.onlyPacks.includes(item));
            }
            if (this.options.prioritizeVanilla) {
                const vanilla = items.find(item => item === 'vanilla');
                if (vanilla) {
                    items.splice(items.indexOf(vanilla), 1);
                    items.unshift(vanilla);
                }
            }

            packs.push(...items);
        }
        return packs;
    }
    parseBlockTextures(packPath, packName) {
        if (!this.options.parseBlocks) return;
        const blocksJsonPath = path.join(packPath, 'blocks.json');
        const terrainTexturePath = path.join(packPath, 'textures', 'terrain_texture.json');
        const blocksJson = this.readJsonFile(blocksJsonPath);
        const terrainTexture = this.readJsonFile(terrainTexturePath);
        if (!blocksJson || !terrainTexture) return;
        for (const [blockName, blockData] of Object.entries(blocksJson)) {
            if (blockName === 'format_version') continue;
            let texturePath = null;
            if (blockData.textures) {
                if (blockData.textures.side) {
                    const textureName = blockData.textures.side;
                    texturePath = this.getTextureFromTerrainTexture(textureName, terrainTexture);
                } else if (blockData.textures.up) {
                    const textureName = blockData.textures.up;
                    texturePath = this.getTextureFromTerrainTexture(textureName, terrainTexture);
                } else if (typeof blockData.textures === 'string') {
                    const textureName = blockData.textures;
                    texturePath = this.getTextureFromTerrainTexture(textureName, terrainTexture);
                }
            } else if (typeof blockData.textures === 'string') {
                const textureName = blockData.textures;
                texturePath = this.getTextureFromTerrainTexture(textureName, terrainTexture);
            }
            if (texturePath) {
                const minecraftId = `minecraft:${blockName}`;
                if (!this.textureData[minecraftId]) {
                    this.textureData[minecraftId] = texturePath;
                }
            }
        }
    }
    getTextureFromTerrainTexture(textureName, terrainTexture) {
        if (!terrainTexture.texture_data || !terrainTexture.texture_data[textureName]) {
            return null;
        }
        const textureData = terrainTexture.texture_data[textureName];
        if (textureData.textures) {
            if (Array.isArray(textureData.textures)) {
                if (typeof textureData.textures[0] === 'string') {
                    return textureData.textures[0];
                } else if (textureData.textures[0].path) {
                    return textureData.textures[0].path;
                }
            } else if (typeof textureData.textures === 'string') {
                return textureData.textures;
            }
        }
        return null;
    }
    parseItemTextures(packPath, packName) {
        if (!this.options.parseItems) return;
        const itemTexturePath = path.join(packPath, 'textures', 'item_texture.json');
        const itemTexture = this.readJsonFile(itemTexturePath);
        if (!itemTexture || !itemTexture.texture_data) return;
        for (const [itemName, itemData] of Object.entries(itemTexture.texture_data)) {
            let texturePath = null;
            if (itemData.textures) {
                if (Array.isArray(itemData.textures)) {
                    if (typeof itemData.textures[0] === 'string') {
                        texturePath = itemData.textures[0];
                    } else if (itemData.textures[0].path) {
                        texturePath = itemData.textures[0].path;
                    }
                } else if (typeof itemData.textures === 'string') {
                    texturePath = itemData.textures;
                }
            }
            if (texturePath) {
                const minecraftId = `minecraft:${itemName}`;
                if (!this.textureData[minecraftId]) {
                    this.textureData[minecraftId] = texturePath;
                }
            }
        }
    }
    parseResourcePack(packName) {
        const packPath = path.join(this.resourcePacksPath, packName);
        if (!fs.existsSync(packPath)) return;
        console.log(`正在解析材质包: ${packName}`);
        this.parseBlockTextures(packPath, packName);
        this.parseItemTextures(packPath, packName);
    }
    generateTexturePathJson() {
        this.textureData = {};
        const resourcePacks = this.getResourcePackDirs();
        for (const packName of resourcePacks) {
            this.parseResourcePack(packName);
        }
        fs.writeFileSync(this.outputPath, JSON.stringify(this.textureData, null, 4), 'utf8');
        console.log(`材质路径映射已生成: ${this.outputPath}`);
        console.log(`总共解析了 ${Object.keys(this.textureData).length} 个物品和方块`);
        return this.textureData;
    }
}
export function generateTexturePaths(options = {}) {
    try {
        const generator = new TexturePathGenerator(options);
        return generator.generateTexturePathJson();
    } catch (error) {
        console.error('生成材质路径映射失败', error);
    }
}
export default {
    TexturePathGenerator,
    generateTexturePaths
};
