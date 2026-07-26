import { CompareVersion, ReplaceStr, warn } from "./lib/lib.js"
import { versions, config, lang, consts } from "./consts.js"
/**
 * 检查更新
 * @returns {boolean}
 */
export function checkUpdate() {
    if (config.get("update_url") != "") {
        return network.httpGet(config.get("update_url"), (s, re) => {
            if (s != 200) return logger.error(ReplaceStr(lang.get("log.update.error"), { "code": s, "result": re }))
            else {
                const r = JSON.parse(re)
                if (CompareVersion(versions, r.version) == -1) {
                    warn(ReplaceStr(lang.get("update.NewVersion"), { "name": "Shop", "version": r.version }))
                    log(ReplaceStr(lang.get("update.Notice"), { "notice": (r.updatemes[r.version] || "-") }))
                    log(ReplaceStr(lang.get("update.Download"), { "url": r.links.download[r.version] }))
                }
            }
        })
    }
}

