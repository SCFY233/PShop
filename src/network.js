import { CompareVersion, ReplaceStr } from "./lib/lib.js"
import { author, versions, fix, config, lang, consts } from "./consts.js"
/**
 * 启动检查更新
 * @returns {boolean}
 */
export function checkUpdate() {
    if (config.get("update_url") != "") {
        return network.httpGet(config.get("update_url"), (s, re) => {
            const r = JSON.parse(re)
            if (s != 200) logger.error(lang.get("log.update.error"))
            else {
                if (CompareVersion(versions, r.plugin) == -1) {
                    logger.warn(ReplaceStr(lang.get("network.update.newversion"), { "name": "Shop", "version": r.plugin }))
                    logger.info(ReplaceStr(lang.get("network.update.notice"), { "notice": (r.notice[config.get("lang")] || r.notice["zh_CN"]) || "-" }))
                    logger.info(ReplaceStr(lang.get("network.update.download"), { "url": r.url }))
                }
                if (consts.version < r.data) {
                    logger.warn(ReplaceStr(lang.get("network.update.newversion"), { "name": "data", "version": r.data }))
                    logger.info(ReplaceStr(lang.get("network.update.download"), { "url": r.url }))
                }
            }
        })
    }
}
mc.listen("onServerStarted", () => {
    checkUpdate()
    log(`PShop 商店系统插件---加载成功,当前版本:${versions}${fix} 作者: ${author}`);
    if (fix != "" && fix != " Release") logger.warn("你现在使用的版本为开发版,请勿用于生产环境!!!")
})
