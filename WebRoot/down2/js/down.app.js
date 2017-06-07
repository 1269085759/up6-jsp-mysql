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
        var param = { name: "open_folder"};
        this.postMessage(param);
    }
    , openPath: function (f) {
        var param = { name: "open_path" };
        this.postMessage(param);
    }
    , openFile: function (f) {
        var param = { name: "open_file" };
        this.postMessage(param);
    }
    , addFile: function (f) {
        this.queueCount++;
        var param = { name: "add_file" };
        jQuery.extend(param, f);
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
        var param = { name: "stop_file", signSvr: f.signSvr};
        this.postMessage(param);
    }
    , startQueue: function () {
        var param = { name: "start_queue"};
        this.postMessage(param);
    }
    , stopQueue: function () {
        var param = { name: "stop_queue"};
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
