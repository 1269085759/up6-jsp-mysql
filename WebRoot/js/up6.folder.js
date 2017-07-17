/*
	文件夹上传对象，内部包含多个HttpUploader对象
	参数：
		json 文件夹信息结构体，一个JSON对象。
*/
function FolderUploader(fdLoc, mgr)
{
    var _this = this;
    this.id = fdLoc.id;
    this.ui = { msg: null, process: null, percent: null, btn: { del: null, cancel: null,stop:null,post:null }, div: null, split: null };
    this.isFolder = true; //是文件夹
    this.folderInit = false;//文件夹已初始化
    this.Scaned = false;//是否已经扫描
    this.folderSvr = { nameLoc: "",nameSvr:"",lenLoc:0,sizeLoc: "0byte", lenSvr: 0,perSvr:"0%", id:"",uid: 0, foldersCount: 0, filesCount: 0, filesComplete: 0, pathLoc: "", pathSvr: "", pathRel: "", pidRoot: "", complete: false, folders: [], files: [] };
    jQuery.extend(true,this.folderSvr, fdLoc);//续传信息
    this.manager = mgr;
    this.event = mgr.event;
    this.arrFiles = new Array(); //子文件列表(未上传文件列表)，存HttpUploader对象
    this.FileListMgr = mgr.FileListMgr;//文件列表管理器
    this.Config = mgr.Config;
    this.fields = jQuery.extend({}, mgr.Config.Fields);//每一个对象自带一个fields幅本
    this.app = mgr.app;
    this.LocalFile = ""; //判断是否存在相同项
    this.FileName = "";

    //准备
    this.Ready = function ()
    {
        this.ui.msg.text("正在上传队列中等待...");
        this.State = HttpUploaderState.Ready;
    };
    this.svr_create = function (fdSvr)
    {
		//jQuery.extend(this.folderSvr,fdSvr);
        if (fdSvr.complete)
        {
            this.all_complete();
            return;
        }
        this.ui.btn.stop.show();
        this.ui.btn.cancel.hide();
        this.ui.btn.post.hide();
        this.ui.btn.del.hide();
        this.folderSvr.pathSvr = fdSvr.pathSvr;
        this.update_fd();
        this.folderInit = true;
        this.post_fd();
    };
    this.svr_update = function ()
    {
        if (this.folderSvr.lenSvr == 0) return;
        var param = { uid: this.fields["uid"], id: this.id, offset: 0, lenSvr: this.folderSvr.lenSvr, perSvr: this.folderSvr.perSvr, time: new Date().getTime() };
        $.ajax({
            type: "GET"
            , dataType: 'jsonp'
            , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            , url: this.Config["UrlProcess"]
            , data: param
            , success: function (msg) {}
            , error: function (req, txt, err) { alert("更新文件夹进度失败！" + req.responseText); }
            , complete: function (req, sta) { req = null; }
        });
    };
    this.svr_create_err = function ()
    {
        this.folderInit = false;
        this.ui.msg.text("向服务器发送文件夹信息错误").css("cursor", "pointer").click(function ()
        {
            alert(up6_err_solve.errFolderCreate);
        });
        this.ui.btn.post.show();
    };
    //上传，创建文件夹结构信息
    this.post = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.del.hide();
        this.ui.btn.post.hide();
        this.ui.btn.cancel.hide();
        this.manager.AppendQueuePost(this.id);//添加到队列中
        this.State = HttpUploaderState.Posting;
        //如果文件夹已初始化，表示续传。
        if (this.folderInit)
        {
            this.post_fd();
        }
        else
        {
            if (!this.Scaned)
            {
                this.scan();
                return;
            }

            this.check_fd();//计算文件夹md5
            return;
        }
    };
    this.scan = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.post.hide();
        this.State = HttpUploaderState.scan;
        this.app.scanFolder({ id: this.id });
    };
    this.scan_process = function (json)
    {
        this.ui.msg.text("正在扫描：" + json.count);
        this.ui.size.text(json.size);
    };
    this.scan_complete = function (json)
    {
        this.manager.RemoveQueuePost(this.id);
        this.ui.size.text(json.sizeLoc);
        this.Scaned = true;
        this.ui.msg.text("扫描完毕，准备计算MD5");
        var self = this;
        setTimeout(function () { self.post();},300);
    };
    this.check_fd = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.post.hide();
        this.State = HttpUploaderState.MD5Working;
        var par = jQuery.extend(this.folderSvr, { id: this.id});
        this.app.checkFolder(par);
    };
    this.post_fd = function ()
    {
        this.ui.btn.stop.show();
        this.ui.btn.post.hide();
        this.State = HttpUploaderState.Posting;
        var fd = jQuery.extend({}, { id: this.id, pathLoc: this.folderSvr.pathLoc, fields: this.fields });
        this.app.postFolder(fd);
    };
    this.update_fd = function () {
        var fd = jQuery.extend({}, { id: this.id, pathSvr: this.folderSvr.pathSvr});
        this.app.updateFolder(fd);
    };
    this.post_stoped = function (json)
    {
        this.State = HttpUploaderState.Stop;
        this.ui.btn.post.show();
        this.ui.btn.del.show();
        this.ui.btn.cancel.hide();
        this.ui.btn.stop.hide();
        this.ui.msg.text("传输已停止....");
        this.manager.RemoveQueuePost(this.id);
        this.manager.AppendQueueWait(this.id);//添加到未上传列表
        this.manager.PostNext();
    };
    this.post_error = function (json)
    {
        //this.ui.btn.cancel.text("续传").show();
        this.ui.msg.text(HttpUploaderErrorCode[json.value]);
        //文件大小超过限制,文件大小为0
        if (4 == json.value || 5 == json.value){}
        if (6 == json.value) { this.ui.msg.text("文件被占用:" + json.pathLoc); }

        this.ui.btn.stop.hide();
        this.ui.btn.post.show();
        this.ui.btn.del.show();

        this.State = HttpUploaderState.Error;
        //从上传列表中删除
        this.manager.RemoveQueuePost(this.id);
        //添加到未上传列表
        this.manager.AppendQueueWait(this.id);

        setTimeout(function () { _this.manager.PostNext(); }, 500);
    };
    this.post_process = function (json)
    {
        this.folderSvr.lenSvr = json.lenSvr;
        this.folderSvr.perSvr = json.percent;
        this.ui.percent.text("(" + json.percent+")");
        this.ui.process.css("width", json.percent);
        var str = "(" + json.fileIndex + "/" + json.fileCount + ") " + json.lenPost + " " + json.speed + " " + json.time;
        this.ui.msg.text(str);
    };
    this.post_complete = function (json)
    {
        this.event.fdComplete(this);
        $.each(this.ui.btn, function (i, n)
        {
            n.hide();
        });
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        //obj.pMsg.text("上传完成");
        this.State = HttpUploaderState.Complete;
        this.folderSvr.complete = true;
        this.folderSvr.perSvr = "100%";
        //从上传列表中删除
        this.manager.RemoveQueuePost(this.id);
        //从未上传列表中删除
        this.manager.RemoveQueueWait(this.id);
        var str = "文件数：" + json.fileCount + "，成功：" + json.completes;
        if(json.errors > 0 ) str += " 失败：" + json.errors
        this.ui.msg.text(str);

        $.ajax({
            type: "GET"
			, dataType: 'jsonp'
			, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
			, url: this.Config["UrlFdComplete"]
			, data: { uid: this.fields["uid"], id: this.id,time: new Date().getTime() }
			, success: function (msg)
			{
			    //添加到文件列表
			    _this.FileListMgr.UploadComplete(_this.folderSvr);
			    _this.manager.PostNext();
			}
			, error: function (req, txt, err) { alert("向服务器发送文件夹Complete信息错误！" + req.responseText); }
			, complete: function (req, sta) { req = null; }
        });
    };
    this.md5_error = function (json)
    {
        this.ui.btn.post.show();
        this.ui.btn.cancel.hide();
    };
    this.md5_process = function (json)
    {
        if (this.State == HttpUploaderState.Stop) return;
        this.ui.msg.text("正在计算MD5："+json.percent);
    };
    this.md5_complete = function (json)
    {
        jQuery.extend(this.folderSvr,json.data);
        //在此处增加服务器验证代码。
        this.ui.msg.text("初始化...");
		var f_data = jQuery.extend({},this.fields,{folder: encodeURIComponent(JSON.stringify(this.folderSvr)), time: new Date().getTime()});

        $.ajax({
            type: "POST"
            //, dataType: 'jsonp'
            //, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
			, url: this.Config["UrlFdCreate"]
			, data: f_data
			, success: function (msg)
			{
				try
				{
					var json = JSON.parse(decodeURIComponent(msg));
					_this.svr_create(json);
				}
				catch(e)
				{
					_this.post_error({"value":"7"});
				}
			}
			, error: function (req, txt, err)
			{
			    alert("向服务器发送文件夹信息错误！" + req.responseText);
			    _this.svr_create_err();
			}
			, complete: function (req, sta) { req = null; }

        });
    };
    
    //所有文件全部上传完成
    this.all_complete = function ()
    {
        this.event.fdComplete(this);
        $.each(this.ui.btn, function (i, n)
        {
            n.hide();
        });
        this.ui.process.css("width", "100%");
        this.ui.percent.text("(100%)");
        this.State = HttpUploaderState.Complete;
        this.folderSvr.complete = true;
        this.folderSvr.perSvr = "100%";
        //从上传列表中删除
        this.manager.RemoveQueuePost(this.id);
        //从未上传列表中删除
        this.manager.RemoveQueueWait(this.id);
        this.ui.msg.text("共" + this.folderSvr.filesCount + "个文件，成功上传" + this.folderSvr.filesCount + "个文件");

        $.ajax({
            type: "GET"
			, dataType: 'jsonp'
			, jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
			, url: this.Config["UrlFdComplete"]
			, data: { uid: this.fields["uid"], id: this.id, time: new Date().getTime() }
			, success: function (msg)
			{
			    //添加到文件列表
			    _this.FileListMgr.UploadComplete(_this.folderSvr);
			    _this.manager.PostNext();
			}
			, error: function (req, txt, err) { alert("向服务器发送文件夹Complete信息错误！" + req.responseText); }
			, complete: function (req, sta) { req = null; }
        });
    };

    //一般在StopAll()中调用
    this.stop_manual = function ()
    {
        this.app.stopFile({ id: this.id });
        this.State = HttpUploaderState.Stop;
    };
    //手动点击“停止”按钮时
    this.stop = function ()
    {
        this.ui.btn.del.hide();
        this.ui.btn.cancel.hide();
        this.ui.btn.stop.hide();
        this.ui.btn.post.hide();
        this.svr_update();
        this.app.stopFile({ id: this.id });
    };

    //从上传列表中删除上传任务
    this.remove = function ()
    {
        this.app.delFolder({ id: this.id });
        this.manager.Delete(this.id);
        this.ui.div.remove();
        this.ui.split.remove();
    };
}