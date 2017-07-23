<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="down2.biz.*" %><%@  
	page import="down2.model.*" %><%@
	page import="up6.*" %><%@  
	page import="java.net.URLDecoder" %><%@ 
	page import="java.net.URLEncoder" %><%@ 
	page import="org.apache.commons.lang.*" %><%@ 
	page import="com.google.gson.FieldNamingPolicy" %><%@ 
	page import="com.google.gson.Gson" %><%@ 
	page import="com.google.gson.GsonBuilder" %><%@ 
	page import="com.google.gson.annotations.SerializedName" %><%@ 
	page import="java.io.*" %><%
/*
	
    从up6_files中获取文件夹文件列表
	更新记录：
		2015-05-13 创建
		2016-07-29 更新
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String id	= request.getParameter("id");
String cbk	= request.getParameter("callback");
String json = cbk + "({\"value\":null})";

if (  !StringUtils.isEmpty(id)	)
{
	String data = DnFolder.all_file(id);
	//XDebug.Output("文件列表",data);
	data = URLEncoder.encode(data,"utf-8");
	data = data.replace("+","%20");
	json = cbk + "({\"value\":\""+data+"\"})";
}
out.write(json);
%>