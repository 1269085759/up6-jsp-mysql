<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@
	page import="up6.*" %><%@
	page import="up6.model.*" %><%@
	page import="up6.biz.*" %><%@
	page import="net.sf.json.*" %><%@
	page import="java.sql.*" %><%
	
	DbHelper db = new DbHelper();
	String dbStr = "驱动："+db.m_dbDriver + " 地址："+ db.m_dbUrl;		
	
	PathMd5Builder pb = new PathMd5Builder();
	String pathSvr = pb.genFile(0,"md5","QQ2016	.exe");
	pathSvr = pathSvr.replace("\\","/");
	
	JSONObject cfg = new JSONObject();
	cfg.put("conStr",dbStr);
	cfg.put("conState",true);
	cfg.put("uploadPath",pathSvr);
	
	
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
String clientCookie = request.getHeader("Cookie");
%><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>布署检查页面</title>
    <script type="text/javascript" src="../js/jquery-1.4.min.js"></script>
    <script type="text/javascript" src="../js/json2.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="../js/up6.config.js" charset="utf-8"></script>
    <script type="text/javascript" src="../js/up6.js" charset="utf-8"></script>
    <script type="text/javascript">
        var svr = JSON.parse('<%=cfg.toString()%>');
        function add_msg(v) { $("#check_ret").append(v + "<br/>"); }
        function print_svr_inf()
        {
            add_msg("数据库连接信息:"+svr.conStr);
            add_msg("数据库连接测试:"+svr.conState);
            add_msg("文件存储路径:"+svr.uploadPath);
        }
        function check_create(mgr, fn)
        {
            add_msg("开始检查f_create逻辑");

            $.ajax({
                type: "GET"
                 , dataType: 'jsonp'
                 , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
                 , url: mgr.Config["UrlCreate"]
                 , data: { uid: 0, md5: "a", lenLoc: "1", sizeLoc: "1bytes", pathLoc: encodeURIComponent("f:\\test.txt"), time: new Date().getTime() }
                 , success: function (msg)
                 {
                     add_msg("测试f_create成功<br/>" + JSON.stringify(msg));
                     fn();
                 }
                 , error: function (req, txt, err) { add_msg("f_create错误" + req.responseText); fn(); }
                 , complete: function (req, sta) { req = null; }
            });
        }
        function print_config(mgr)
        {
            var cfg_arr = JSON.stringify(mgr.Config).split(",");
            var arr = $.grep(cfg_arr, function (n, i)
            {
                var need = n.indexOf("Company");
                if (need == -1) need = n.indexOf("License");
                if (need == -1) need = n.indexOf("Version");
                if (need == -1) need = n.indexOf("UrlFdCreate");
                if (need == -1) need = n.indexOf("UrlFdComplete");
                if (need == -1) need = n.indexOf("UrlFdDel");
                if (need == -1) need = n.indexOf("UrlCreate");
                if (need == -1) need = n.indexOf("UrlPost");
                if (need == -1) need = n.indexOf("UrlComplete");
                if (need == -1) need = n.indexOf("UrlList");
                if (need == -1) need = n.indexOf("UrlDel");
                if (need == -1) need = n.indexOf("ie");
                if (need == -1) need = n.indexOf("name");
                if (need == -1) need = n.indexOf("firefox");
                if (need == -1) need = n.indexOf("chrome");
                if (need == -1) need = n.indexOf("chrome45");
                if (need == -1) need = n.indexOf("exe");
                //if (need == -1) need = n.indexOf("path");
                return need != -1;
            });
            add_msg("配置信息:<br/>" + arr.join("<br/>"));
        }
        function check_list(mgr)
        {
            add_msg("开始检查f_list逻辑");
            $.ajax({
                type: "GET"
                 , dataType: 'jsonp'
                 , jsonp: "callback" //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
                 , url: mgr.Config["UrlList"]
                 , data: { uid: 0, time: new Date().getTime() }
                 , success: function (msg)
                 {
                     add_msg("测试f_list成功");
                     check_clear();
                 }
                 , error: function (req, txt, err) { add_msg("加载文件列表错误！" + req.responseText); check_clear(); }
                 , complete: function (req, sta) { req = null; }
            });
        }
        function check_clear()
        {
            return;
            $.ajax({
                type: "GET"
                , url: "../db/clear.aspx"
                , success: function (msg) { add_msg("清除数据库成功"); }
                , error: function (req, txt, err) { add_msg("清除数据库错误" + req.responseText); }
                , complete: function (req, sta) { req = null; }
            });
        }

        $(function ()
        {
            print_svr_inf();
            var mgr = new HttpUploaderMgr();
            add_msg("当前访问地址:" + document.URL);
            check_create(mgr, function ()
            {
                print_config(mgr);
                check_list(mgr);
            });
        });
    </script>
  </head>  
  <body>
    <b style="color:red;">请将此文件运行结果截图发给泽优技术工程师</b><br/>
    <div id="check_ret">
    </div>
  </body>
</html>
