import { CompareVersion, ReplaceStr, warn } from "./lib/lib.js"
import { versions, config, lang, consts } from "./consts.js"
/**
 * 启动检查更新
 * @returns {boolean}
 */
export function checkUpdate() {
    if (config.get("update_url") != "") {
        return network.httpGet(config.get("update_url"), (s, re) => {
            const r = JSON.parse(re)
            if (s != 200) logger.error(ReplaceStr(lang.get("log.update.error"), { "code": s, "result": re }))
            else {
                if (CompareVersion(versions, r.version) == -1) {
                    warn(ReplaceStr(lang.get("update.NewVersion"), { "name": "Shop", "version": r.version }))
                    log(ReplaceStr(lang.get("update.Notice"), { "notice": (r.updatemes[r.version] || "-") }))
                    log(ReplaceStr(lang.get("update.Download"), { "url": r.links.download[r.version] }))
                }
                // if (consts.version < r.data) {
                //     warn(ReplaceStr(lang.get("network.update.newversion"), { "name": "data", "version": r.data }))
                //     log(ReplaceStr(lang.get("network.update.download"), { "url": r.url }))
                // }
            }
        })
    }
}

