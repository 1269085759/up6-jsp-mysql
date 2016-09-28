function FdDownloader(fileLoc, mgr)
{
    var _this = this;
    this.ui = { msg: null, process: null, percent: null, btn: {del:null,cancel:null,down:null,stop:null},div:null,split:null};
    this.browser = mgr.browser;
    this.Manager = mgr;
    this.Config = mgr.Config;
    this.fields = jQuery.extend({},mgr.Fields);//每一个对象自带一个fields幅本
    this.State = HttpDownloaderState.None;
    this.event = mgr.event;
    this.fileSvr = {
          id:0//累加，唯一标识
        , idSvr: 0
        , uid: 0
        , nameLoc: ""//自定义文件名称
        , folderLoc: this.Config["Folder"]
        , pathLoc: ""
        , fileUrl:""
        , lenLoc: 0
        , perLoc: "0%"
        , lenSvr: 0
        , sizeSvr:"0byte"
        , complete: false
        , errors: 0
        , success:0
        , fdTask: true
        ,files:null
    };
    jQuery.extend(this.fileSvr, fileLoc);//覆盖配置

    this.hideBtns = function ()
    {
        $.each(this.ui.btn, function (i, n)
        {
            $(n).hide();
        });
    };

    //方法-准备
    this.ready = function ()
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.cancel.show();
        this.ui.msg.text("正在下载队列中等待...");
        this.State = HttpDownloaderState.Ready;
    };

    //初始化文件,url
    this.initFiles = function ()
    {
        var l = this.fileSvr.files.length;
        for(var i = 0 ;i<l;++i)
        {
            this.fileSvr.files[i].fileUrl = this.Config["UrlDown"] + "?fid=" + this.fileSvr.files[i].idSvr;
            jQuery.extend(this.fileSvr.files[i], { id: i });
            this.fileSvr.files[i].idSvr = 0;//
            this.fileSvr.idSvr = 0;
        }
    };

    this.addQueue = function ()
    {
        this.browser.addFolder(this.fileSvr);
    };

    //方法-开始下载
    this.down = function ()
    {
        this.hideBtns();
        this.ui.btn.stop.show();
        this.ui.msg.text("开始连接服务器...");
        this.State = HttpDownloaderState.Posting;        
        this.browser.addFolder(this.fileSvr);
        this.Manager.start_queue();//下载队列
    };

    //方法-停止传输
    this.stop = function ()
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        this.State = HttpDownloaderState.Stop;
        this.ui.msg.text("下载已停止");
        this.browser.stopFile(this.fileSvr);
    };

    this.remove = function ()
    {
        this.browser.stopFile(this.fileSvr);
        //从上传列表中删除
        this.ui.split.remove();
        this.ui.div.remove();
        this.Manager.remove_url(this.fileSvr.fileUrl);
        this.svr_delete();
    };

    this.open = function ()
    {
        this.browser.openFile(this.fileSvr);
    };

    this.openPath = function ()
    {
        this.browser.openPath(this.fileSvr);
    };

    //在出错，停止中调用
    this.svr_update = function (json)
    {
        if (this.fileSvr.idSvr == 0) return;

        var param = jQuery.extend({}, this.fields, { time: new Date().getTime() });
        jQuery.extend(param, { idSvr: this.fileSvr.idSvr, lenLoc: this.fileSvr.lenLoc, perLoc: this.fileSvr.perLoc });
        //子文件
        var f = this.fileSvr.files[json.file.id];        
        jQuery.extend(param, { file_id: f.idSvr, file_lenLoc: f.lenLoc, file_per: f.perLoc });

        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlUpdate"]
            , data: param
            , success: function (msg) { }
            , error: function (req, txt, err) { alert("更新下载信息失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    //添加记录
    this.svr_create = function ()
    {
        //已记录将不再记录
        if (this.fileSvr.idSvr) return;
        this.ui.btn.down.hide();
        this.ui.msg.text("正在初始化...");
        var param = jQuery.extend({}, this.fields, {time: new Date().getTime() });
        jQuery.extend(param, {folder: encodeURIComponent(JSON.stringify(this.fileSvr) ) });
        var ptr = this;
        $.ajax({
            type: "POST"
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlFdCreate"]
            , data: param
            , success: function (msg)
            {
                var json = JSON.parse(decodeURIComponent(msg));
                jQuery.extend(true,_this.fileSvr, json);
                ptr.ui.btn.down.show();
                ptr.ui.msg.text("初始化完毕...");
            }
            , error: function (req, txt, err) { alert("创建信息失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    this.isComplete = function () { return this.State == HttpDownloaderState.Complete; };
    this.svr_delete = function ()
    {
        if (this.fileSvr.idSvr == 0) return;
        var param = jQuery.extend({}, this.fields,{idSvr:this.fileSvr.idSvr,time:new Date().getTime()});
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlDel"]
            , data: param
            , success: function (json){}
            , error: function (req, txt, err) { alert("删除数据错误！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    this.svr_delete_file = function (f_id)
    {
        var param = jQuery.extend({}, this.fields, {idSvr:f_id, time: new Date().getTime() });

        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlDel"]
            , data: param
            , success: function (json) { }
            , error: function (req, txt, err) { alert("删除数据错误！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    this.down_complete = function (json)
    {
        //所有文件下载完毕
        if (json.all)
        {
            this.hideBtns();
            this.event.downComplete(this);//biz event
            //this.ui.btn.del.text("打开");
            this.ui.process.css("width", "100%");
            this.ui.percent.text("(100%)");
            this.ui.msg.text("文件数："+this.fileSvr.files.length+" 成功："+this.fileSvr.success);
            this.State = HttpDownloaderState.Complete;
            //this.SvrDelete();
            this.Manager.filesCmp.push(this);

            if (this.fileSvr.idSvr > 0)
            {
                this.svr_delete();
            }
        }
        else
        {
            var f = this.fileSvr.files[json.file.id];
            f.complete = true;
            f.lenLoc = f.lenSvr;
            this.fileSvr.success = json.success;
            this.svr_delete_file(f.idSvr);
        }
    };

    this.down_recv_size = function (json)
    {
        this.ui.size.text(json.size);
        this.fileSvr.sizeSvr = json.size;
        this.fileSvr.lenSvr = json.len;
    };

    this.down_recv_name = function (json)
    {
        this.hideBtns();
        this.ui.btn.stop.show();
        //this.ui.name.text(json.nameSvr);
        //this.ui.name.attr("title", json.nameSvr);
        //this.fileSvr.pathLoc = json.pathLoc;
    };

    this.down_process = function (json)
    {
        this.fileSvr.lenLoc = json.lenLoc;//保存进度
        this.fileSvr.perLoc = json.percent;
        //更新文件进度
        this.fileSvr.files[json.file.id];
        this.fileSvr.files[json.file.id].lenLoc = json.file.lenLoc;
        this.fileSvr.files[json.file.id].percent = json.file.percent;

        this.ui.percent.text("("+json.percent+")");
        this.ui.process.css("width", json.percent);
        var msg = [json.file.id + 1, "/", this.fileSvr.files.length, " ", json.sizeLoc, " ", json.speed, " ", json.time];
        this.ui.msg.text(msg.join(""));
    };

    //更新服务器进度
    this.down_part = function (json)
    {
        this.svr_update(json);
    };

    this.init_end = function (json)
    {
        jQuery.extend(true,this.fileSvr, json);
        this.svr_create();//添加记录
    };

    this.down_begin = function (json)
    {
    };

    this.down_error = function (json)
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        this.event.downError(this, json.code);//biz event
        this.ui.msg.text(DownloadErrorCode[json.code+""]);
        this.State = HttpDownloaderState.Error;
        //this.SvrUpdate();
    };

    this.down_stoped = function (json)
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        //this.svr_update();
    };
}