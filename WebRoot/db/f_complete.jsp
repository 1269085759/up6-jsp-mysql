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
String id		= request.getParameter("id");
String callback = request.getParameter("callback");//jsonp

//返回值。1表示成功
int ret = 0;
if ( !StringUtils.isBlank(uid)
	&& !StringUtils.isBlank(id)
	&& !StringUtils.isBlank(md5))
{
	DBFile db = new DBFile();
	db.UploadComplete(md5);	
	ret = 1;
}
%><%=callback + "(" + ret + ")"%>