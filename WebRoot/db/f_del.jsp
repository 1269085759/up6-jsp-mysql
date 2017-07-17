<%@ page language="java" import="up6.DBFile" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="org.apache.commons.lang.StringUtils" %><%
/*
	此页面主要用来向数据库添加一条记录。
	一般在 HttpUploader.js HttpUploader_MD5_Complete(obj) 中调用
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String fid = request.getParameter("id");
String uid = request.getParameter("uid");
String callback = request.getParameter("callback");//jsonp
int ret = 0;

if (	!StringUtils.isBlank(fid)
	&&	!StringUtils.isBlank(uid))
{
	DBFile db = new DBFile();
	db.Delete(Integer.parseInt(uid),fid);
	ret = 1;
}
%><%= callback + "(" + ret + ")" %>