<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="org.apache.commons.lang.StringUtils" %><%
/*
	此页面主要用来执行删除文件夹逻辑。
	只修改数据库中文件夹状态。
	更新记录：
		2014-07-24 创建
*/
String path = request.getContextPath();

String fid 	= request.getParameter("fid");
String fd_id= request.getParameter("fd_id");
String uid 	= request.getParameter("uid");
String cbk	= request.getParameter("callback");//jsonp
int ret = 0;

//参数为空
if (	!StringUtils.isBlank(fid)
	&&	!StringUtils.isBlank(fd_id) 
	&&	uid.length() > 0)
{
	DBFolder.Remove(Integer.parseInt(fid),Integer.parseInt(fd_id), Integer.parseInt(uid));
	ret = 1;
}
out.write(cbk + "({\"value\":" + ret + "})" );
%>