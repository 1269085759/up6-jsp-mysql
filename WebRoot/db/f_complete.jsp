<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="org.apache.commons.lang.StringUtils" %><%
/*
	此页面主要用来向数据库添加一条记录。
	一般在 HttpUploader.js HttpUploader_MD5_Complete(obj) 中调用
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
*/

String md5 		= request.getParameter("md5");
String uid 		= request.getParameter("uid");
String fid		= request.getParameter("idSvr");
String fd_id	= request.getParameter("fd_idSvr");
String callback = request.getParameter("callback");//jsonp

//返回值。1表示成功
int ret = 0;
if ( !StringUtils.isBlank(uid)
	&& !StringUtils.isBlank(fid)
	&& !StringUtils.isBlank(md5))
{
	DBFile db = new DBFile();
	db.UploadComplete(md5);	
	ret = 1;
}

//更新文件夹已上传文件数
if(!StringUtils.isBlank(fd_id))
{
	DBFolder.child_complete(Integer.parseInt(fd_id));
}
%><%=callback + "(" + ret + ")"%>