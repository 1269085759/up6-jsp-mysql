<%@ page language="java" import="up6.DBFolder" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="up6.model.FolderInf" %><%@
	page import="org.apache.commons.lang.StringUtils" %><%/*
	以JSON格式返回文件夹信息。
	更新记录：
		2014-07-21 创建
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String fid 			= request.getParameter("fid");
String callback 	= request.getParameter("callback");//jsonp

//参数为空
if (StringUtils.isBlank(fid) )
{	
	out.write(callback + "(0)");
}
else
{
	FolderInf folder = new FolderInf();
	String json = DBFolder.GetFilesUnComplete(Integer.parseInt(fid),folder);
	out.write(callback + "(" + json + ")");
}%>