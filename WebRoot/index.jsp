<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
String clientCookie = request.getHeader("Cookie");
%><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>HttpUploader6.2-MySQL演示页面</title>
    <link href="js/up6.css" type="text/css" rel="Stylesheet"/>
    <script type="text/javascript" src="js/jquery-1.4.min.js"></script>
    <script type="text/javascript" src="js/json2.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/up6.config.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/up6.file.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/up6.folder.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/up6.js" charset="utf-8"></script>
    <script language="javascript" type="text/javascript">
    	var cbMgr = new HttpUploaderMgr();
    	cbMgr.event.md5Complete = function (obj, md5) { /*alert(md5);*/ };
        cbMgr.event.fileComplete = function (obj) { /*alert(obj.pathSvr);*/ };
    	cbMgr.Config["Cookie"] = 'JSESSIONID=<%=request.getSession().getId()%>';
    	cbMgr.Config.Fields["test"] = "test";

    	$(document).ready(function()
    	{
    		cbMgr.load_to("FilePanel");
        });

    	//上传本地文件
        function postFileLoc()
        {
            cbMgr.addFileLoc("D:\\soft\\QQ2013.exe");
            cbMgr.PostFirst();
        }
    </script>
  </head>
  
  <body>
	<p>up6.2多文件上传演示页面</p>
	<a href="db/clear.jsp" target="_blank">清空数据库</a>
	<p><a href="index-single.htm" target="_blank">打开单面板上传页面</a></p>
	<p><a href="down2/index.htm" target="_blank">打开下载页面</a></p>
	<div id="FilePanel"></div>
	<div id="msg"></div>
  </body>
</html>
