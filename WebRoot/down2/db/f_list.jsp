<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="down2.biz.*" %><%@ 
	page import="java.net.URLDecoder" %><%@ 
	page import="java.net.URLEncoder" %><%@ 
	page import="org.apache.commons.lang.*" %><%@ 
	page import="com.google.gson.FieldNamingPolicy" %><%@ 
	page import="com.google.gson.Gson" %><%@ 
	page import="com.google.gson.GsonBuilder" %><%@ 
	page import="com.google.gson.annotations.SerializedName" %><%@ 
	page import="java.io.*" %><%
/*
	加载未完成的文件和文件夹任务。
	更新记录：
		2015-05-13
		2016-07-29 更新
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid 		 = request.getParameter("uid");
String cbk		 = request.getParameter("callback");

if (!StringUtils.isEmpty(uid))
{
	String json = DnFile.all_uncmp( Integer.parseInt(uid));
	
	if(!StringUtils.isBlank(json))
	{
		json = URLEncoder.encode(json,"utf-8");
		json = json.replaceAll("\\+","%20");//
		json = cbk + "({\"value\":\""+json+"\"})";
		out.write(json);
		return;
	}
}

out.write(cbk + "({\"value\":null})");
%>