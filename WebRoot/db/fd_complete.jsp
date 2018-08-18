<%@ page language="java" import="up6.DBFile" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="up6.DBFolder" %><%@
	page import="up6.model.FileInf" %><%@
	page import="up6.biz.folder.*" %><%@
	page import="org.apache.commons.lang.StringUtils" %><%
/*
	此页面主要更新文件夹数据表。已上传字段
	更新记录：
		2014-07-23 创建
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String id	= request.getParameter("id");
String uid	= request.getParameter("uid");
String cbk 	= request.getParameter("callback");//jsonp
int ret = 0;

//参数为空
if (	!StringUtils.isBlank(uid)
	||	!StringUtils.isBlank(id))
{
	FileInf inf = new FileInf();
	DBFile db = new DBFile();
	db.query(id,inf);
	String root = inf.pathSvr;
	
	//上传完毕
	DBFile.fd_complete(id,uid);
	
	//扫描文件夹结构
	fd_scan sa = new fd_scan();
	sa.scan(inf,root);
	
	DBFile.fd_scan(id,uid);
	ret = 1;
}
out.write(cbk + "(" + ret + ")");
%>