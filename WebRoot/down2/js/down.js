/*
版权所有(C) 2009-2015 荆门泽优软件有限公司
保留所有权利
官方网站：http://www.ncmem.com
官方博客：http://www.cnblogs.com/xproer
产品首页：http://www.ncmem.com/webplug/http-downloader/index.asp
在线演示：http://www.ncmem.com/products/http-downloader/demo/index.html
开发文档：http://www.cnblogs.com/xproer/archive/2011/03/15/1984950.html
升级日志：http://www.cnblogs.com/xproer/archive/2011/03/15/1985091.html
示例下载(asp.net)：http://www.ncmem.com/download/HttpDownloader/asp.net/demo.rar
示例下载(jsp-access)：http://www.ncmem.com/download/HttpDownloader/jsp/HttpDownloader.rar
示例下载(jsp-mysql)：http://www.ncmem.com/download/HttpDownloader/jsp/HttpDownloaderMySQL.rar
示例下载(jsp-oracle)：http://www.ncmem.com/download/HttpDownloader/jsp/HttpDownloaderOracle.rar
示例下载(jsp-sql)：http://www.ncmem.com/download/HttpDownloader/jsp/HttpDownloaderSQL.rar
示例下载(php)：http://www.ncmem.com/download/HttpDownloader/php/HttpDownloader.rar
文档下载：http://www.ncmem.com/download/HttpDownloader/HttpDownloader-doc.rar
联系邮箱：1085617561@qq.com
联系QQ：1085617561
更新记录：
    2009-11-05 创建
	2014-02-27 优化版本号。
    2015-08-13 优化
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
		  "Folder"		: "F:\\ftp\\"
		, "Debug"		: false//调试模式
		, "LogFile"		: "f:\\log.txt"//日志文件路径。
		, "Company"		: "荆门泽优软件有限公司"
		, "Version"		: "1,2,56,31650"
		, "License"		: ""//
		, "Cookie"		: ""//
		, "ThreadCount"	: 1//并发数
		, "FilePart"	: 1048576//文件块大小，更新进度时使用，计算器：http://www.beesky.com/newsite/bit_byte.htm
        //file
        , "UrlCreate"   : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_create.jsp"
        , "UrlDel"      : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_del.jsp"
        , "UrlList"     : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_list.jsp"
        , "UrlListCmp"  : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_list_cmp.jsp"
        , "UrlUpdate"   : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_update.jsp"
        , "UrlDown"     : "http://localhost:8080/Uploader6.3MySQL/down2/db/f_down.jsp"
	    //folder
        , "UrlFdCreate" : "http://localhost:8080/Uploader6.3MySQL/down2/db/fd_create.jsp"
        //x86
		, "ClsidDown"	: "E94D2BA0-37F4-4978-B9B9-A4F548300E48"
		, "ClsidPart"	: "6528602B-7DF7-445A-8BA0-F6F996472569"
		, "CabPath"		: "http://www.ncmem.com/download/down2/down2.cab"
		//x64
		, "ClsidDown64"	: "0DADC2F7-225A-4cdb-80E2-03E9E7981AF8"
		, "ClsidPart64"	: "19799DD1-7357-49de-AE5D-E7A010A3172C"
		, "CabPath64"	: "http://www.ncmem.com/download/down2/down64.cab"
		//Firefox
		, "XpiType"		: "application/npHttpDown"
		, "XpiPath"	    : "http://www.ncmem.com/download/down2/down2.xpi"
		//Chrome
		, "CrxName"		: "npHttpDown"
		, "CrxType"		: "application/npHttpDown"
		, "CrxPath"	    : "http://www.ncmem.com/download/down2/down2.crx"
	    //Chrome 45
        , "NatHostName" : "com.xproer.down2"//
	    , "NatPath"		: "http://www.ncmem.com/download/down2/down2.nat.crx"
	    , "ExePath"		: "http://www.ncmem.com/download/down2/down2.exe"
	};
	
	this.ActiveX = {
		  "Part"	: "Xproer.DownloaderPartition"
		//64bit
		, "Part64"	: "Xproer.DownloaderPartition64"
	};

	this.Fields = {
        "uid" : 0
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
	
	this.idCount = 1; 	//上传项总数，只累加
	this.queueCount = 0;//队列总数
	this.filesMap = new Object(); //本地文件列表映射表
	this.filesCmp = new Array();//已完成列表
	this.filesUrl = new Array();
	this.spliter = null;
	this.pnlFiles = null;//文件上传列表面板
	this.parter = null;
	this.btnSetup = null;//安装控件的按钮
	this.working = false;

	this.getHtml = function()
	{ 
	    //自动安装CAB
	    var html = "";
		//var acx = '<div style="display:none">';
		/*
			IE静态加载代码：
			<object id="objDownloader" classid="clsid:E94D2BA0-37F4-4978-B9B9-A4F548300E48" codebase="http://www.qq.com/HttpDownloader.cab#version=1,2,22,65068" width="1" height="1" ></object>
			<object id="objPartition" classid="clsid:6528602B-7DF7-445A-8BA0-F6F996472569" codebase="http://www.qq.com/HttpDownloader.cab#version=1,2,22,65068" width="1" height="1" ></object>
		*/
	    if (this.ie)
	    {
	        html += '<object name="parter" classid="clsid:' + this.Config["ClsidPart"] + '"';
	        html += ' codebase="' + this.Config["CabPath"] + '#version=' + _this.Config["Version"] + '" width="1" height="1" ></object>';
	    }
	    else if (this.firefox)
	    {
	        html += '<embed name="parter" type="' + this.Config.XpiType + '" pluginspage="' + this.Config.XpiPath + '" width="1" height="1"/>';
	    }
	    else if (this.chrome)
	    {
	        html += '<embed name="parter" type="' + this.Config.CrxType + '" pluginspage="' + this.Config.CrxPath + '" width="1" height="1"/>';
	    }
		//acx += '</div>';
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
                        <a class="btn-box hide" name="down" title="继续"><div>继续</div></a>\
						<a class="btn-box hide" name="stop" title="停止"><div>停止</div></a>\
                        <a class="btn-box" name="cancel" title="取消">取消</a>\
						<a class="btn-box hide" name="del" title="删除"><div>删除</div></a>\
					</div>\
				</div>';
		//分隔线
	    html += '<div class="file-line" name="spliter"></div>';
		//上传列表
	    html += '<div class="files-panel" name="down_panel">\
                    <div class="header" name="down_header">下载文件</div>\
					<div name="down_toolbar" class="toolbar">\
						<a class="btn" name="btnSetFolder"><div>设置下载目录</div></a>\
						<a href="javascript:void(0)" class="btn" name="btnStart">全部下载</a>\
						<a href="javascript:void(0)" class="btn" name="btnStop">全部停止</a>\
						<a href="javascript:void(0)" class="btn hide" name="btnSetup">安装控件</a>\
					</div>\
					<div class="content" name="down_content">\
						<div name="down_body" class="file-post-view"></div>\
					</div>\
					<div class="footer" name="down_footer">\
						<a href="javascript:void(0)" class="btn-footer" name="btnClear">清除已完成文件</a>\
					</div>\
				</div>';
	    return html;
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
	this.add_ui = function (fd/*是否是文件夹*/,url, f_name)
	{
	    //存在相同项
	    if (this.exist_url(url)) return null;
	    this.filesUrl.push(url);

	    var _this = this;
	    var fileNameArray = url.split("/");
	    var fileName = fileNameArray[fileNameArray.length - 1];
	    var fid = this.idCount++;
	    //自定义文件名称
	    var fileLoc = { fileUrl: url, id: fid };
	    //自定义名称
	    if (typeof (f_name) == "string")
	    {
	        jQuery.extend(fileLoc, { nameCustom: f_name });
	        fileName = f_name;
	    }

	    var ui = this.tmpFile.clone();
	    var sp = this.spliter.clone();
	    ui.css("display", "block");
	    sp.css("display", "block");
	    this.pnlFiles.append(ui);
	    this.pnlFiles.append(sp);

	    var uiIcoF = ui.find("img[name='fileImg']")
	    var uiIcoFD = ui.find("img[name='fdImg']")
	    var uiName = ui.find("div[name='fileName']")
	    var uiSize = ui.find("div[name='fileSize']");
	    var uiProcess = ui.find("div[name='process']");
	    var uiPercent = ui.find("div[name='percent']");
	    var uiMsg = ui.find("div[name='msg']");
	    var btnCancel = ui.find("a[name='cancel']");
	    var btnStop = ui.find("a[name='stop']");
	    var btnDown = ui.find("a[name='down']");
	    var btnDel = ui.find("a[name='del']");
	    var ui_eles = { ico:{file:uiIcoF,fd:uiIcoFD},msg: uiMsg, name: uiName, size: uiSize, process: uiProcess, percent: uiPercent, btn: { cancel: btnCancel, stop: btnStop, down: btnDown, del: btnDel }, div: ui, split: sp };

	    var downer;
	    if (fd) { downer = new FdDownloader(fileLoc, this); }
	    else { downer = new FileDownloader(fileLoc,this);}
	    //var downer = new FileDownloader(fileLoc, this);
	    this.filesMap[fid] = downer;//
	    jQuery.extend(downer.ui, ui_eles);

	    uiName.text(fileName);
	    uiName.attr("title", url);
	    uiMsg.text("");
	    uiSize.text("0字节");
	    uiPercent.text("(0%)");
	    btnDel.click(function () { downer.remove(); });
	    btnStop.click(function () { downer.stop(); });
	    btnDown.click(function () { downer.down(); });
	    btnCancel.click(function () { downer.remove(); });

	    downer.ready(); //准备
	    return downer;
	};
	this.resume_file = function (fileSvr)
	{
	    var f = this.add_ui(false,fileSvr.fileUrl, fileSvr.nameLoc);
	    f.ui.size.text(fileSvr.sizeSvr);
	    f.ui.process.css("width", fileSvr.perLoc);
	    f.ui.percent.text("(" + fileSvr.perLoc + ")");
	    jQuery.extend(f.fileSvr, fileSvr);
	    f.addQueue();//添加到队列
	};
	this.resume_folder = function (fdSvr)
	{	    
	    var obj = this.add_ui(true, fdSvr.fileUrl, fdSvr.nameLoc);
	    if (null == obj) return;

	    obj.ui.ico.file.hide();
	    obj.ui.ico.fd.show();
	    obj.ui.name.text(fdSvr.nameLoc);
	    obj.ui.size.text(fdSvr.sizeSvr);
	    obj.ui.process.css("width", fdSvr.perLoc);
	    obj.ui.percent.text("(" + fdSvr.perLoc + ")");
	    jQuery.extend(true, obj.fileSvr, fdSvr);//
	    
	    obj.addQueue();
	    return obj;
	};
	this.add_file = function (url,f_name)
	{
	    var obj = this.add_ui(false,url, f_name);
	    if (obj != null) obj.addQueue();
	    return obj;
	};
	this.add_folder = function (url,fdLoc,f_name)
	{
	    var obj = this.add_ui(true, url, f_name);
	    if (null == obj) return;

	    obj.ui.name.text(fdLoc.nameLoc);
	    obj.ui.size.text(fdLoc.sizeSvr);
	    obj.ui.ico.file.hide();
	    obj.ui.ico.fd.show();
	    jQuery.extend(obj.fileSvr, fdLoc);//
	    jQuery.extend(obj.fileSvr, { fileUrl: url });
	    obj.initFiles();//
	    obj.addQueue();
	    return obj;
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
	this.open_folder = function (json)
	{
	    this.browser.openFolder();
	};
	this.down_file = function (json) { };
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
	this.down_part = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_part(json);
	};
	this.down_error = function (json)
	{
	    var p = this.filesMap[json.id];
	    p.down_error(json);
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
	this.start_queue = function () { this.browser.startQueue();};
	this.stop_queue = function (json)
	{
	    this.browser.stopQueue();
	};
	this.queue_begin = function (json) { this.working = true;};
	this.queue_end = function (json) { this.working = false;};
	this.load_complete = function (json) { this.nat_load = true; this.btnSetup.hide(); };
	this.recvMessage = function (str)
	{
	    var json = JSON.parse(str);
	         if (json.name == "open_files") { _this.open_files(json); }
	    else if (json.name == "open_folder") { _this.open_folders(json); }
	    else if (json.name == "down_recv_size") { _this.down_recv_size(json); }
	    else if (json.name == "down_recv_name") { _this.down_recv_name(json); }
	    else if (json.name == "init_end") { _this.init_end(json); }
	    else if (json.name == "down_begin") { _this.down_begin(json); }
	    else if (json.name == "down_process") { _this.down_process(json); }
	    else if (json.name == "down_part") { _this.down_part(json); }
	    else if (json.name == "down_error") { _this.down_error(json); }
	    else if (json.name == "down_complete") { _this.down_complete(json); }
	    else if (json.name == "down_stoped") { _this.down_stoped(json); }
	    else if (json.name == "queue_complete") { _this.event.queueComplete(); }
	    else if (json.name == "queue_begin") { _this.queue_begin(json); }
	    else if (json.name == "queue_end") { _this.queue_end(json); }
	    else if (json.name == "load_complete") { _this.load_complete(); }
	};

    //浏览器对象
	this.browser = {
	      entID: "Downloader2Event"
	    , cbkID: "Downloader2EventCallBack"
		, check: function ()//检查插件是否已安装
		{
		    return null != this.GetVersion();
		}
        , checkFF: function ()
        {
            var mimetype = navigator.mimeTypes;
            if (typeof mimetype == "object" && mimetype.length)
            {
                for (var i = 0; i < mimetype.length; i++)
                {
                    var enabled = mimetype[i].type == _this.Config.XpiType;
                    if (!enabled) enabled = mimetype[i].type == _this.Config.XpiType.toLowerCase();
                    if (enabled) return mimetype[i].enabledPlugin;
                }
            }
            else
            {
                mimetype = [_this.Config.XpiType];
            }
            if (mimetype)
            {
                return mimetype.enabledPlugin;
            }
            return false;
        }
        , checkChr: function () { return false;}
        , checkNat: function () { return false; }
        , NeedUpdate: function ()
        {
            return this.GetVersion() != _this.Config.Version;
        }
		, GetVersion: function ()
		{
		    var v = null;
		    try
		    {
		        v = _this.parter.Version;
		        if (v == undefined) v = null;
		    }
		    catch (e) { }
		    return v;
		}
		, Setup: function ()
		{
		    //文件夹选择控件
		    acx += '<object classid="clsid:' + _this.Config.ClsidPart + '"';
		    acx += ' codebase="' + _this.Config.CabPath + '" width="1" height="1" ></object>';

		    $("body").append(acx);
		}
        , init: function ()
        {
            this.initNat();//
            var param = { name: "init", config: _this.Config };
            this.postMessage(param);
        }
        , initNat: function ()
        {
            if (!_this.chrome45) return;
            this.exitEvent();
            document.addEventListener(this.cbkID, function (evt)
            {
                _this.recvMessage(JSON.stringify(evt.detail));
            });
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
        , openFolder: function ()
        {
            var param = { name: "open_folder", config: _this.Config };            
            this.postMessage(param);
        }
		, openPath:function(f)
		{
            var param = { name: "open_path", config: _this.Config };            
            this.postMessage(param);
		}
		, openFile:function(f)
		{
            var param = { name: "open_file", config: _this.Config };            
            this.postMessage(param);
		}
        , addFile: function (f)
        {
            _this.queueCount++;
            var param = { name: "add_file", config: _this.Config };
            jQuery.extend(param, f);
            this.postMessage(param);
        }
        , addFolder: function (f)
        {
            _this.queueCount++;
            var param = { name: "add_folder", config: _this.Config };
            jQuery.extend(param, f, {name:"add_folder"});
            this.postMessage(param);
        }
        , stopFile: function (f)
        {
            _this.queueCount--;
            var param = { name: "stop_file", id: f.id, config: _this.Config };
            this.postMessage(param);
        }
        , startQueue: function ()
        {
            var param = { name: "start_queue", config: _this.Config };
            this.postMessage(param);
        }
        , stopQueue: function ()
        {
            var param = { name: "stop_queue", config: _this.Config };
            this.postMessage(param);
        }
        , postMessage: function (json)
        {
            _this.parter.postMessage(JSON.stringify(json));
        }
        , postMessageNat: function (par)
        {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(this.entID, true, false, par);
            document.dispatchEvent(evt);
        }
	};

	this.checkVersion = function ()
	{
	    //Win64
	    if (window.navigator.platform == "Win64")
	    {
	        _this.Config["CabPath"] = _this.Config["CabPath64"];

	        _this.Config["ClsidDown"] = _this.Config["ClsidDown64"];
	        _this.Config["ClsidPart"] = _this.Config["ClsidPart64"];

	        _this.ActiveX["Down"] = _this.ActiveX["Down64"];
	        _this.ActiveX["Part"] = _this.ActiveX["Part64"];
	    }
	    else if (this.firefox)
	    {
	        this.browser.check = this.browser.checkFF;
	    }
	    else if (this.chrome)
	    {
	        this.browser.check = this.browser.checkFF;
	        jQuery.extend(this.Config.firefox, this.Config.chrome);
	        //_this.Config["XpiPath"] = _this.Config["CrxPath"];
	        //_this.Config["XpiType"] = _this.Config["CrxType"];
	        //44+版本使用Native Message
	        if (parseInt(this.chrVer[1]) >= 44)
	        {
	            _this.firefox = true;
	            if (!this.browser.checkFF())//仍然支持npapi
	            {
	                this.browser.postMessage = this.browser.postMessageNat;
	                _this.firefox = false;
	                _this.chrome = false;
	                _this.chrome45 = true;//
	            }
	        }
	    }
	};
	this.checkVersion();
	this.setup_tip = function ()
	{
	    this.btnSetup.attr("href", this.Config.ExePath);
	    this.btnSetup.show();
	};
	this.setup_check = function ()
	{
	    if (!_this.browser.check()) { this.setup_tip(); /*_this.browser.Setup();*/ }
	    else { this.btnSetup.hide();}
	};

	//安全检查，在用户关闭网页时自动停止所有上传任务。
	this.safeCheck = function()
	{
	    $(window).bind("beforeunload", function (event)
	    {
	        if (_this.working)
	        {
	            event.returnValue = "您还有程序正在运行，确定关闭？";
	        }
	    });

		$(window).bind("unload", function()
		{ 
			if (_this.working)
			{
			    _this.stop_queue();
			}
		});
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
	    this.btnSetup = ui.find('a[name="btnSetup"]');
	    this.tmpFile = ui.find('div[name="fileItem"]');
	    this.parter = ui.find('embed[name="parter"]').get(0);
	    if (this.ie) this.parter = ui.find('object[name="parter"]').get(0);
	    if(!this.chrome45) this.parter.recvMessage = this.recvMessage;

	    var down_body = ui.find("div[name='down_body']");
	    var down_head = ui.find('div[name="down_header"]');
	    var post_bar = ui.find('div[name="down_toolbar"]');
	    var post_foot = ui.find('div[name="down_footer"]');
	    down_body.height(this.down_panel.height() - post_bar.height() - down_head.height() - post_foot.outerHeight() - 1);

	    var btnSetFolder = ui.find('a[name="btnSetFolder"]');
	    this.spliter = ui.find('div[name="spliter"]');
	    this.pnlFiles = down_body;

	    _this.browser.init(); //
	    //设置下载文件夹
	    btnSetFolder.click(function () { _this.open_folder(); });
		//清除已完成
		ui.find('a[name="btnClear"]').click(function(){_this.clearComplete();});
		ui.find('a[name="btnStart"]').click(function () { _this.start_queue(); });
		ui.find('a[name="btnStop"]').click(function () { _this.stop_queue(); });

	    //this.LoadData();
		this.safeCheck();//
		this.setup_check();
	};

    //加载未未完成列表
	this.loadFiles = function ()
	{
	    var param = jQuery.extend({}, this.Fields, { time: new Date().getTime()});
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
