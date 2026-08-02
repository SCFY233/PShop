import { config, lang, moneyname, texture_paths, shopdata, marketdatajson, marketdata, prefix, loadMarketData } from "./consts.js"
import { PageForm } from "./lib/form.js"
import { moneys, isPositiveInteger, ReplaceStr, newItemWithAux, getItemContent, getCanReductItemCount, reduceItembyType, reduceItembyNbt, getSameItemIndexInArray, wlog, addgiveMoney, addgiveItem } from "./lib/lib.js"
