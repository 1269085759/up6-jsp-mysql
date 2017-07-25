﻿function FdDownloader(fileLoc, mgr)
{
    var _this = this;
    this.ui = { msg: null, process: null, percent: null, btn: {del:null,cancel:null,down:null,stop:null},div:null,split:null};
    this.svr_inited = false;
    this.app = mgr.app;
    this.Manager = mgr;
    this.Config = mgr.Config;
    this.fields = jQuery.extend({},mgr.Config.Fields);//每一个对象自带一个fields幅本
    this.State = HttpDownloaderState.None;
    this.event = mgr.event;
    this.fileSvr = {
          id:""//
        , uid: this.fields["uid"]
        , nameLoc: ""//自定义文件名称
        , folderLoc: this.Config["Folder"]
        , pathLoc: ""
        , fileUrl: ""
        , cmpCount: 0
        , fileCount: 0
        , lenLoc: 0
        , perLoc: "0%"
        , lenSvr: 0
        , sizeSvr:"0byte"
        , complete: false
        , fdTask: true
        , files:null
    };
    var url = this.Config["UrlDown"] + "?" + this.Manager.to_params(this.fields)
    jQuery.extend(this.fileSvr, fileLoc, {fileUrl:url});//覆盖配置

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

    //加载文件列表
    this.load_files = function ()
    {
        //已记录将不再记录
        if (this.svr_inited) return;
        this.ui.btn.down.hide();
        this.ui.msg.text("开始加载文件列表...");
        var param = jQuery.extend({}, this.fields, { time: new Date().getTime() });
        jQuery.extend(param, { id: this.fileSvr.f_id});
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlFdData"]
            , data: param
            , success: function (msg) {
                var json = JSON.parse(decodeURIComponent(msg.value));
                jQuery.extend(true, _this.fileSvr, { files: json });
                _this.ui.msg.text("初始文件夹...");
                setTimeout(function () {
                    _this.app.initFolder(_this.fileSvr);
                }, 300);
                
            }
            , error: function (req, txt, err) { alert("创建信息失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    //方法-开始下载
    this.down = function ()
    {
        this.hideBtns();
        this.ui.btn.stop.show();
        this.ui.msg.text("开始连接服务器...");
        this.State = HttpDownloaderState.Posting;        
        this.app.addFolder(this.fileSvr);
        this.Manager.start_queue();//下载队列
    };

    //方法-停止传输
    this.stop = function ()
    {
        this.svr_update();
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        this.State = HttpDownloaderState.Stop;
        this.ui.msg.text("下载已停止");
        this.app.stopFile(this.fileSvr);
    };

    this.remove = function ()
    {
        this.app.stopFile({id:this.fileSvr.id});
        //从上传列表中删除
        this.ui.split.remove();
        this.ui.div.remove();
        this.svr_delete();
    };

    this.open = function ()
    {
        this.app.openPath({ id: this.fileSvr.id, path: this.fileSvr.pathLoc });
    };

    this.init_complete = function (json)
    {
        jQuery.extend(this.fileSvr, json, {files:null});
        if (!this.svr_inited)
        {
            setTimeout(function () {_this.svr_create(); }, 200);
        }   
    };

    //在出错，停止中调用
    this.svr_update = function (json)
    {
        var param = jQuery.extend({}, this.fields, { time: new Date().getTime() });
        jQuery.extend(param, { id: this.fileSvr.id, lenLoc: this.fileSvr.lenLoc, perLoc: encodeURIComponent(this.fileSvr.perLoc) });

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
        if (this.svr_inited) return;
        this.ui.btn.down.hide();
        this.ui.msg.text("正在创建任务...");
        var param = jQuery.extend({}, this.fields, {time: new Date().getTime() });
        jQuery.extend(param, {
              id: this.fileSvr.id
            , uid: this.fileSvr.uid
            , nameLoc: encodeURIComponent(this.fileSvr.nameLoc)
            , pathLoc: encodeURIComponent(this.fileSvr.pathLoc)
            , lenSvr: this.fileSvr.lenSvr
            , sizeSvr: this.fileSvr.sizeSvr
            , fdTask: 1
        });
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlCreate"]
            , data: param
            , success: function (msg)
            {
                _this.ui.btn.down.show();
                _this.ui.msg.text("初始化完毕...");
                _this.svr_inited = true;
                _this.svr_create_cmp();
            }
            , error: function (req, txt, err) { alert("创建信息失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };
    this.svr_create_cmp = function () {
        setTimeout(function () {
            _this.down();
        }, 200);
    };
    this.isComplete = function () { return this.State == HttpDownloaderState.Complete; };
    this.svr_delete = function ()
    {
        var param = jQuery.extend({}, this.fields,{id:this.fileSvr.id,time:new Date().getTime()});
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
        this.hideBtns();
        this.event.downComplete(this);//biz event
        this.ui.btn.open.show();
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.ui.msg.text("文件数：" + json.fileCount + " 成功：" + json.cmpCount);
        this.State = HttpDownloaderState.Complete;
        this.Manager.filesCmp.push(this);
        this.svr_delete();
    };

    this.down_process = function (json)
    {
        this.fileSvr.lenLoc = json.lenLoc;//保存进度
        this.fileSvr.perLoc = json.percent;
        this.ui.percent.text("("+json.percent+")");
        this.ui.process.css("width", json.percent);
        var msg = [json.index, "/", json.fileCount, " ", json.sizeLoc, " ", json.speed, " ", json.time];
        this.ui.msg.text(msg.join(""));
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
        this.svr_update();
    };

    this.down_stoped = function (json)
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
    };
}