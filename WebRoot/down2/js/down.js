/*
版权所有(C) 2009-2018 荆门泽优软件有限公司
保留所有权利
官方网站：http://www.ncmem.com
产品论坛：http://bbs.ncmem.com/forum-41-1.html
产品首页：http://www.ncmem.com/webapp/down2/index.asp
开发文档：http://www.cnblogs.com/xproer/archive/2011/03/15/1984950.html
升级日志：http://www.cnblogs.com/xproer/archive/2011/03/15/1985091.html
示例下载(asp.net)：http://www.ncmem.com/download/down2/asp.net/down2.rar
示例下载(jsp-mysql)：http://www.ncmem.com/download/down2/jsp/Down2MySQL.rar
示例下载(jsp-oracle)：http://www.ncmem.com/download/down2/jsp/Down2Oracle.rar
示例下载(jsp-sql)：http://www.ncmem.com/download/down2/jsp/Down2SQL.rar
示例下载(php)：http://www.ncmem.com/download/down2/php/down2.rar
文档下载：http://www.ncmem.com/download/down2/down2-doc.rar
联系邮箱：1085617561@qq.com
联系QQ：1085617561
版本：2.4.2
更新记录：
    2009-11-05 创建
	2014-02-27 优化版本号。
    2015-08-13 优化
    2017-06-08 增加对edge的支持，完善逻辑。
    2017-07-22 优化文件夹下载，优化文件下载。
*/
function debug_msg(v) { $(document.body).append("<div>"+v+"</div>");}
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

function DownloaderMgr()
{
	var _this = this;
	this.Config = {
		  "Folder"		: ""
		, "Debug"		: false//调试模式
		, "LogFile"		: "f:\\log.txt"//日志文件路径。
		, "Company"		: "荆门泽优软件有限公司"
		, "Version"		: "1,2,72,60650"
		, "License"		: ""//
		, "Cookie"		: ""//
		, "ThreadCount"	: 3//并发数
        , "ThreadBlock"	: 3//文件块线程数，每个文件使用多少线程下载数据。3~10
        , "ThreadChild" : 3//子文件线程数，提供给文件夹使用。3~10
		, "FilePart"	: 5242880//文件块大小，计算器：http://www.beesky.com/newsite/bit_byte.htm
        , "FolderClear"	: true//下载前是否清空目录
        //file
        , "UrlCreate"   : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_create.jsp"
        , "UrlDel"      : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_del.jsp"
        , "UrlList"     : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_list.jsp"
        , "UrlListCmp"  : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_list_cmp.jsp"
        , "UrlUpdate"   : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_update.jsp"
        , "UrlDown"     : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_down.jsp"
	    //folder
        , "UrlFdData"   : "http://localhost:8080/Uploader6.3MySQL/down2/db/fd_data.jsp"
        //x86
        , ie: {
              part: { clsid: "6528602B-7DF7-445A-8BA0-F6F996472569", name: "Xproer.DownloaderPartition" }
            , path: "http://www.ncmem.com/download/down2/2.4/down2.cab"
        }
        //x64
        , ie64: {
            part: { clsid: "19799DD1-7357-49de-AE5D-E7A010A3172C", name: "Xproer.DownloaderPartition64" }
            , path: "http://www.ncmem.com/download/down2/2.4/down64.cab"
        }
        , firefox: { name: "", type: "application/npHttpDown", path: "http://www.ncmem.com/download/down2/v2.3-guid/down2.xpi" }
        , chrome: { name: "npHttpDown", type: "application/npHttpDown", path: "http://www.ncmem.com/download/down2/v2.3-guid/down2.crx" }
	    //Chrome 45
        , chrome45: { name: "com.xproer.down2", path: "http://www.ncmem.com/download/down2/v2.3-guid/down2.nat.crx" }
        , exe: { path: "http://www.ncmem.com/download/down2/v2.3-guid/down2.exe" }
        , edge: {protocol:"down2",port:9700,visible:false}
        , "Fields": {"uname": "test","upass": "test","uid":"0"}
	};

    this.event = {
          downComplete: function (obj) { }
        , downError: function (obj, err) { }
        , queueComplete: function () { }
	};
	
	var browserName = navigator.userAgent.toLowerCase();
	this.ie = browserName.indexOf("msie") > 0;
	this.ie = this.ie ? this.ie : browserName.search(/(msie\s|trident.*rv:)([\w.]+)/) != -1;
	this.firefox = browserName.indexOf("firefox") > 0;
	this.chrome = browserName.indexOf("chrome") > 0;
	this.chrome45 = false;
	this.nat_load = false;
    this.chrVer = navigator.appVersion.match(/Chrome\/(\d+)/);
    this.edge = navigator.userAgent.indexOf("Edge") > 0;
    this.edgeApp = new WebServer(this);
    this.app = up6_app;
    this.app.edgeApp = this.edgeApp;
    this.app.Config = this.Config;
    this.app.ins = this;
    if (this.edge) { this.ie = this.firefox = this.chrome = this.chrome45 = false; }
	
	this.idCount = 1; 	//上传项总数，只累加
	this.queueCount = 0;//队列总数
	this.filesMap = new Object(); //本地文件列表映射表
	this.filesCmp = new Array();//已完成列表
	this.filesUrl = new Array();
    this.queueWait = new Array(); //等待队列，数据:id1,id2,id3
    this.queueWork = new Array(); //正在上传的队列，数据:id1,id2,id3
	this.spliter = null;
	this.pnlFiles = null;//文件上传列表面板
	this.parter = null;
	this.btnSetup = null;//安装控件的按钮
    this.working = false;
    this.allStoped = false;//

	this.getHtml = function()
	{ 
	    //自动安装CAB
        var html = '<embed name="ffParter" type="' + this.Config.firefox.type + '" pluginspage="' + this.Config.firefox.path + '" width="1" height="1"/>';
        if (this.chrome45) html = "";
		//var acx = '<div style="display:none">';
		/*
			IE静态加载代码：
			<object id="objDownloader" classid="clsid:E94D2BA0-37F4-4978-B9B9-A4F548300E48" codebase="http://www.qq.com/HttpDownloader.cab#version=1,2,22,65068" width="1" height="1" ></object>
			<object id="objPartition" classid="clsid:6528602B-7DF7-445A-8BA0-F6F996472569" codebase="http://www.qq.com/HttpDownloader.cab#version=1,2,22,65068" width="1" height="1" ></object>
		*/
        html += '<object name="parter" classid="clsid:' + this.Config.ie.part.clsid + '"';
        html += ' codebase="' + this.Config.ie.path + '#version=' + _this.Config["Version"] + '" width="1" height="1" ></object>';
        if (this.edge) html = '';
	    //上传列表项模板
	    html += '<div class="file-item file-item-single" name="fileItem">\
                    <div class="img-box"><img name="fileImg" src="js/file.png"/><img class="hide" name="fdImg" src="js/folder.png"/></div>\
					<div class="area-l">\
						<div name="fileName" class="name">HttpUploader程序开发.pdf</div>\
						<div name="percent" class="percent">(35%)</div>\
						<div name="fileSize" class="size" child="1">1000.23MB</div>\
						<div class="process-border"><div name="process" class="process"></div></div>\
						<div name="msg" class="msg top-space">15.3MB 20KB/S 10:02:00</div>\
					</div>\
					<div class="area-r">\
                        <span tp="btn-item" class="btn-box hide" name="down" title="继续"><div>继续</div></span>\
						<span tp="btn-item" class="btn-box hide" name="stop" title="停止"><div>停止</div></span>\
                        <span tp="btn-item" class="btn-box" name="cancel" title="取消">取消</span>\
						<span tp="btn-item" class="btn-box hide" name="del" title="删除"><div>删除</div></span>\
						<span tp="btn-item" class="btn-box hide" name="open" title="打开"><div>打开</div></span>\
						<span tp="btn-item" class="btn-box hide" name="open-fd" title="文件夹"><div>文件夹</div></span>\
					</div>\
				</div>';
		//分隔线
	    html += '<div class="file-line" name="spliter"></div>';
		//上传列表
	    html += '<div class="files-panel" name="down_panel">\
                    <div class="header" name="down_header">下载文件</div>\
					<div name="down_toolbar" class="toolbar">\
						<span class="btn" name="btnSetFolder"><div>设置下载目录</div></span>\
						<span class="btn" name="btnStart">全部下载</span>\
						<span class="btn" name="btnStop">全部停止</span>\
						<span class="btn hide" name="btnSetup">安装控件</span>\
					</div>\
					<div class="content" name="down_content">\
						<div name="down_body" class="file-post-view"></div>\
					</div>\
					<div class="footer" name="down_footer">\
						<span class="btn-footer" name="btnClear">清除已完成文件</span>\
					</div>\
				</div>';
	    return html;
	};

    this.to_params= function (param, key) {
        var paramStr = "";
        if (param instanceof String || param instanceof Number || param instanceof Boolean) {
            paramStr += "&" + key + "=" + encodeURIComponent(param);
        } else {
            $.each(param, function (i) {
                var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
                paramStr += '&' + _this.to_params(this, k);
            });
        }
        return paramStr.substr(1);
    };
	this.set_config = function (v) { jQuery.extend(this.Config, v); };
	this.clearComplete = function ()
	{
	    $.each(this.filesCmp, function (i,n)
	    {
	        n.remove();
	    });
	    this.filesCmp.length = 0;
	};
	this.add_ui = function (f)
	{
	    //存在相同项
        if (this.exist_url(f.f_id)) return null;
        this.filesUrl.push(f.f_id);

	    var _this = this;

	    var ui = this.tmpFile.clone();
	    var sp = this.spliter.clone();
	    ui.css("display", "block");
	    sp.css("display", "block");
	    this.pnlFiles.append(ui);
	    this.pnlFiles.append(sp);

	    var uiIcoF    = ui.find("img[name='fileImg']")
	    var uiIcoFD   = ui.find("img[name='fdImg']")
	    var uiName    = ui.find("div[name='fileName']")
	    var uiSize    = ui.find("div[name='fileSize']");
	    var uiProcess = ui.find("div[name='process']");
	    var uiPercent = ui.find("div[name='percent']");
	    var uiMsg     = ui.find("div[name='msg']");
	    var btnCancel = ui.find("span[name='cancel']");
        var btnStop   = ui.find("span[name='stop']");
        var btnDown   = ui.find("span[name='down']");
        var btnDel    = ui.find("span[name='del']");
        var btnOpen   = ui.find("span[name='open']");
        var btnOpenFd = ui.find("span[name='open-fd']");
        ui.find('span[tp="btn-item"]').hover(function () {
            $(this).addClass("btn-box-hover");
        }, function () {$(this).removeClass("btn-box-hover");});
        var ui_eles = { ico: { file: uiIcoF, fd: uiIcoFD }, msg: uiMsg, name: uiName, size: uiSize, process: uiProcess, percent: uiPercent, btn: { cancel: btnCancel, stop: btnStop, down: btnDown, del: btnDel, open: btnOpen, openFd: btnOpenFd }, div: ui, split: sp };

        var downer;
        if (f.fdTask) { downer = new FdDownloader(f, this); }
	    else { downer = new FileDownloader(f,this);}
	    this.filesMap[f.id] = downer;//
	    jQuery.extend(downer.ui, ui_eles);

	    uiName.text(f.nameLoc);
	    uiName.attr("title", f.nameLoc);
	    uiMsg.text("");
	    uiSize.text(f.sizeSvr);
	    uiPercent.text("("+f.perLoc+")");
        uiProcess.width(f.perLoc);

        downer.ready(); //准备
        setTimeout(function () { _this.down_next(); },500);
    };
	this.resume_folder = function (fdSvr)
	{	    
		var fd = jQuery.extend({}, fdSvr, { svrInit: true });
        this.add_ui(fd);
    };
    this.resume_file = function (fSvr) {
    	var f = jQuery.extend({}, fSvr, { svrInit: true });
        this.add_ui(f);
    };
	this.init_file = function (f)
    {
        this.app.initFile(f);
    };
    this.init_folder = function (f) {
        this.app.initFolder(jQuery.extend({},this.Config,f));
    };
    this.init_file_cmp = function (json)
    {
        var p = this.filesMap[json.id];
        p.init_complete(json);
    };
    this.add_file = function (f) {
        var obj = this.add_ui(f);
    };
    this.add_folder = function (f)
	{
	    var obj = this.add_ui(f);
	};
	this.exist_url = function (url)
	{
	    var v = false;
	    for (var i = 0, l = this.filesUrl.length; i < l; ++i)
	    {
	        v = this.filesUrl[i] == url;
	        if (v) break;
	    }
	    return v;
	};
	this.remove_url = function (url) { this.filesUrl.remove(url); };
    this.remove_wait = function (id) {
        if (this.queueWait.length == 0) return;
        this.queueWait.remove(id);
    };
	this.open_folder = function (json)
	{
	    this.app.openFolder();
	};
    this.down_file = function (json) { };
    //队列控制
    this.work_full = function () { return (this.queueWork.length + 1) > this.Config.ThreadCount; };
    this.add_wait = function (id) { this.queueWait.push(id); };
    this.add_work = function (id) { this.queueWork.push(id); };
    this.del_work = function (id) {
        if (_this.queueWork.length < 1) return;
        this.queueWork.remove(id);
    };
    this.down_next = function () {
        if (_this.allStoped) return;
        if (_this.work_full()) return;
        if (_this.queueWait.length < 1) return;
        var f_id = _this.queueWait.shift();
        var f = _this.filesMap[f_id];
        _this.add_work(f_id);
        f.down();
    };

	this.init_end = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.init_end(json);
	};
	this.down_begin = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_begin(json);
	};
	this.down_process = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_process(json);
	};
	this.down_error = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_error(json);
    };
    this.down_open_folder = function (json) {
        //用户选择的路径
        //json.path
        this.Config["Folder"] = json.path;
    };
	this.down_recv_size = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_recv_size(json);
	};
	this.down_recv_name = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_recv_name(json);
	};
	this.down_complete = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_complete(json);
	};
	this.down_stoped = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_stoped(json);
	};
    this.start_queue = function ()
    {
        this.allStoped = false;
        this.down_next();
    };
	this.stop_queue = function (json)
    {
        this.allStoped = true;
	    this.app.stopQueue();
	};
	this.queue_begin = function (json) { this.working = true;};
	this.queue_end = function (json) { this.working = false;};
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
	         if (json.name == "init_file_cmp") { _this.init_file_cmp(json); }
	    else if (json.name == "open_folder") { _this.down_open_folder(json); }
	    else if (json.name == "down_recv_size") { _this.down_recv_size(json); }
	    else if (json.name == "down_recv_name") { _this.down_recv_name(json); }
	    else if (json.name == "init_end") { _this.init_end(json); }
	    else if (json.name == "add_file") { _this.add_file(json); }
	    else if (json.name == "add_folder") { _this.add_folder(json); }
	    else if (json.name == "down_begin") { _this.down_begin(json); }
	    else if (json.name == "down_process") { _this.down_process(json); }
	    else if (json.name == "down_error") { _this.down_error(json); }
	    else if (json.name == "down_complete") { _this.down_complete(json); }
	    else if (json.name == "down_stoped") { _this.down_stoped(json); }
	    else if (json.name == "queue_complete") { _this.event.queueComplete(); }
	    else if (json.name == "queue_begin") { _this.queue_begin(json); }
	    else if (json.name == "queue_end") { _this.queue_end(json); }
	    else if (json.name == "load_complete") { _this.load_complete(json); }
	    else if (json.name == "load_complete_edge") { _this.load_complete_edge(json); }
    };

    this.checkVersion = function ()
	{
	    //Win64
	    if (window.navigator.platform == "Win64")
	    {
	        jQuery.extend(this.Config.ie, this.Config.ie64);
	    }
	    if (this.firefox)
        {
            if (!this.app.checkFF())//仍然支持npapi
            {
                this.edge = true;
                this.app.postMessage = this.app.postMessageEdge;
                this.edgeApp.run = this.edgeApp.runChr;
            }
	    }
	    else if (this.chrome)
	    {
	        this.app.check = this.app.checkFF;
	        jQuery.extend(this.Config.firefox, this.Config.chrome);
	        //44+版本使用Native Message
	        if (parseInt(this.chrVer[1]) >= 44)
	        {
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
    this.checkVersion();

    //升级通知
    this.update_notice = function () {
        this.btnSetup.text("升级控件");
        this.btnSetup.css("color", "red");
        this.btnSetup.show();
    };

	//安全检查，在用户关闭网页时自动停止所有上传任务。
	this.safeCheck = function()
    {
        window.onbeforeunload = function (e) {
            e = e || window.event;

            if (_this.queueWork.length > 0)
            {
                // 兼容IE8和Firefox 4之前的版本
                if (e) {
                    e.returnValue = '您还有程序正在运行，确定关闭？';
                }
                // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
                return '您还有程序正在运行，确定关闭？';
            }
        };
        
        window.onunload = function () { if (_this.queueWork.length > 0) { _this.stop_queue();}};
	};
	
	this.loadAuto = function()
	{
	    var html = this.getHtml();
	    var ui = $(document.body).append(html);
	    this.initUI(ui);
	    this.loadFiles();
	};
	//加截到指定dom
	this.loadTo = function(id)
	{
	    var obj = $("#" + id);
	    var html = this.getHtml();
	    var ui = obj.append(html);
	    this.initUI(ui);
	    this.loadFiles();
	};
	this.initUI = function (ui/*jquery obj*/)
	{
	    this.down_panel = ui.find('div[name="down_panel"]');
	    this.btnSetup = ui.find('span[name="btnSetup"]');
        this.tmpFile = ui.find('div[name="fileItem"]');
        this.parter = ui.find('embed[name="ffParter"]').get(0);
        this.ieParter = ui.find('object[name="parter"]').get(0);

	    var down_body = ui.find("div[name='down_body']");
	    var down_head = ui.find('div[name="down_header"]');
	    var post_bar = ui.find('div[name="down_toolbar"]');
	    var post_foot = ui.find('div[name="down_footer"]');
	    down_body.height(this.down_panel.height() - post_bar.height() - down_head.height() - post_foot.outerHeight() - 1);

	    var btnSetFolder = ui.find('span[name="btnSetFolder"]');
	    this.spliter = ui.find('div[name="spliter"]');
	    this.pnlFiles = down_body;

	    //设置下载文件夹
        btnSetFolder.click(function () { _this.open_folder(); });
		//清除已完成
        ui.find('span[name="btnClear"]').click(function () { _this.clearComplete(); }).hover(function () {
            $(this).addClass("btn-footer-hover");
        }, function () {
            $(this).removeClass("btn-footer-hover");
        });
		ui.find('span[name="btnStart"]').click(function () { _this.start_queue(); });
        ui.find('span[name="btnStop"]').click(function () { _this.stop_queue(); });
        ui.find('span[class="btn"]').hover(function () {
            $(this).addClass("btn-hover");
        }, function () { $(this).removeClass("btn-hover"); });

        this.safeCheck();//

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

    //加载未未完成列表
	this.loadFiles = function ()
	{
	    var param = jQuery.extend({}, this.Config.Fields, { time: new Date().getTime()});
	    $.ajax({
	        type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: _this.Config["UrlList"]
            , data: param
            , success: function (msg)
            {
                if (msg.value == null) return;
                var files = JSON.parse(decodeURIComponent(msg.value));

                for (var i = 0, l = files.length; i < l; ++i)
                {
                    if (files[i].fdTask)
                    { _this.resume_folder(files[i]); }
                    else { _this.resume_file(files[i]); }
                }
            }
            , error: function (req, txt, err) { alert("加载文件列表失败！" +req.responseText); }
            , complete: function (req, sta) {req = null;}
	    });
	};
}
