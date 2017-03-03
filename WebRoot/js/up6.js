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
		2015-07-31 优化更新进度逻辑
*/
var HttpUploaderErrorCode = {
	  "0": "发送数据错误"
	, "1": "接收数据错误"
	, "2": "访问本地文件错误"
	, "3": "域名未授权"
	, "4": "文件大小超过限制"
	, "5": "文件大小为0"
	, "6": "文件被占用"
	, "7": "服务器错误"
};
var up6_err_solve = {
    errFolderCreate: "请检查UrlFdCreate地址配置是否正确\n请检查浏览器缓存是否已更新\n请检查数据库是否创建\n请检查数据库连接配置是否正确"
    , errFolderComplete: "请检查UrlFdComplete地址配置是否正确\n请检查浏览器缓存是否已更新\n请检查数据库是否创建\n请检查数据库连接配置是否正确"
    , errFileComplete: "请检查UrlComplete地址配置是否正确\n请检查浏览器缓存是否已更新"
};
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

//删除元素值
Array.prototype.remove = function(val)
{
	for (var i = 0, n = 0; i < this.length; i++)
	{
		if (this[i] != val)
		{
			this[n++] = this[i];
		}
	}
	this.length -= 1;
}
function debugMsg(m) { $("#msg").append(m); }
/*
	文件管理类
	属性：
		UpFileList
	更新记录：
		2009-11-05 创建。
*/
function HttpUploaderMgr()
{
	var _this = this;
	this.Config = {
		  "EncodeType"		: "utf-8"
		, "Company"			: "荆门泽优软件有限公司"
		, "Version"			: "2,7,103,31652"
		, "License"			: ""//
		, "Authenticate"	: ""//域验证方式：basic,ntlm
		, "AuthName"		: ""//域帐号
		, "AuthPass"		: ""//域密码
        , "CryptoType"      : "md5"//验证方式：md5,sha1,crc
		, "FileFilter"		: "*"//文件类型。所有类型：*。自定义类型：jpg,bmp,png,gif,rar,zip,7z,doc
		, "FileSizeLimit"	: "0"//自定义允许上传的文件大小，以字节为单位。0表示不限制。字节计算工具：http://www.beesky.com/newsite/bit_byte.htm
		, "FilesLimit"		: "0"//文件选择数限制。0表示不限制
		, "AllowMultiSelect": true//多选开关。1:开启多选。0:关闭多选
		, "RangeSize"		: "1048576"//文件块大小，以字节为单位。必须为64KB的倍数。推荐大小：1MB。
		, "Debug"			: true//是否打开调式模式。true,false
		, "LogFile"			: "F:\\log.txt"//日志文件路径。需要先打开调试模式。
		, "InitDir"			: ""//初始化路径。示例：D:\\Soft
		, "AppPath"			: ""//网站虚拟目录名称。子文件夹 web
        , "Cookie"			: ""//服务器cookie
        , "QueueCount"      : 1//同时上传的任务数
		//文件夹操作相关
		, "UrlFdCreate"		: "http://localhost:8080/Uploader6.3MySQL/db/fd_create.jsp"
		, "UrlFdComplete"	: "http://localhost:8080/Uploader6.3MySQL/db/fd_complete.jsp"
		, "UrlFdDel"	    : "http://localhost:8080/Uploader6.3MySQL/db/fd_del.jsp"
		//文件操作相关
		, "UrlCreate"		: "http://localhost:8080/Uploader6.3MySQL/db/f_create.jsp"
		, "UrlPost"			: "http://localhost:8080/Uploader6.3MySQL/db/f_post.jsp"
		, "UrlComplete"		: "http://localhost:8080/Uploader6.3MySQL/db/f_complete.jsp"
		, "UrlList"			: "http://localhost:8080/Uploader6.3MySQL/db/f_list.jsp"
		, "UrlDel"			: "http://localhost:8080/Uploader6.3MySQL/db/f_del.jsp"
	    //x86
        , ie: {
              drop: { clsid: "0868BADD-C17E-4819-81DE-1D60E5E734A6", name: "Xproer.HttpDroper6" }
            , part: { clsid: "BA0B719E-F4B7-464b-A664-6FC02126B652", name: "Xproer.HttpPartition6" }
            , path: "http://www.ncmem.com/download/up6.2/up6.cab"
        }
	    //x64
        , ie64: {
              drop: { clsid: "7B9F1B50-A7B9-4665-A6D1-0406E643A856", name: "Xproer.HttpDroper6x64" }
            , part: { clsid: "307DE0A1-5384-4CD0-8FA8-500F0FFEA388", name: "Xproer.HttpPartition6x64" }
            , path: "http://www.ncmem.com/download/up6.2/up64.cab"
        }
        , firefox: { name: "", type: "application/npHttpUploader6", path: "http://www.ncmem.com/download/up6.2/up6.xpi" }
        , chrome: { name: "npHttpUploader6", type: "application/npHttpUploader6", path: "http://www.ncmem.com/download/up6.2/up6.crx" }
        , chrome45: { name: "com.xproer.up6", path: "http://www.ncmem.com/download/up6.2/up6.nat.crx" }
        , exe: { path: "http://www.ncmem.com/download/up6.2/up6.exe" }
		, "SetupPath": "http://localhost:4955/demoAccess/js/setup.htm"
        , "Fields": {"uname": "test","upass": "test","uid":"0","fid":"0"}
	};

    //biz event
	this.event = {
	      "md5Complete": function (obj/*HttpUploader对象*/, md5) { }
        , "fileComplete": function (obj/*文件上传完毕，参考：FileUploader*/) { }
        , "fdComplete": function (obj/*文件夹上传完毕，参考：FolderUploader*/) { }
        , "queueComplete":function(){/*队列上传完毕*/}
	};
    	
	//http://www.ncmem.com/
	this.Domain = "http://" + document.location.host;
	this.working = false;

	this.FileFilter = new Array(); //文件过滤器
	this.idCount = 1; 	//上传项总数，只累加
	this.filesMap = new Object(); //本地文件列表映射表
	this.QueueFiles = new Array();//文件队列，数据:id1,id2,id3
	this.QueueWait = new Array(); //等待队列，数据:id1,id2,id3
	this.QueuePost = new Array(); //上传队列，数据:id1,id2,id3
	this.arrFilesComplete = new Array(); //已上传完的文件列表
	this.filesUI = null;//上传列表面板
	this.parter = null;
	this.Droper = null;
	this.tmpFile = null;
	this.tmpFolder = null;
	this.tmpSpliter = null;
	this.uiSetupTip = null;
	this.btnSetup = null;
    //检查版本 Win32/Win64/Firefox/Chrome
	var browserName = navigator.userAgent.toLowerCase();
	this.ie = browserName.indexOf("msie") > 0;
    //IE11检查
	this.ie = this.ie ? this.ie : browserName.search(/(msie\s|trident.*rv:)([\w.]+)/) != -1;
	this.firefox = browserName.indexOf("firefox") > 0;
	this.chrome = browserName.indexOf("chrome") > 0;
	this.chrome45 = false;
	this.nat_load = false;
	this.chrVer = navigator.appVersion.match(/Chrome\/(\d+)/);

	//服务器文件列表面板
	this.FileListMgr =
	{
		UploaderMgr: _this //文件上传管理器
		, Config: _this.Config
		, Fields: _this.Config.Fields
		, FileItemTemp: null//文件项模板,JQuery
		, filesUI: null //文件列表容器,JQuery
		, filesUiMap: new Object()//ui映射表,JQuery
        , filesSvr: new Array()//服务器文件列表(json obj)
        , filesSvrMap:new Object()//服务器文件映射表：(idSvr,json obj)
		, "GetHtml": function ()//加载控件
		{
			var html = '<div class="file-list-view" name="file-list-view">\
							<ul class="file-list-head" name="file-list-head">\
								<li class="hcb"><input type="checkbox" /></li>\
								<li class="hname">文件名称</li>\
								<li class="hsize">大小</li>\
								<li class="hper">进度</li>\
								<li class="hop">操作</li>\
							</ul>\
							<div name="file-list-body" class="file-list"></div>\
						</div>';
			//temp
			html += '<div class="divHidden">\
				<ul name="tmpFile">\
					<li class="fcb"><input type="checkbox" /></li>\
					<li class="fname" name="fname">文件名称</li>\
					<li class="fsize" name="fsize">大小</li>\
					<li class="fper" name="fper">进度</li>\
					<li class="fop" name="fop">操作</li>\
				</ul>\
			</div>';
			return html;
		}
		, "Load": function () {//已弃用
			document.write(this.GetHtml());
		}
		, "LoadTo": function (dom)//加载到指定控件
		{
		    var dom             = dom.html(this.GetHtml());
		    this.filesUI        = dom.find('div[name="file-list-body"]');
		    this.FileItemTemp   = dom.find('ul[name="tmpFile"]');

		    this.LoadData();
		}
		, "LoadData": function ()//从服务器加载数据
		{
			var ref = this;
			$.ajax({
				type: "GET"
				, dataType: 'jsonp'
				, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
				, url: this.Config["UrlList"]
				, data: { uid: this.Fields["uid"], time: new Date().getTime() }
			    , success:function (msg)
			    {
			        if (msg.value != null)
			        {
			            var files = JSON.parse(decodeURIComponent(msg.value));
			            for (var i = 0, l = files.length; i < l; ++i)
			            {
			                ref.filesSvr.push(files[i].idSvr);
			                ref.addFileSvr(files[i]);
			            }
			        }
			    }
			    , error: function (req, txt, err) { alert("加载文件列表错误！" + req.responseText); }
			    , complete: function (req, sta) { req = null; }
			});
		}
        , "addFileSvr": function (fileSvr)
        {
            var ref = this;
            var idSvr = fileSvr.idSvr;
            this.filesSvrMap[idSvr] = fileSvr;
            var ui = this.FileItemTemp.clone();
            var liName = ui.find('li[name="fname"]');
            var liSize = ui.find('li[name="fsize"]');
            var liPer = ui.find('li[name="fper"]');
            var liOp = ui.find('li[name="fop"]');

            liName.text(fileSvr.nameLoc);
            liName.attr("title", fileSvr.nameLoc);
            liSize.text(fileSvr.sizeLoc);
            liPer.text(fileSvr.perSvr);

            if (fileSvr.complete)
            {
                liOp.html('<span fid="' + idSvr + '">删除</span>').css("cursor", "pointer").click(function ()
                {
                    ref.RemoveFile(fileSvr);
                });
            }
            else
            {
                liOp.html('<span name="btnReUp">续传</span>|<span name="btnDel">删除</span>').css("cursor", "pointer");
                liOp.find('span[name="btnReUp"]').click(function () { ref.ResumerFile(fileSvr); });
                liOp.find('span[name="btnDel"]').click(function () { ref.RemoveFile(fileSvr); });
            }
            //添加到文件列表项集合
            this.filesUiMap[fileSvr.idSvr] = ui;
            this.filesUI.append(ui);
        }
		, "UploadComplete": function (fileSvr)//上传完成，将操作改为删除。
		{
			//文件已存在
		    if ( this.filesSvrMap[fileSvr.idSvr] != null)
		    {
		        var ref = this;
		        var idSvr = fileSvr.idSvr;
		        var ui = this.filesUiMap[idSvr];
		        var liPer = ui.find('li[name="fper"]');
		        var liOp = ui.find('li[name="fop"]');

		        liPer.text("100%");
		        liOp.html("<span>删除</span>").css("cursor", "pointer").click(function ()
		        {
		            ref.RemoveFile(fileSvr);
		        });
			}
		    else{ this.addFileSvr(fileSvr); }
		}//文件夹上传完毕        
		, "ResumerFile": function (fileSvr)//续传文件
		{
			//文件夹任务
		    if (fileSvr.fdTask)
			{
		        _this.ResumeFolder(fileSvr);
			}
			else
			{
		        _this.ResumeFile(fileSvr);
			}
			_this.OpenPnlUpload(); //打开上传面板
			this.RemoveFileCache(fileSvr.idSvr); //从内存中删除
			this.UploaderMgr.PostFirst();
		}
		, "RemoveFile": function (fileSvr)//删除文件
		{
		    if (fileSvr.fdTask)
		    {
		        this.RemoveFolder(fileSvr);
		        return;
		    }
		    var ref = this;
		    var idSvr = fileSvr.idSvr;
			var item = this.filesSvrMap[idSvr];
			var ui = this.filesUiMap[idSvr];

			$.ajax({
				type: "GET"
				, dataType: 'jsonp'
				, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
				, url: this.Config["UrlDel"]
				, data: { uid: fileSvr.uid, fid: fileSvr.idSvr, time: new Date().getTime() }
				, success: function (msg) {if (msg == 1) {ui.empty();}}
				, error: function () { alert("发送删除文件信息失败！"+req.responseText); }
				, complete: function (req, sta) { req = null; }
			});
		}
        , "RemoveFolder": function (fileSvr)
        {
            var ref = this;
            var idSvr = fileSvr.idSvr;
            var ui = this.filesUiMap[idSvr];

            $.ajax({
                type: "GET"
				, dataType: 'jsonp'
				, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
				, url: this.Config["UrlFdDel"]
				, data: { uid: fileSvr.uid, fid: fileSvr.idSvr,fd_id:fileSvr.fdID, time: new Date().getTime() }
			    , success:function (msg){if (msg.value == 1){ui.empty();}}
			    , error: function () { alert("发送删除文件信息失败！"); }
			    , complete: function (req, sta) { req = null; }
            });
        }
		, "RemoveFileCache": function (idSvr)
		{
		    this.filesSvrMap[idSvr] = null;
		    this.filesUiMap[idSvr].empty();
		    this.filesUiMap[idSvr] = null;
		}
	};

	//容器的HTML代码
	this.GetHtmlContainer = function()
	{
	    //npapi
	    var com = "";
        if(this.firefox||this.chrome) com += '<embed name="parter" type="' + this.Config.firefox.type + '" pluginspage="' + this.Config.firefox.path + '" width="1" height="1"/>';
	    //acx += '<div style="display:none">';
	    //拖拽组件
        com += '<object name="droper" classid="clsid:' + this.Config.ie.drop.clsid + '"';
        com += ' codebase="' + this.Config.ie.path + '#version=' + this.Config.Version + '" width="192" height="192" >';
        com += '</object>';
	    //文件夹选择控件
        com += '<object name="parter" classid="clsid:' + this.Config.ie.part.clsid + '"';
	    com += ' codebase="' + this.Config.ie.path + '#version=' + this.Config.Version + '" width="1" height="1" ></object>';
		
		var html = '<div class="tab-panel">\
						<ul id="cbHeader" class="tab-item">\
							<li id="liPnlUploader" class="hover">上传新文件</li>\
							<li id="liPnlFiles" >文件列表</li>\
						</ul>\
						<div name="tab-body" class="tab-body">\
							<ul name="cbItem" class="block"><li name="filesLoc"></li></ul>\
							<ul name="cbItem" class="cbItem"><li name="filesSvr"></li></ul>\
						</div>\
					</div>';
		return com + html;
	};
	
	//文件上传面板。
	this.GetHtmlFiles = function()
	{
		//加载拖拽控件
		var acx = "";
		//acx += '<object name="ieDroper" classid="clsid:' + this.Config["ClsidDroper"] + '"';
		//acx += ' codebase="' + this.Config["CabPath"] + '" width="192" height="192" >';
		//acx += '</object>';
		
		//上传列表项模板
		acx += '<div class="file-item" id="tmpFile" name="fileItem">\
                    <div class="img-box"><img src="js/file.png"/></div>\
					<div class="area-l">\
						<div class="file-head">\
						    <div name="fileName" class="name">HttpUploader程序开发.pdf</div>\
						    <div name="percent" class="percent">(35%)</div>\
						    <div name="fileSize" class="size" child="1">1000.23MB</div>\
                        </div>\
						<div class="process-border"><div name="process" class="process"></div></div>\
						<div name="msg" class="msg top-space">15.3MB 20KB/S 10:02:00</div>\
					</div>\
					<div class="area-r">\
                        <a class="btn-box" name="cancel" title="取消"><img src="js/stop.png"/><div>取消</div></a>\
                        <a class="btn-box hide" name="post" title="继续"><img src="js/post.png"/><div>继续</div></a>\
						<a class="btn-box hide" name="stop" title="停止"><img src="js/stop.png"/><div>停止</div></a>\
						<a class="btn-box hide" name="del" title="删除"><img src="js/del.png"/><div>删除</div></a>\
					</div>';
		acx += '</div>';
		//文件夹模板
		acx += '<div class="file-item" name="folderItem">\
					<div class="img-box"><img src="js/folder.png"/></div>\
					<div class="area-l">\
						<div class="file-head">\
						    <div name="fileName" class="name">HttpUploader程序开发.pdf</div>\
						    <div name="percent" class="percent">(35%)</div>\
						    <div name="fileSize" class="size" child="1">1000.23MB</div>\
                        </div>\
						<div class="process-border top-space"><div name="process" class="process"></div></div>\
						<div name="msg" class="msg top-space">15.3MB 20KB/S 10:02:00</div>\
					</div>\
					<div class="area-r">\
                        <a class="btn-box" name="cancel" title="取消"><img src="js/stop.png"/><div>取消</div></a>\
                        <a class="btn-box hide" name="post" title="继续"><img src="js/post.png"/><div>继续</div></a>\
						<a class="btn-box hide" name="stop" title="停止"><img src="js/stop.png"/><div>停止</div></a>\
						<a class="btn-box hide" name="del" title="删除"><img src="js/del.png"/><div>删除</div></a>\
					</div>';
		acx += '</div>';
		//分隔线
		acx += '<div class="file-line" name="lineSplite"></div>';
		//上传列表
		acx += '<div class="files-panel" name="post_panel">\
					<div name="post_head" class="toolbar">\
						<a href="javascript:void(0)" class="btn" name="btnAddFiles">选择多个文件</a>\
						<a href="javascript:void(0)" class="btn" name="btnAddFolder">选择文件夹</a>\
						<a href="javascript:void(0)" class="btn" name="btnPasteFile">粘贴文件</a>\
						<a href="javascript:void(0)" class="btn hide" name="btnSetup">安装控件</a>\
					</div>\
					<div class="content" name="post_content">\
						<div name="post_body" class="file-post-view"></div>\
					</div>\
					<div class="footer" name="post_footer">\
						<a href="javascript:void(0)" class="btn-footer" name="btnClear">清除已完成文件</a>\
					</div>\
				</div>';
		return acx;
	};
	
	//打开上传面板
	this.OpenPnlUpload = function()
	{
		$("#liPnlUploader").click();
	};
	//打开文件列表面板
	this.OpenPnlFiles = function()
	{
		$("#liPnlFiles").click();
	};

	this.set_config = function (v) { jQuery.extend(this.Config, v);};
	this.open_files = function (json)
	{
	    for (var i = 0, l = json.files.length; i < l; ++i)
	    {
	        this.addFileLoc(json.files[i]);
	    }
	    setTimeout(function () { _this.PostFirst(); },500);
	};
	this.open_folders = function (json)
	{
	    this.addFolderLoc(json);
	    setTimeout(function () { _this.PostFirst(); }, 500);
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
	this.load_complete = function (json) { this.nat_load = true; this.btnSetup.hide(); };
	this.recvMessage = function (str)
	{
	    var json = JSON.parse(str);
	         if (json.name == "open_files") { _this.open_files(json); }
	    else if (json.name == "open_folders") { _this.open_folders(json); }
	    else if (json.name == "paste_files") { _this.paste_files(json); }
	    else if (json.name == "post_process") { _this.post_process(json); }
	    else if (json.name == "post_error") { _this.post_error(json); }
	    else if (json.name == "post_complete") { _this.post_complete(json); }
	    else if (json.name == "md5_process") { _this.md5_process(json); }
	    else if (json.name == "md5_complete") { _this.md5_complete(json); }
	    else if (json.name == "md5_error") { _this.md5_error(json); }
	    else if (json.name == "load_complete") { _this.load_complete();}
	};

	//IE浏览器信息管理对象
	this.browser = {
	      entID: "Uploader6Event"
		, check : function ()//检查插件是否已安装
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
                    var enabled = mimetype[i].type == _this.Config.firefox.type;
                    if (!enabled) enabled = mimetype[i].type == _this.Config.firefox.type.toLowerCase();
                    if (enabled) return mimetype[i].enabledPlugin;
                }
            }
            else
            {
                mimetype = [_this.Config.firefox.type];
            }
            if (mimetype)
            {
                return mimetype.enabledPlugin;
            }
            return false;
        }
        , checkChr: function () { }
        , checkNat: function () { }
        , NeedUpdate: function ()
        {
            return this.GetVersion() != _this.Config["Version"];
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
			acx += '<object id="objHttpPartition" classid="clsid:' + _this.Config.ie.part.clsid + '"';
			acx += ' codebase="' + _this.Config.ie.path + '" width="1" height="1" ></object>';

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
            document.addEventListener('Uploader6EventCallBack', function (evt)
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
        , addFile: function (json)
        {
            var param = { name: "add_file", config: _this.Config };
            jQuery.extend(param, json);
            this.postMessage(param);
        }
        , openFiles: function ()
        {
            var param = { name: "open_files", config: _this.Config };
            this.postMessage(param);
        }
        , openFolders: function ()
        {
            var param = { name: "open_folders", config: _this.Config };
            this.postMessage(param);
        }
        , pasteFiles: function ()
        {
            var param = { name: "paste_files", config: _this.Config };
            this.postMessage(param);
        }
        , checkFile: function (f)
        {
            var param = { name: "check_file", config: _this.Config };
            jQuery.extend(param, f);
            this.postMessage(param);
        }
        , checkFolder: function (fd)
        {
            var param = { name: "check_folder", config: _this.Config ,folder:JSON.stringify(fd)};
            this.postMessage(param);
        }
        , postFile: function (f)
        {
            var param = { name: "post_file", config: _this.Config };
            jQuery.extend(param, f);
            this.postMessage(param);
        }
        , postFolder: function (fd)
        {
            var param = { name: "post_folder", config: _this.Config };
            jQuery.extend(param, fd);
            param.name = "post_folder";
            this.postMessage(param);
        }
        , stopFile: function (f)
        {
            var param = { name: "stop_file", id: f.id,config:_this.Config};
            this.postMessage(param);
        }
        , postMessage:function(json)
        {
            if(this.check()) _this.parter.postMessage(JSON.stringify(json));
        }
        , postMessageNat: function (par)
        {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(this.entID, true, false, par);
            document.dispatchEvent(evt);
        }
	};

	this.checkBrowser = function ()
	{
	    //Win64
	    if (window.navigator.platform == "Win64")
	    {
	        jQuery.extend(this.Config.ie, this.Config.ie64);
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
	this.checkBrowser();

	//安装检查
	this.setup_check = function ()
	{
	    if (!_this.browser.check()) { this.btnSetup.show(); }
	    else { this.btnSetup.hide(); }
	};

	//安装控件
	this.Install = function ()
	{
	    if (!_this.browser.Check())
		{
	        _this.browser.Setup();
		}
		else
		{
			$("body").empty();
			$("body").append("插件安装成功");
		}
	};

	//安全检查，在用户关闭网页时自动停止所有上传任务。
	this.SafeCheck = function(event)
	{
		$(window).bind("beforeunload", function(event)
		{
			if (_this.QueuePost.length > 0)
			{
				event.returnValue = "您还有程序正在运行，确定关闭？";
			}
		});

		$(window).bind("unload", function()
		{ 
			if (_this.QueuePost.length > 0)
			{
				_this.StopAll();
			}
		});
	};

	this.loadAuto = function ()
	{
	    var dom = $(document.body).append(this.GetHtmlContainer());
	    this.initUI(dom);
	};

	//加载容器，上传面板，文件列表面板
	this.load_to = function(oid)
	{
	    var dom = $("#" + oid).append(this.GetHtmlContainer());
	    this.initUI(dom);
	};

	this.initUI = function (dom)
	{
	    var filesSvr = dom.find('li[name="filesSvr"]');
	    var filesLoc = dom.find('li[name="filesLoc"]');
	    this.parter = dom.find('object[name="parter"]').get(0);
	    this.Droper = dom.find('object[name="droper"]').get(0);
	    if (this.firefox || this.chrome) this.parter = dom.find('embed[name="parter"]').get(0);
	    if (!this.chrome45) this.parter.recvMessage = this.recvMessage;

	    var panel           = filesLoc.html(this.GetHtmlFiles());
        var post_panel      = dom.find("div[name='tab-body']");
	    var post_body       = dom.find("div[name='post_body']");
        var post_head       = dom.find('div[name="post_head"]');
        var post_foot       = dom.find('div[name="post_footer"]');
        post_body.height(post_panel.height() - post_head.height() - post_foot.outerHeight());

	    this.filesUI        = post_body;
	    this.tmpFile        = panel.find('div[name="fileItem"]');
	    this.tmpFolder      = panel.find('div[name="folderItem"]');
	    this.tmpSpliter     = panel.find('div[name="lineSplite"]');
	    this.pnlHeader      = panel.find('div[name="pnlHeader"]');
        this.btnSetup       = panel.find('a[name="btnSetup"]').attr("href",this.Config.exe.path);
	    //drag files
	    if (null != this.Droper) this.Droper.recvMessage = _this.recvMessage;

	    //添加多个文件
	    panel.find('a[name="btnAddFiles"]').click(function () { _this.openFile(); });
	    //添加文件夹
	    panel.find('a[name="btnAddFolder"]').click(function () { _this.openFolder(); });
	    //粘贴文件
	    panel.find('a[name="btnPasteFile"]').click(function () { _this.pasteFiles(); });
	    //清空已完成文件
	    panel.find('a[name="btnClear"]').click(function () { _this.ClearComplete(); });

	    this.SafeCheck();
	    this.FileListMgr.LoadTo(filesSvr);
	    //动态调整高度
	    var files_head = dom.find('ul[name="file-list-head"]');
	    this.FileListMgr.filesUI.height(post_panel.height() - 28);

	    this.InitContainer();
	    this.setup_check();
	    this.browser.init();
	};
	
	//初始化容器
	this.InitContainer = function()
	{
		var cbItemLast = null;
		$("#cbHeader li").each(function(n)
		{
			if (this.className == "hover")
			{
				cbItemLast = this;
			}

			$(this).click(function()
			{
				$("ul[name='cbItem']").each(function(i)
				{
					this.style.display = i == n ? "block" : "none"; /*确定主区域显示哪一个对象*/
				});
				if (cbItemLast) cbItemLast.className = "";

				if (this.className == "hover")
				{
					this.className = "";
				}
				else
				{
					this.className = "hover";
				}
				cbItemLast = this;
			});
		});
	};

    //清除已完成文件
	this.ClearComplete = function()
	{
	    $.each(this.arrFilesComplete, function (i, n) { n.remove(); });
	    this.arrFilesComplete.length = 0;
	};

	//上传队列是否已满
	this.IsPostQueueFull = function()
	{
		//目前只支持同时上传三个文件
	    return (_this.QueuePost.length + 1) > this.Config.QueueCount;
	};

	//添加到上传队列
	this.AppendQueuePost = function(fid)
	{
	    _this.QueuePost.push(fid);
	};

    //从上传队列删除
	this.RemoveQueuePost = function (fid) {
	    if (_this.QueuePost.length < 1) return;
	    this.QueuePost.remove(fid);
	};
	
	//添加到上传队列
	this.AppendQueue = function(fid)
	{
		_this.QueueFiles.push(fid);
	};

	//从队列中删除
	this.RemoveQueue = function(fid)
	{ 
	    if (this.QueueFiles.length < 1) return;
	    this.QueueFiles.remove(fid);
	};
	
	//添加到未上传ID列表，(停止，出错)
	this.AppendQueueWait = function(fid)
	{
		_this.QueueWait.push(fid);
	};
	
	//从未上传ID列表删除，(上传完成)
	this.RemoveQueueWait = function(fid)
	{ 
	    if (this.QueueWait.length < 1) return;
	    this.QueueWait.remove(fid);
	};

	//停止所有上传项
	this.StopAll = function()
	{
		for (var i = 0, l = _this.QueuePost.length; i < l; ++i)
		{
			_this.filesMap[_this.QueuePost[i]].stop_manual();
		}
		_this.QueuePost.length = 0;
	};

	//传送当前队列的第一个文件
	this.PostFirst = function ()
	{
		//上传列表不为空
		if (_this.QueueFiles.length > 0)
		{
		    while (_this.QueueFiles.length > 0)
			{
				//上传队列已满
				if (_this.IsPostQueueFull()) return;
				var index = _this.QueueFiles.shift();
				_this.filesMap[index].post();
				_this.working = true;//
			}
		}
	};
	
	//启动下一个传输
	this.PostNext = function()
	{
		if (this.IsPostQueueFull()) return; //上传队列已满

		if (this.QueueFiles.length > 0)
		{
		    var index = this.QueueFiles.shift();
			var obj = this.filesMap[index];

			//空闲状态
			if (HttpUploaderState.Ready == obj.State)
			{
				obj.post();
			}
		} //全部上传完成
		else
		{
		    if (this.QueueFiles.length == 0//文件队列为空
                && this.QueuePost.length == 0//上传队列为空
                && this.QueueWait.length == 0)//等待队列为空
			{
		        if (this.working)
		        {
		            this.event.queueComplete();
		            this.working = false;
		        }
			}
		}
	};

	/*
	验证文件名是否存在
	参数:
	[0]:文件名称
	*/
	this.Exist = function()
	{
		var fn = arguments[0];

		for (a in _this.filesMap)
		{
			if (_this.filesMap[a].LocalFile == fn)
			{
				return true;
			}
		}
		return false;
	};

	/*
	根据ID删除上传任务
	参数:
		fid 上传项ID。唯一标识
	*/
	this.Delete = function(fid)
	{
		_this.RemoveQueue(fid); //从队列中删除
		_this.RemoveQueueWait(fid);//从未上传列表中删除
	};

	/*
	判断文件类型是否需要过滤
	根据文件后缀名称来判断。
	*/
	this.NeedFilter = function(fname)
	{
		if (_this.FileFilter.length == 0) return false;
		var exArr = fname.split(".");
		var len = exArr.length;
		if (len > 0)
		{
			for (var i = 0, l = _this.FileFilter.length; i < l; ++i)
			{
				//忽略大小写
				if (_this.FileFilter[i].toLowerCase() == exArr[len - 1].toLowerCase())
				{
					return true;
				}
			}
		}
		return false;
	};
	
	//打开文件选择对话框
	this.openFile = function()
	{
	    _this.browser.openFiles();
	};
	
	//打开文件夹选择对话框
	this.openFolder = function()
	{
	    _this.browser.openFolders();
	};

	//粘贴文件
	this.pasteFiles = function()
	{
	    _this.browser.pasteFiles();
	};

	this.ResumeFile = function (fileSvr)
	{
	    //本地文件名称存在
	    if (_this.Exist(fileSvr.pathLoc)) return;
	    var uper = this.addFileLoc(fileSvr);

	    setTimeout(function () { _this.PostFirst();},500);
	};

	//fileLoc:name,id,ext,size,length,pathLoc,md5,lenSvr,idSvr
	this.addFileLoc = function(fileLoc)
	{
		//本地文件名称存在
		if (_this.Exist(fileLoc.pathLoc)) return;
		//此类型为过滤类型
		if (_this.NeedFilter(fileLoc.ext)) return;

		var idLoc = this.idCount++;
		var nameLoc = fileLoc.nameLoc;
		jQuery.extend(fileLoc, { idLoc: idLoc });
		_this.AppendQueue(idLoc);//添加到队列

		var ui = _this.tmpFile.clone();//文件信息
		var sp = _this.tmpSpliter.clone();//分隔线
		_this.filesUI.append(ui);//添加文件信息
		_this.filesUI.append(sp);//添加分隔线
		ui.css("display", "block");
		sp.css("display", "block");

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
		this.filesMap[idLoc] = upFile;//添加到映射表
		var ui_eles = { msg: uiMsg, process: uiProcess,percent:uiPercent, btn: { del: btnDel, cancel: btnCancel,post:btnPost,stop:btnStop }, div: ui, split: sp };
		upFile.ui = ui_eles;
		upFile.idLoc = idLoc;

		uiName.text(nameLoc).attr("title", nameLoc);
		uiSize.text(fileLoc.sizeLoc);
		uiMsg.text("");
		uiPercent.text("(0%)");
		btnCancel.click(function()
		{
			upFile.stop();
			upFile.remove();
			_this.PostFirst();//
		});
		btnPost.click(function ()
		{
		    btnPost.hide();
		    btnDel.hide();
		    btnCancel.hide();
		    btnStop.show();
		    if (!_this.IsPostQueueFull())
		    {
		        upFile.post();
		    }
		    else
		    {
		        upFile.Ready();
		        //添加到队列
		        _this.AppendQueue(idLoc);
		    }
		});
		btnStop.click(function ()
		{
		    upFile.stop();
		    btnPost.show();
		    btnDel.show();
		    btnCancel.hide();
		    btnStop.hide();
		});
		btnDel.click(function () { upFile.remove(); });
		
		upFile.Ready(); //准备
		return upFile;
	};

	//添加文件夹,json为文件夹信息字符串
	this.addFolderLoc = function (json)
	{
	    var fdLoc = json;
		//本地文件夹存在
	    if (this.Exist(fdLoc.pathLoc)) return;
	    //针对空文件夹的处理
	    if (json.files == null) jQuery.extend(fdLoc,{files:{}});
	    //if (json.lenLoc == 0) return;

	    var idLoc = this.idCount++;
		this.AppendQueue(idLoc);//添加到队列

		var ui = this.tmpFolder.clone();//文件夹信息
		var sp = this.tmpSpliter.clone();//分隔线
		this.filesUI.append(ui);//添加到上传列表面板
		this.filesUI.append(sp);
		ui.css("display", "block");
		sp.css("display", "block");

		var uiName      = ui.find("div[name='fileName']");
		var uiSize      = ui.find("div[name='fileSize']")
		var divProcess 	= ui.find("div[name='process']");
		var divMsg      = ui.find("div[name='msg']");
		var btnCancel   = ui.find("a[name='cancel']");
		var btnPost     = ui.find("a[name='post']");
		var btnStop     = ui.find("a[name='stop']");
		var btnDel      = ui.find("a[name='del']");
		var divPercent	= ui.find("div[name='percent']");
		var ui_eles = { msg: divMsg, process: divProcess, percent: divPercent, btn: { del: btnDel, cancel: btnCancel, post: btnPost, stop: btnStop }, split: sp, div: ui };

		divPercent.text("("+fdLoc.perSvr+")");
		divProcess.css("width",fdLoc.perSvr);
		divMsg.text("");
		//if(fdLoc.fdName != null) fdLoc.name = fdLoc.fdName;
		uiName.text(fdLoc.nameLoc);
		uiName.attr("title", fdLoc.nameLoc + "\n文件：" + fdLoc.files.length + "\n文件夹：" + fdLoc.foldersCount + "\n大小：" + fdLoc.sizeLoc);
		uiSize.text(fdLoc.sizeLoc);

		var fdTask = new FolderUploader(idLoc, fdLoc, this);
		this.filesMap[idLoc] = fdTask;//添加到映射表
		fdTask.ui = ui_eles;
	    btnCancel.click(function()
		{
			fdTask.stop();
			fdTask.remove();
							
	    });
	    btnPost.click(function ()
	    {
	        btnPost.hide();
	        btnDel.hide();
	        btnCancel.hide();
	        btnStop.show();

	        if (!_this.IsPostQueueFull())
	        {
	            fdTask.post();
	        }
	        else
	        {
	            fdTask.Ready();
	            _this.AppendQueue(fdTask.idLoc);
	        }
	    });
	    btnStop.click(function ()
	    {
	        fdTask.stop();
	        btnPost.show();
	        btnDel.show();
	        btnCancel.hide();
	        btnStop.hide();
	    });
		btnDel.click(function(){fdTask.remove();});
		fdTask.Ready(); //准备
		return fdTask;
	};

	this.ResumeFolder = function (fileSvr)
	{
	    var fd = this.addFolderLoc(fileSvr);
		fd.folderInit = true;
	    //
		if (null == fileSvr.files)
		{
		    alert("文件为空");
		    return;
		}
	};
}