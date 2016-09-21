<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@
	page import="org.apache.commons.lang.StringUtils" %><%
/*
	此页面主要更新文件夹数据表。已上传字段
	更新记录：
		2014-07-23 创建
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String id_file	= request.getParameter("id_file");
String id_fd	= request.getParameter("id_folder");
String uid	= request.getParameter("uid");
String cbk 	= request.getParameter("callback");//jsonp
int ret = 0;

//参数为空
if (	!StringUtils.isBlank(uid)
	||	!StringUtils.isBlank(id_fd))
{
	DBFile.fd_complete(id_file,id_fd,uid);
	ret = 1;
}
out.write(cbk + "(" + ret + ")");
%>