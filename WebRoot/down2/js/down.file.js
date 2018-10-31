//错误类型
var DownloadErrorCode = {
      "0": "发送数据错误"
	, "1": "接收数据错误"
	, "2": "访问本地文件错误"
	, "3": "域名未授权"
	, "4": "文件大小超过限制"
	, "5": "地址为空"
	, "6": "配置文件不存在"
    , "7": "本地目录不存在"
    , "8": "查询文件信息失败"
};
//状态
var HttpDownloaderState = {
    Ready: 0,
    Posting: 1,
    Stop: 2,
    Error: 3,
    GetNewID: 4,
    Complete: 5,
    WaitContinueUpload: 6,
    None: 7,
    Waiting: 8
};
//文件下载对象
function FileDownloader(fileLoc, mgr)
{
    var _this = this;
    this.ui = { msg: null, process: null, percent: null, btn: {del:null,cancel:null,down:null,stop:null},div:null,split:null};
    this.app = mgr.app;
    this.Manager = mgr;
    this.Config = mgr.Config;
    this.fields = jQuery.extend({},mgr.Config.Fields);//每一个对象自带一个fields幅本
    this.State = HttpDownloaderState.None;
    this.event = mgr.event;
    this.fileSvr = {
          id:""//
        , f_id:""
        , uid: this.fields["uid"]
        , nameLoc: ""//自定义文件名称
        , folderLoc: this.Config["Folder"]
        , pathLoc: ""
        , fileUrl: ""
        , lenLoc: 0
        , perLoc: "0%"
        , lenSvr: 0
        , sizeSvr:"0byte"
        , complete: false
        , fdTask: false
        , svrInit: false
    };
    var url = this.Config["UrlDown"] + "?" + this.Manager.to_params(this.fields);
    jQuery.extend(this.fileSvr, fileLoc, { fileUrl: url });//覆盖配置

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
        this.ui.btn.del.click(function () { _this.remove(); });
        this.ui.btn.stop.click(function () { _this.stop(); });
        this.ui.btn.down.click(function () { _this.Manager.allStoped = false; _this.down(); });
        this.ui.btn.cancel.click(function () { _this.remove(); });
        this.ui.btn.open.click(function () { _this.openFile(); });
        this.ui.btn.openFd.click(function () { _this.openPath(); });

        this.ui.btn.down.show();
        this.ui.btn.cancel.show();
        this.ui.ico.file.show();
        this.ui.ico.fd.hide();
        this.ui.msg.text("正在下载队列中等待...");
        this.State = HttpDownloaderState.Ready;
        this.Manager.add_wait(this.fileSvr.id);//添加到等待队列
    };
    //自定义配置,
    this.reset_fields = function (v)
    {
        if (v == null) return;
        jQuery.extend(this.fields, v);
        //单独拼接url
        var url = this.Config["UrlDown"] + "?" + this.Manager.to_params(this.fields);
        jQuery.extend(this.fileSvr, { fileUrl: url });//覆盖配置
    };

    //方法-开始下载
    this.down = function ()
    {
        this.Manager.add_work(this.fileSvr.id);
        if (this.fileSvr.svrInit) {
            this.hideBtns();
            this.ui.btn.stop.show();
            this.ui.msg.text("开始连接服务器...");
            this.State = HttpDownloaderState.Posting;
            this.Manager.remove_wait(this.fileSvr.id);
            this.app.downFile(this.fileSvr);//下载队列
        }
        else
        {
            this.svr_create();
        }
    };

    //方法-停止传输
    this.stop = function ()
    {
        this.hideBtns();
        this.svr_update();
        this.State = HttpDownloaderState.Stop;
        this.ui.msg.text("下载已停止");
        this.app.stopFile(this.fileSvr);
        this.Manager.del_work(this.fileSvr.id);//从工作队列中删除
    };

    this.remove = function ()
    {
        this.app.delFile({id:this.fileSvr.id});
        //从上传列表中删除
        this.ui.split.remove();
        this.ui.div.remove();
        this.Manager.remove_url(this.fileSvr.f_id);
        this.svr_delete();
    };

    this.openFile = function () {
        this.app.openFile(this.fileSvr);
    };

    this.openPath = function () {
        this.app.openPath(this.fileSvr);
    };
    this.init_complete = function (json)
    {
        jQuery.extend(this.fileSvr, json);
        if (!this.fileSvr.svrInit) this.svr_create();//
    };
    //在出错，停止中调用
    this.svr_update = function ()
    {
        var param = jQuery.extend({}, this.fields, this.fileSvr, { time: new Date().getTime() });
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

    //在服务端创建一个数据，用于记录下载信息，一般在HttpDownloader_BeginDown中调用
    this.svr_create = function ()
    {
        if (this.fileSvr.svrInit) return;
        //已记录将不再记录
        var param = jQuery.extend({}, this.fields, { time: new Date().getTime() });
        jQuery.extend(param, {
            id: this.fileSvr.id
            , pathLoc: encodeURIComponent(this.fileSvr.pathLoc)
            , nameLoc: encodeURIComponent(this.fileSvr.nameLoc)
            , lenSvr: this.fileSvr.lenSvr
            , sizeSvr: encodeURIComponent(this.fileSvr.sizeSvr)
            , fdTask: 0
        });

        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlCreate"]
            , data: param
            , success: function (msg)
            {
                if (msg.value == null) return;
                var json = JSON.parse(decodeURIComponent(msg.value));
                _this.fileSvr.svrInit = true;
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
        var param = jQuery.extend({}, this.fields, { id: this.fileSvr.id }, {time:new Date().getTime()});
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

    this.down_complete = function ()
    {
        this.Manager.filesCmp.push(this);
        this.Manager.del_work(this.fileSvr.id);//从工作队列中删除
        this.Manager.remove_wait(this.fileSvr.id);
        this.hideBtns();
        this.event.downComplete(this);//biz event
        this.ui.btn.open.show();
        this.ui.btn.openFd.show();
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.ui.msg.text("下载完成");
        this.State = HttpDownloaderState.Complete;
        this.svr_delete();
        setTimeout(function () { _this.Manager.down_next(); }, 500);
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
        this.ui.name.text(json.nameSvr);
        this.ui.name.attr("title", json.nameSvr);
        this.fileSvr.pathLoc = json.pathLoc;
    };

    this.down_process = function (json)
    {
        this.fileSvr.lenLoc = json.lenLoc;//保存进度
        this.fileSvr.perLoc = json.percent;
        this.ui.percent.text("("+json.percent+")");
        this.ui.process.css("width", json.percent);
        var msg = [json.lenRecv , " ", json.speed, " ", json.time];
        this.ui.msg.text(msg.join(""));
    };

    this.down_begin = function (json)
    {
        var lenSvr = this.fileSvr.lenSvr;
        var filePart = this.Config["FilePart"];
        if (lenSvr > filePart && 0==this.fileSvr.idSvr)
        {
            this.svr_create();
        }
    };

    this.down_error = function (json)
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        this.event.downError(this, json.code);//biz event
        this.ui.msg.text(DownloadErrorCode[json.code+""]);
        this.State = HttpDownloaderState.Error;
        this.Manager.del_work(this.fileSvr.id);//从工作队列中删除
        this.Manager.add_wait(this.fileSvr.id);
    };

    this.down_stoped = function (json)
    {
        this.hideBtns();
        this.ui.btn.down.show();
        this.ui.btn.del.show();
        this.Manager.del_work(this.fileSvr.id);//从工作队列中删除
        this.Manager.add_wait(this.fileSvr.id);
    };
}