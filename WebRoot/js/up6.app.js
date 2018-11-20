var up6_app = {
    ins: null
    ,edgeApp: null
    ,Config:null
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
		acx += '<object id="objHttpPartition" classid="clsid:' + this.Config.ie.part.clsid + '"';
        acx += ' codebase="' + this.Config.ie.path + '" width="1" height="1" ></object>';

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
        document.addEventListener('Uploader6EventCallBack', function (evt)
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
        this.postMessage(par);
    }
    , exitEvent: function ()
    {
        var obj = this;
        $(window).bind("beforeunload", function () { obj.exit(); });
    }
    , addFile: function (json)
    {
        var param = { name: "add_file", config: this.Config };
        jQuery.extend(param, json);
        this.postMessage(param);
    }
    , addFolder: function (json) {
        var param = { name: "add_folder", config: this.Config };
        jQuery.extend(param, json);
        this.postMessage(param);
    }
    , openFiles: function ()
    {
        var param = { name: "open_files", config: this.Config };
        this.postMessage(param);
    }
    , openFolders: function ()
    {
        var param = { name: "open_folders", config: this.Config };
        this.postMessage(param);
    }
    , pasteFiles: function ()
    {
        var param = { name: "paste_files", config: this.Config };
        this.postMessage(param);
    }
    , checkFile: function (f)
    {
        var param = { name: "check_file", config: this.Config };
        jQuery.extend(param, f);
        this.postMessage(param);
    }
    , checkFolder: function (fd)
    {
        var param = { name: "check_folder", config: this.Config };
        jQuery.extend(param, fd);
        param.name = "check_folder";
        this.postMessage(param);
    }
    , scanFolder: function (fd) {
        var param = { name: "scan_folder"};
        jQuery.extend(param, fd);
        this.postMessage(param);
    }
    , checkFolderNat: function (fd)
    {
        var param = { name: "check_folder", config: this.Config, folder: JSON.stringify(fd) };
        this.postMessage(param);
    }
    , postFile: function (f)
    {
        var param = { name: "post_file", config: this.Config };
        jQuery.extend(param, f);
        this.postMessage(param);
    }
    , postFolder: function (fd)
    {
        var param = { name: "post_folder", config: this.Config };
        jQuery.extend(param, fd);
        param.name = "post_folder";
        this.postMessage(param);
    }
    , updateFolder: function (fd) {
        var param = { name: "update_folder"};
        jQuery.extend(param, fd);
        this.postMessage(param);
    }
    , delFolder: function (v)
    {
        var param = { name: "del_folder"};
        jQuery.extend(param, v);
        this.postMessage(param);
    }
    , stopFile: function (f)
    {
        var param = jQuery.extend({},f,{ name: "stop_file"});
        this.postMessage(param);
    }
    , delFile: function (f) {
        var param = { name: "del_file", id: f.id};
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
        } catch (e) { }
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
