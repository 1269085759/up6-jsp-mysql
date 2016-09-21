//错误类型
var DownloadErrorCode = {
      "0": "发送数据错误"
	, "1": "接收数据错误"
	, "2": "访问本地文件错误"
	, "3": "域名未授权"
	, "4": "文件大小超过限制"
	, "5": "地址为空"
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
        , fdTask: false
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
        //this.pButton.style.display = "none";
        this.ui.msg.text("正在下载队列中等待...");
        this.State = HttpDownloaderState.Ready;
    };

    this.addQueue = function ()
    {
        this.browser.addFile(this.fileSvr);
    };

    //方法-开始下载
    this.down = function ()
    {
        this.hideBtns();
        this.ui.btn.stop.show();
        this.ui.msg.text("开始连接服务器...");
        this.State = HttpDownloaderState.Posting;
        this.browser.addFile(this.fileSvr);
        this.Manager.start_queue();//下载队列
    };

    //方法-停止传输
    this.stop = function ()
    {
        this.hideBtns();
        this.ui.btn.down.show();
        //this.SvrUpdate();
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
    this.svr_update = function ()
    {
        if (this.fileSvr.idSvr == 0) return;

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
        //已记录将不再记录
        if (this.fileSvr.idSvr) return;
        var param = jQuery.extend({}, this.fields, this.fileSvr, { time: new Date().getTime() });
        jQuery.extend(param, {pathLoc:encodeURIComponent(this.fileSvr.pathLoc),nameLoc:encodeURIComponent(this.fileSvr.nameCustom)});

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
                _this.fileSvr.idSvr = json.idSvr;
                //文件已经下载完
                //if (_this.isComplete()) { _this.svr_delete(); }
            }
            , error: function (req, txt, err) { alert("创建信息失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    this.isComplete = function () { return this.State == HttpDownloaderState.Complete; };
    this.svr_delete = function ()
    {
        if (this.fileSvr.idSvr == 0) return;
        var param = jQuery.extend({}, this.fields,this.fileSvr, {time:new Date().getTime()});
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlDel"]
            , data: param
            , success: function (json)
            {
                //_this.fileSvr.idSvr = json.idSvr;
                //_this.fileSvr.uid = json.uid;
            }
            , error: function (req, txt, err) { alert("删除数据错误！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };

    this.down_complete = function ()
    {
        this.hideBtns();
        this.event.downComplete(this);//biz event
        //this.ui.btn.del.text("打开");
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.ui.msg.text("下载完成");
        this.State = HttpDownloaderState.Complete;
        //this.SvrDelete();
        this.Manager.filesCmp.push(this);

        if (this.fileSvr.idSvr > 0)
        {
            this.svr_delete();
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
        var msg = [json.sizeLoc , " ", json.speed, " ", json.time];
        this.ui.msg.text(msg.join(""));
    };

    //更新服务器进度
    this.down_part = function (json)
    {
        this.svr_update();
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