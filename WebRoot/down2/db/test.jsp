<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@	 
	page import="org.apache.commons.lang.*" %><%@ 
	page import="java.net.URLDecoder" %><%@ 
	page import="java.net.URLEncoder" %><%@ 
	page import="java.io.*" %><%
/*
	下载文件数据
	更新记录：
		2015-05-11 创建
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

File f = new File("D:\\Soft\\QQ.exe");
%><%=f.getName()%>