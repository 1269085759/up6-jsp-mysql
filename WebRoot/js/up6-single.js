/*
	版权所有 2009-2016 荆门泽优软件有限公司
	保留所有权利
	官方网站：http://www.ncmem.com/
	产品首页：http://www.ncmem.com/webplug/http-uploader6/
	产品介绍：http://www.cnblogs.com/xproer/archive/2012/05/29/2523757.html
	开发文档-ASP：http://www.cnblogs.com/xproer/archive/2012/02/17/2355458.html
	开发文档-PHP：http://www.cnblogs.com/xproer/archive/2012/02/17/2355467.html
	开发文档-JSP：http://www.cnblogs.com/xproer/archive/2012/02/17/2355462.html
	开发文档-ASP.NET：http://www.cnblogs.com/xproer/archive/2012/02/17/2355469.html
	升级日志：http://www.cnblogs.com/xproer/archive/2012/02/17/2355449.html
	证书补丁：http://www.ncmem.com/download/WoSignRootUpdate.rar
	VC运行库：http://www.microsoft.com/en-us/download/details.aspx?id=29
	联系信箱：1085617561@qq.com
	联系QQ：1085617561
    更新记录：
        2015-08-01 优化
*/
var HttpUploaderErrorCode = {
    "0": "发送数据错误"
	, "1": "接收数据错误"
	, "2": "访问本地文件错误"
	, "3": "域名未授权"
	, "4": "文件大小超过限制"
	, "5": "文件大小为0"
};

//删除元素值
Array.prototype.remove = function(val)
{
	for (var i = 0, n = 0; i < this.length; i++)
	{
		if (this[i] != val)
		{
			this[n++] = this[i]
		}
	}
	this.length -= 1
}
function debugMsg(v) { }
/*
	2009-11-5 文件管理类
	属性：
		UpFileList
*/
function HttpUploaderMgr()
{
	var _this = this;
	this.Config = {
		  "EncodeType"		: "utf-8"
		, "Company"			: "荆门泽优软件有限公司"
		, "Version"			: "2,7,108,51163"
		, "License"			: ""//
		, "Authenticate"	: ""//域验证方式：basic,ntlm
		, "AuthName"		: ""//域帐号
		, "AuthPass"		: ""//域密码
        , "CryptoType"      : "md5"//验证方式：md5,sha1,crc
		, "FileFilter"		: "*"//文件类型。所有类型：*。自定义类型：jpg,bmp,png,gif,rar,zip,7z,doc
		, "FileSizeLimit"	: "0"//自定义允许上传的文件大小，以字节为单位。0表示不限制。字节计算工具：http://www.beesky.com/newsite/bit_byte.htm
		, "FilesLimit"		: "0"//文件选择数限制。0表示不限制
		, "AllowMultiSelect": false//多选开关。1:开启多选。0:关闭多选
		, "RangeSize"		: "1048576"//文件块大小，以字节为单位。必须为64KB的倍数。推荐大小：1MB。
		, "Debug"			: false//是否打开调式模式。true,false
		, "LogFile"			: "F:\\log.txt"//日志文件路径。需要先打开调试模式。
		, "InitDir"			: ""//初始化路径。示例：D:\\Soft
		, "AppPath"			: ""//网站虚拟目录名称。子文件夹 web
        , "Cookie"			: ""//服务器cookie
		//文件夹操作相关
		, "UrlFdCreate"		: "http://localhost:8080/Uploader6.3Oracle/db/fd_create.jsp"
		, "UrlFdComplete"	: "http://localhost:8080/Uploader6.3Oracle/db/fd_complete.jsp"
		, "UrlFdDel"	    : "http://localhost:8080/Uploader6.3Oracle/db/fd_del.jsp"
		//文件操作相关
		, "UrlCreate"		: "http://localhost:8080/Uploader6.3Oracle/db/f_create.jsp"
		, "UrlPost"			: "http://localhost:8080/Uploader6.3Oracle/db/f_post.jsp"
        , "UrlProcess"		: "http://localhost:8080/Uploader6.3Oracle/db/f_process.jsp"
		, "UrlComplete"		: "http://localhost:8080/Uploader6.3Oracle/db/f_complete.jsp"
		, "UrlList"			: "http://localhost:8080/Uploader6.3Oracle/db/f_list.jsp"
		, "UrlDel"			: "http://localhost:8080/Uploader6.3Oracle/db/f_del.jsp"
	    //x86
        , ie: {
              drop: { clsid: "0868BADD-C17E-4819-81DE-1D60E5E734A6", name: "Xproer.HttpDroper6" }
            , part: { clsid: "BA0B719E-F4B7-464b-A664-6FC02126B652", name: "Xproer.HttpPartition6" }
            , path: "http://www.ncmem.com/download/up6.2/guid/up6.cab"
        }
	    //x64
        , ie64: {
              drop: { clsid: "7B9F1B50-A7B9-4665-A6D1-0406E643A856", name: "Xproer.HttpDroper6x64" }
            , part: { clsid: "307DE0A1-5384-4CD0-8FA8-500F0FFEA388", name: "Xproer.HttpPartition6x64" }
            , path: "http://www.ncmem.com/download/up6.2/guid/up64.cab"
        }
        , firefox: { name: "", type: "application/npHttpUploader6", path: "http://www.ncmem.com/download/up6.2/guid/up6.xpi" }
        , chrome: { name: "npHttpUploader6", type: "application/npHttpUploader6", path: "http://www.ncmem.com/download/up6.2/guid/up6.crx" }
        , chrome45: { name: "com.xproer.up6", path: "http://www.ncmem.com/download/up6.2/guid/up6.nat.crx" }
        , edge: {protocol:"up6",port:9100,visible:false}
        , exe: { path: "http://www.ncmem.com/download/up6.2/guid/up6.exe" }
		, "SetupPath": "http://localhost:4955/demoAccess/js/setup.htm"
        , "Fields": {"uname": "test","upass": "test","uid":"0","fid":"0"}
	};

    //biz event
	this.event = {
	      "md5Complete": function (obj/*HttpUploader对象*/, md5) { }
        , "fileComplete": function (obj/*文件上传完毕，参考：HttpUploader*/) { }
        , "fdComplete": function (obj/*文件夹上传完毕，参考：FolderUploader*/) { }
	};

    //http://www.ncmem.com/
	this.Domain = "http://" + document.location.host;

	this.FileFilter = new Array(); //文件过滤器
	this.idCount = 1; 	//上传项总数，只累加
	this.filesMap = new Object(); //本地文件列表映射表
	this.parter = null;
	this.fileItem = null;//jquery object
	this.fileCur = null;//当前文件上传项
	this.btnSetup = null;
	this.uiContainer = null;//显示上传信息的容器
	//检查版本 Win32/Win64/Firefox/Chrome
	var browserName = navigator.userAgent.toLowerCase();
	this.ie = browserName.indexOf("msie") > 0;
    //IE11检查
	this.ie = this.ie ? this.ie : browserName.search(/(msie\s|trident.*rv:)([\w.]+)/) != -1;
	this.firefox = browserName.indexOf("firefox") > 0;
	this.chrome = browserName.indexOf("chrome") > 0;
	this.chrome45 = false;
	this.nat_load = false;
	this.edge_load = false;
	this.chrVer = navigator.appVersion.match(/Chrome\/(\d+)/);
	this.ffVer = navigator.userAgent.match(/Firefox\/(\d+)/);
	this.edge = navigator.userAgent.indexOf("Edge") > 0;
    this.edgeApp = new WebServer(this);
    this.app = up6_app;
    this.app.edgeApp = this.edgeApp;
    this.app.Config = this.Config;
    this.app.ins = this;
    if (this.edge) { this.ie = this.firefox = this.chrome = this.chrome45 = false; }

	this.open_files = function (json)
	{
	    var f = null;
	    for (var i = 0, l = json.files.length; i < l; ++i)
	    {
	        f = this.addFileLoc(json.files[i]);
	    }
	    setTimeout(function () { f.post(); },500);
	};
	this.open_folders = function (json)
	{
	    this.addFolderLoc(json);
	    //setTimeout(function () { _this.PostFirst(); }, 500);
	};
	this.paste_files = function (json)
	{
	    for (var i = 0, l = json.files.length; i < l; ++i)
	    {
	        this.addFileLoc(json.files[i]);
	    }
	};
	this.post_process = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.post_process(json);
	};
	this.post_error = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.post_error(json);
	};
	this.post_complete = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.post_complete(json);
    };
    this.post_stoped = function (json) {
        var p = this.filesMap[json.id];
        p.post_stoped(json);
    };
	this.md5_process = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.md5_process(json);
	};
	this.md5_complete = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.md5_complete(json);
	};
	this.md5_error = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.md5_error(json);
	};
    this.load_complete = function (json) {
        this.btnSetup.hide();
        var needUpdate = true;
        if (typeof (json.version) != "undefined") {
            if (json.version == this.Config.Version) {
                needUpdate = false;
            }
        }
        if (needUpdate) this.update_notice();
        else { this.btnSetup.hide(); }
    };
    this.load_complete_edge = function (json) {
        this.edge_load = true;
        this.btnSetup.hide();
        _this.app.init();
    };
	this.recvMessage = function (str)
	{
	    var json = JSON.parse(str);
	         if (json.name == "open_files") { _this.open_files(json); }
	    else if (json.name == "open_folders") { _this.open_folders(json); }
	    else if (json.name == "paste_files") { _this.paste_files(json); }
	    else if (json.name == "post_process") { _this.post_process(json); }
	    else if (json.name == "post_error") { _this.post_error(json); }
	    else if (json.name == "post_complete") { _this.post_complete(json); }
	    else if (json.name == "post_stoped") { _this.post_stoped(json); }
	    else if (json.name == "md5_process") { _this.md5_process(json); }
	    else if (json.name == "md5_complete") { _this.md5_complete(json); }
	    else if (json.name == "md5_error") { _this.md5_error(json); }
        else if (json.name == "load_complete") { _this.load_complete(json); }
	    else if (json.name == "load_complete_edge") { _this.load_complete_edge(json); }
    };

	this.checkBrowser = function ()
	{
	    //Win64
	    if (window.navigator.platform == "Win64")
	    {
	        jQuery.extend(this.Config.ie, this.Config.ie64);
	    }
	    if (this.firefox)
	    {
	        if (!this.app.checkFF() || parseInt(this.ffVer[1]) >= 50)//仍然支持npapi
            {
                this.edge = true;
                this.app.postMessage = this.app.postMessageEdge;
                this.edgeApp.run = this.edgeApp.runChr;
            }
        }
        else if (this.chrome) {
            this.app.check = this.app.checkFF;
            jQuery.extend(this.Config.firefox, this.Config.chrome);
            //_this.Config["XpiPath"] = _this.Config["CrxPath"];
            //_this.Config["XpiType"] = _this.Config["CrxType"];
            //44+版本使用Native Message
            if (parseInt(this.chrVer[1]) >= 44) {
                _this.firefox = true;
                if (!this.app.checkFF())//仍然支持npapi
                {
                    this.edge = true;
                    this.app.postMessage = this.app.postMessageEdge;
                    this.edgeApp.run = this.edgeApp.runChr;
                }
            }
        }
        else if (this.edge) {
            this.app.postMessage = this.app.postMessageEdge;
        }
	};
    this.checkBrowser();
    //升级通知
    this.update_notice = function () {
        this.btnSetup.text("升级控件");
        this.btnSetup.css("color", "red");
        this.btnSetup.show();
    };
	//安全检查，在用户关闭网页时自动停止所有上传任务。
	this.SafeCheck = function()
	{
		$(window).bind("beforeunload", function()
		{
			if (null != _this.fileCur)
			{
			    if (_this.fileCur.State == HttpUploaderState.Posting)
			    {
			        event.returnValue = "您还有程序正在运行，确定关闭？";
			    }
			}
		});

		$(window).bind("unload", function()
		{ 
		    if (null != _this.fileCur)
		    {
		        if (_this.fileCur.State == HttpUploaderState.Posting)
		        {
		            _this.fileCur.Stop();
		        }
			}
		});
	};
    		
	//文件上传面板。
	this.GetHtml = function()
	{
		//加载拖拽控件
        var acx = '<embed name="ffParter" type="' + this.Config.firefox.type + '" pluginspage="' + this.Config.firefox.path + '" width="1" height="1"/>';
		//文件夹选择控件
        acx += '<object name="parter" classid="clsid:' + this.Config.ie.part.clsid + '"';
        acx += ' codebase="' + this.Config.ie.path + '#version=' + this.Config.Version + '" width="1" height="1" ></object>';
		//
	    //上传列表项模板
		acx += '<div class="file-item file-item-single" name="fileItem" >\
                    <div class="img-box"><p><img src="js/file.png"/></p></div>\
		            <div class="area-l">\
						<div name="fileName" class="name">HttpUploader程序开发.pdf</div>\
						<div name="percent" class="percent">(35%)</div>\
						<div name="fileSize" class="size" child="1">1000.23MB</div>\
						<div class="process-border"><div name="process" class="process"></div></div>\
						<div name="msg" class="msg top-space">15.3MB 20KB/S 10:02:00</div>\
					</div>\
					<div class="area-r">\
                        <a class="btn-box" name="cancel" title="取消"><img src="js/stop.png"/><div>取消</div></a>\
                        <a class="btn-box hide" name="post" title="继续"><img src="js/post.png"/><div>继续</div></a>\
						<a class="btn-box hide" name="stop" title="停止"><img src="js/stop.png"/><div>停止</div></a>\
						<a class="btn-box hide" name="del" title="删除"><img src="js/del.png"/><div>删除</div></a>\
					</div>\
		        </div>';
		return acx;
	};

	this.loadAuto = function ()
	{
	    var html 		= this.GetHtml();
	    var dom 		= $(document.body).append(html);
        $(function () {
            _this.initUI(dom);
        });
		
	};

	//加截容器，上传面板，文件列表面板
	this.loadTo = function (oid)
	{
	    var html 		= this.GetHtml();
        var dom = $("#" + oid).html(html);
        $(function () {
            _this.initUI(dom);
        });		
	};
	
	this.initUI = function (dom)
	{
        this.fileItem = dom.find('div[name="fileItem"]');
        this.parter = dom.find('embed[name="ffParter"]').get(0);
        this.ieParter = dom.find('object[name="parter"]').get(0);
        this.btnSetup = $("#btnSetup");
        this.btnSetup.attr("href", this.Config.exe.path);
	    this.SafeCheck();

        $(function () {
            if (!_this.edge) {
                if (_this.ie) {
                    _this.parter = _this.ieParter;
                }
                _this.parter.recvMessage = _this.recvMessage;
            }

            if (_this.edge) {
                _this.edgeApp.run();
            }
            else {
                _this.app.init();
            }
        });
	};

    //oid,显示上传项的层ID
	this.postAuto = function (oid)
	{
		var file_free = this.fileCur != null;
		if(file_free)
		{
			file_free = this.fileCur.State == HttpUploaderState.Complete;
			if(!file_free) file_free = this.fileCur.State == HttpUploaderState.Error;			
		}		
		if(this.fileCur == null) file_free = true;
		if(file_free)
		{
			this.uiContainer = $("#" + oid);
			this.app.openFiles();
		}
	};
	
	//上传文件
	this.postLoc = function (path_loc, oid)
	{
		var file_free = this.fileCur != null;
		if(file_free)
		{
			file_free = this.fileCur.State == HttpUploaderState.Complete;
			if(!file_free) file_free = this.fileCur.State == HttpUploaderState.Error;			
		}		
		if(this.fileCur == null) file_free = true;
		if(file_free)
		{
		    this.uiContainer = $("#" + oid);
            this.app.addFile({ pathLoc: path_loc });
		}
	};
    
	this.addFileLoc = function(fileLoc)
	{
		var idLoc = this.idCount++;
		var nameLoc = fileLoc.nameLoc;

		var ui = null;
		if(this.fileCur != null) ui = this.fileCur.ui.div;
		if(ui == null)
		{
			ui = _this.fileItem.clone();//文件信息
			_this.uiContainer.append(ui);//添加文件信息
		}
		ui.css("display", "block");

		var uiName      = ui.find("div[name='fileName']");
		var uiSize      = ui.find("div[name='fileSize']")
		var uiProcess 	= ui.find("div[name='process']");
		var uiMsg 		= ui.find("div[name='msg']");
		var btnCancel 	= ui.find("a[name='cancel']");
		var btnPost 	= ui.find("a[name='post']");
		var btnStop 	= ui.find("a[name='stop']");
		var btnDel 		= ui.find("a[name='del']");
		var uiPercent	= ui.find("div[name='percent']");
		
		var upFile = new FileUploader(fileLoc, _this);
        this.filesMap[fileLoc.id] = upFile;//添加到映射表
		var ui_eles = { msg: uiMsg, process: uiProcess,percent:uiPercent, btn: { del: btnDel, cancel: btnCancel,post:btnPost,stop:btnStop }, div: ui};
		upFile.ui = ui_eles;

		uiName.text(nameLoc).attr("title", nameLoc);
		uiSize.text(fileLoc.sizeLoc);
		uiMsg.text("");
		uiPercent.text("(0%)");
        uiProcess.css("width", "0");
		btnCancel.click(function(){upFile.remove();});
		btnPost.click(function ()
		{
		    btnPost.hide();
		    btnDel.hide();
		    btnCancel.hide();
		    btnStop.show();
		    upFile.post();
		});
		btnStop.click(function ()
		{
		    upFile.stop();
		});
		btnDel.click(function(){upFile.remove();});
		
		//upFile.post(); //准备
		this.fileCur = upFile;
		return upFile;
	};
}

var HttpUploaderState = {
	Ready: 0,
	Posting: 1,
	Stop: 2,
	Error: 3,
	GetNewID: 4,
	Complete: 5,
	WaitContinueUpload: 6,
	None: 7,
	Waiting: 8
	,MD5Working:9
};
//文件上传对象
function FileUploader(fileLoc, mgr)
{
    var _this = this;
    //fileLoc:{nameLoc,ext,lenLoc,sizeLoc,pathLoc,md5,lenSvr},控件传递的值
    this.id = fileLoc.id;
    this.ui = { msg: null, process: null, percent: null, btn: { del: null, cancel: null,stop:null,post:null }, div: null};
    this.app = mgr.app;
    this.Manager = mgr; //上传管理器指针
    this.event = mgr.event;
    this.Config = mgr.Config;
    this.fields = jQuery.extend({}, mgr.Config.Fields);//每一个对象自带一个fields幅本
    this.State = HttpUploaderState.None;
    this.uid = this.fields.uid;
    this.fileSvr = {
        id: ""
        , pid: ""
        , pidRoot: ""
        , fdTask: false
        , fdChild: false
        , uid: 0
        , nameLoc: ""
        , nameSvr: ""
        , pathLoc: ""
        , pathSvr: ""
        , pathRel: ""
        , md5: ""
        , lenLoc: "0"
        , sizeLoc: ""
        , FilePos: "0"
        , lenSvr: "0"
        , perSvr: "0%"
        , complete: false
        , deleted: false
    };//json obj，服务器文件信息
    this.fileSvr = jQuery.extend(this.fileSvr, fileLoc);

    //准备
    this.Ready = function ()
    {
        this.ui.msg.text("正在上传队列中等待...");
        this.State = HttpUploaderState.Ready;
    };

    this.svr_error = function ()
    {
        alert("服务器返回信息为空，请检查服务器配置");
        this.ui.msg.text("向服务器发送MD5信息错误");
        
        this.ui.btn.stop.hide();
        this.ui.btn.post.show();
    };
    this.svr_create = function (sv)
    {
        if (sv.value == null)
        {
            this.svr_error(); return;
        }

        var str = decodeURIComponent(sv.value);//
        this.fileSvr = JSON.parse(str);//
        //服务器已存在相同文件，且已上传完成
        if (this.fileSvr.complete)
        {
            this.post_complete_quick();
        } //服务器文件没有上传完成
        else
        {
            this.ui.process.css("width", this.fileSvr.perSvr);
            this.ui.percent.text("("+this.fileSvr.perSvr+")");
            this.post_file();
        }
    };
    this.svr_update = function () {
        if (this.fileSvr.lenSvr == 0) return;
        var param = { uid: this.fields["uid"], offset: this.fileSvr.lenSvr, lenSvr: this.fileSvr.lenSvr, perSvr: this.fileSvr.perSvr, id: this.id, time: new Date().getTime() };
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: this.Config["UrlProcess"]
            , data: param
            , success: function (msg) { }
            , error: function (req, txt, err) { alert("更新文件进度错误！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };
    this.post_process = function (json)
    {
        this.fileSvr.lenSvr = json.lenSvr;//保存上传进度
        this.fileSvr.perSvr = json.percent;
        this.ui.percent.text("("+json.percent+")");
        this.ui.process.css("width", json.percent);
        var str = json.lenPost + " " + json.speed + " " + json.time;
        this.ui.msg.text(str);
    };
    this.post_complete = function (json)
    {
        this.fileSvr.perSvr = "100%";
        this.fileSvr.complete = true;
        this.ui.btn.stop.hide();
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.ui.msg.text("上传完成");
        this.State = HttpUploaderState.Complete;

        var param = { md5: this.fileSvr.md5, uid: this.uid, id: this.fileSvr.id, time: new Date().getTime() };

        $.ajax({
            type: "GET"
			, dataType: 'jsonp'
			, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
			, url: _this.Config["UrlComplete"]
			, data: param
			, success: function (msg)
			{
			    _this.event.fileComplete(_this);//触发事件
			}
			, error: function () { alert("文件-向服务器发送Complete信息错误！" + req.responseText); }
			, complete: function (req, sta) { req = null; }
        });
    };
    this.post_complete_quick = function ()
    {
        this.ui.btn.stop.hide();
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.ui.msg.text("服务器存在相同文件，快速上传成功。");
        this.State = HttpUploaderState.Complete;
        this.event.fileComplete(this);//触发事件
    };
    this.post_stoped = function (json) {
        this.ui.btn.post.show();
        this.ui.btn.del.show();
        this.ui.btn.cancel.hide();
        this.ui.btn.stop.hide();
        this.ui.msg.text("传输已停止....");

        if (HttpUploaderState.Ready == this.State) return;
        this.State = HttpUploaderState.Stop;
    };
    this.post_error = function (json)
    {
        this.ui.msg.text(HttpUploaderErrorCode[json.value]);
        //文件大小超过限制,文件大小为0
        if ("4" == json.value || "5" == json.value)
        {
            this.ui.btn.cancel.show();
        }
        else
        {
            this.ui.btn.post.show();
        }
        this.ui.btn.stop.hide();

        this.State = HttpUploaderState.Error;
    };
    this.md5_process = function (json)
    {
        var msg = "正在扫描本地文件，已完成：" + json.percent;
        this.ui.msg.text(msg);
    };
    this.md5_complete = function (json)
    {
        this.fileSvr.md5 = json.md5;
        this.event.md5Complete(this, json.md5);//biz event
        this.ui.msg.text("MD5计算完毕，开始连接服务器...");

        var loc_path = encodeURIComponent(this.fileSvr.pathLoc);
        var loc_len = this.fileSvr.lenLoc;
        var loc_size = this.fileSvr.sizeLoc;
        var param = { md5: json.md5, id:this.id,uid: this.uid, lenLoc: loc_len, sizeLoc: loc_size, pathLoc: loc_path, time: new Date().getTime() };

        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: this.Config["UrlCreate"]
            , data: param
            , success: function (sv)
            {
                _this.svr_create(sv);
            }
            , error: function (req, txt, err)
            {
                alert("向服务器发送MD5信息错误！" + req.responseText);
                _this.ui.msg.text("向服务器发送MD5信息错误");
                _this.ui.btn.stop.hide();
                _this.ui.btn.post.show();
            }
            , complete: function (req, sta) { req = null; }
        });
    };
    this.md5_error = function (json)
    {
        this.ui.msg.text(HttpUploaderErrorCode[json.value]);
        //文件大小超过限制,文件大小为0
        if ("4" == json.value
			|| "5" == json.value)
        {
            this.ui.btn.cancel.show();
            this.ui.btn.stop.hide();
        }
        else
        {
            this.ui.btn.post.show();
            this.ui.btn.stop.hide();
        }
        this.State = HttpUploaderState.Error;

        this.post_next();
    };
    this.post = function ()
    {
        if (this.fileSvr.md5.length > 0)
        {
            this.post_file();
        }
        else
        {
            this.check_file();
        }
    };
    this.post_file = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.cancel.hide();
        this.State = HttpUploaderState.Posting;//
        var path_loc = this.fileSvr.pathLoc;
        this.fields["pathSvr"] = encodeURIComponent(this.fileSvr.pathSvr);
        this.fields["lenLoc"] = this.fileSvr.lenLoc;
        this.fields["md5"] = this.fileSvr.md5;
        this.app.postFile({ id: this.id, pathLoc: path_loc, lenSvr: this.fileSvr.lenSvr, folder: false, fields: this.fields });
    };
    this.check_file = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.cancel.hide();
        this.State = HttpUploaderState.MD5Working;
        this.app.checkFile({ id: this.id, pathLoc: this.fileSvr.pathLoc });
    };
    this.stop = function ()
    {
        this.ui.btn.del.hide();
        this.ui.btn.cancel.hide();
        this.ui.btn.stop.hide();
        this.ui.btn.post.hide();
        this.svr_update();
        this.app.stopFile({ id: this.fileSvr.id });        
    };
    //手动停止，一般在StopAll中调用
    this.stop_manual = function ()
    {
        if (HttpUploaderState.Posting == this.State)
        {
            this.ui.btn.stop.hide();
            this.ui.btn.post.show();
            this.ui.btn.del.show();
            this.ui.msg.text("传输已停止....");
            this.app.stopFile({ id: this.id});
            this.State = HttpUploaderState.Stop;
        }
    };

    //删除，一般在用户点击"删除"按钮时调用
    this.remove = function ()
    {
        this.ui.div.remove();
    };
}