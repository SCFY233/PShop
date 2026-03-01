// LiteLoader-AIDS automatic generated
/// <reference path="c:/ll3/dev/dts/helperlib/src/index.d.ts" />
///<reference path="c:/ll3/bds/plugins/GMLIB-LegacyRemoteCallApi/lib/GMLIB_API-JS.d.ts" />
import { config, lang } from "../consts.js"
//SimpleForm
/**
* 添加按钮(方便函数)
* @param {Array<String>} names 
* @param {Array<String>} logos 
* @returns {LLSE_SimpleForm}
*/
LLSE_SimpleForm.prototype.addButtons = function (names, logos) {
    names.forEach((name, index) => this.addButton(name, logos[index]));
    return this;
};
/**
* 添加文本(方便函数)
* @param {Array<String} texts 
* @returns {LLSE_SimpleForm}
*/
LLSE_SimpleForm.prototype.addLabels = function (texts) {
    texts.forEach(text => this.addLabel(text)); return this
}

//Player
/**
* 发送更好的模式表单
* @param {String} title 
* @param {String} content 
* @param {String} confirmButton 
* @param {String} cancelButton 
* @param {String} confirmButtonImage 
* @param {String} cancelButtonImage 
* @param {Function} callback 
*/
LLSE_Player.prototype.sendBetterModalForm = function (title, content, confirmButton, cancelButton, confirmButtonImage, cancelButtonImage, callback) {
    var gui = mc.newSimpleForm().setTitle(title).setContent(content)
    gui.addButtons([confirmButton, cancelButton], [confirmButtonImage, cancelButtonImage])
    this.sendForm(gui, function (player, id) {
        if (id == null) return callback(player, id); else return callback(player, !id);
    })
};
/**
* 发送一个消息框表单
* @param {String} title 
* @param {String[]|String} contents 
* @param {String} buttonName 
* @param {String} buttonImage 
* @param {Function} callback 
*/
LLSE_Player.prototype.sendMessageForm = function (title, contents, buttonName, buttonImage, callback) {
    if (callback == null) callback = () => void 0
    var gui = mc.newSimpleForm().setTitle(title)
    if (contents instanceof Array) {
        gui.addLabels(contents)
    } else gui.setContent(contents)
    gui.addButton(buttonName, buttonImage)
    this.sendForm(gui, function (player, id) {
        return callback(player, id)
    })
}
//翻页表单
export class PageForm {
    /**
     * 创建翻页表单
     * @param {String} title 
     * @param {String} content 
     * @param {Object[]} items 
     * @param {Function} callback 
     */
    constructor(title, content, items, callback) {
        this.page = 1
        this.itemperpage = config.get("item_per_page") || 5
        this.maxPage = Math.ceil(items.length / this.itemperpage)
        this.title = title
        this.content = content
        this.items = items
        this.callback = callback
    }
    /**
     * 发送表单
     * @param {Player} player 玩家
     * @param {Number} page 页码
     * @param {Object[]} lastbuttons 末尾追加按钮
     * @param {Function} lastbuttonfunction 末尾追加按钮回调
     * @returns {Number} 发送的表单id
     */
    send(player, page = 1, lastbuttons, lastbuttonfunction) {
        if (!(player instanceof LLSE_Player)) return false
        const start = (page - 1) * this.itemperpage
        const end = Math.min(start + this.itemperpage, this.items.length)
        const items = this.items.slice(start, end)
        const gui = mc.newSimpleForm().setTitle(this.title).setContent(this.content.replaceAll("{page}", `${page}`).replaceAll("{totalPages}", `${this.maxPage}`))
        for (const item of items) {
            gui.addButton(item.text, item.image || "")
        }
        if (page > 1) {
            gui.addButton(lang.get("form.prev_page"), config.getIcon("form:prev"))
        }
        if (page < this.maxPage) {
            gui.addButton(lang.get("form.next_page"), config.getIcon("form:next"))
        }
        // gui.addButtons([lang.get("form.prev_page"), lang.get("form.next_page")], [config.get("icons")["form:prev"], config.get("icons")["form:next"]])
        for (const button of lastbuttons || []) {
            gui.addButton(button.text, button.image || "")
        }
        return player.sendForm(gui, (player, id) => {
            const index = id ? start + id : id;
            if (id == null) return
            if (id == items.length && page > 1) {
                return this.send(player, page - 1, lastbuttons, lastbuttonfunction)
            } else if (id == items.length + 1 && page < this.maxPage) {
                return this.send(player, page + 1, lastbuttons, lastbuttonfunction)
            } else if (id < items.length) return this.callback(player, index);
            else return lastbuttonfunction(player, id - items.length - 1);
        })
    }
    /**
     * 向玩家发送初始表单
     * @param {Player} player 
     * @param {Object[]} lastbuttons 
     * @param {Function} lastbuttonfunction 
     * @returns 
     */
    sendTo(player, lastbuttons, lastbuttonfunction) {
        return this.send(player, 1, lastbuttons, lastbuttonfunction)
    }
    /**
     * 创建一个分页表单
     * @param {String} title 
     * @param {String} content 
     * @param {Array} items 
     * @param {Array} images 
     * @param {Function} callback 
     */
    static create(title, content, items, images, callback) {
        const itemlist = []
        for (let i = 0; i < items.length; i++) {
            itemlist.push({ text: items[i], image: images[i] })
        }
        return new PageForm(title, content, itemlist, callback)
    }
}