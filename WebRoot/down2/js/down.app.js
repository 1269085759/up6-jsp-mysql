var up6_app = {
    ins: null
    ,edgeApp: null
    , Config: null
    , queueCount:0
    , checkFF: function ()
    {
        var mimetype = navigator.mimeTypes;
        if (typeof mimetype == "object" && mimetype.length)
        {
            for (var i = 0; i < mimetype.length; i++)
            {
                var enabled = mimetype[i].type == this.Config.firefox.type;
                if (!enabled) enabled = mimetype[i].type == this.Config.firefox.type.toLowerCase();
                if (enabled) return mimetype[i].enabledPlugin;
            }
        }
        else
        {
            mimetype = [this.Config.firefox.type];
        }
        if (mimetype)
        {
            return mimetype.enabledPlugin;
        }
        return false;
    }
	, Setup: function ()
	{
		//文件夹选择控件
        acx += '<object id="downPart" classid="clsid:' + this.Config.ClsidPart + '"';
        acx += ' codebase="' + this.Config.CabPath + '" width="1" height="1" ></object>';

		$("body").append(acx);
	}
    , init: function ()
    {
        var param = { name: "init", config: this.Config };
        this.postMessage(param);
    }
    , initNat: function ()
    {
        if (!this.chrome45) return;
        this.exitEvent();
        document.addEventListener('Down3EventCallBack', function (evt)
        {
            this.recvMessage(JSON.stringify(evt.detail));
        });
    }
    , initEdge: function ()
    {
        this.edgeApp.run();
    }
    , exit: function ()
    {
        var par = { name: 'exit' };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(this.entID, true, false, par);
        document.dispatchEvent(evt);
    }
    , exitEvent: function ()
    {
        var obj = this;
        $(window).bind("beforeunload", function () { obj.exit(); });
    }
    , openFolder: function () {
        var param = { name: "open_folder" };
        this.postMessage(param);
    }
    , openPath: function (f) {
        var param = jQuery.extend({},f,{ name: "open_path" });
        this.postMessage(param);
    }
    , openFile: function (f) {
        var param = jQuery.extend(param, f, { name: "open_file" });
        this.postMessage(param);
    }
    , openChild: function (f) {
        var param = jQuery.extend(param, f, { name: "open_child" });
        this.postMessage(param);
    }
    , addUrl: function (f) {
        this.queueCount++;
        var param = jQuery.extend(param, f, { name: "add_url" });
        this.postMessage(param);
    }
    , addUrls: function (f) {
        this.queueCount++;
        var param = jQuery.extend(param, { name: "add_urls", urls: f });
        this.postMessage(param);
    }
    , addJson: function (f) {
        this.queueCount++;
        var param = { name: "add_json" };
        jQuery.extend(param, f);
        this.postMessage(param);
    }
    , downFile: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "down_file" });
        this.postMessage(param);
    }
    , downFolder: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "down_folder" });
        this.postMessage(param);
    }
    , downUrl: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "down_url" });
        this.postMessage(param);
    }
    , downUrls: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "down_urls" });
        this.postMessage(param);
    }
    , downJson: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "down_json" });
        this.postMessage(param);
    }
    , initFile: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "init_file" });
        this.postMessage(param);
    }
    , initFolder: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "init_folder" });
        this.postMessage(param);
    }
    , addFile: function (f) {
        this.queueCount++;
        var param = jQuery.extend({}, f, { name: "add_file" });
        this.postMessage(param);
    }
    , addFolder: function (f) {
        this.queueCount++;
        var param = { name: "add_folder"};
        jQuery.extend(param, f, { name: "add_folder" });
        this.postMessage(param);
    }
    , stopFile: function (f) {
        this.queueCount--;
        var param = { name: "stop_file", id: f.id};
        this.postMessage(param);
    }
    , delFile: function (f) {
        this.queueCount--;
        var param = { name: "del_file", id: f.id};
        this.postMessage(param);
    }
    , postMessage:function(json)
    {
        try {
            this.ins.parter.postMessage(JSON.stringify(json));
        } catch (e) { console.log("调用postMessage失败，请检查控件是否安装成功");}
    }
    , postMessageNat: function (par)
    {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(this.entID, true, false, par);
        document.dispatchEvent(evt);
    }
    , postMessageEdge: function (par)
    {
        this.edgeApp.send(par);
    }
};
