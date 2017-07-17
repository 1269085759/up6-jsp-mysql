<%@ page language="java" import="up6.DBFile" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="org.apache.commons.lang.StringUtils" %><%

/*
	更新文件进度或文件夹进度，百分比
*/

String id 			= request.getParameter("id");
String uid 			= request.getParameter("uid");
String offset 		= request.getParameter("offset");
String lenSvr 		= request.getParameter("lenSvr");
String perSvr 		= request.getParameter("perSvr");
String callback 	= request.getParameter("callback");
int ret = 0;

if (	!StringUtils.isBlank(id)
	&&	!StringUtils.isBlank(lenSvr)
	&&	!StringUtils.isBlank(perSvr))
	{
		DBFile db = new DBFile();
		db.f_process(Integer.parseInt(uid),id,Long.parseLong(offset),Long.parseLong(lenSvr),perSvr);
		ret = 1;
	}
%><%=callback + "({\"value\":"+ret+"})"%>