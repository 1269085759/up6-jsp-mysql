<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="down2.biz.*" %><%@
	page import="down2.model.*" %><%@
	page import="java.net.URLDecoder" %><%@ 
	page import="java.net.URLEncoder" %><%@ 
	page import="org.apache.commons.lang.*" %><%@ 
	page import="com.google.gson.FieldNamingPolicy" %><%@ 
	page import="com.google.gson.Gson" %><%@ 
	page import="com.google.gson.GsonBuilder" %><%@ 
	page import="com.google.gson.annotations.SerializedName" %><%@ 
	page import="java.io.*" %><%
/*
	列出所有已经上传完的文件和文件夹列表
	主要从up6_files中读取数据
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
		2016-07-29 更新
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid 		 = request.getParameter("uid");
String cbk  	 = request.getParameter("callback");//jsonp

if (!StringUtils.isEmpty(uid))
{
	DnFile db = new DnFile();	
	String json = db.all_complete(Integer.parseInt(uid));
	if(!StringUtils.isBlank(json))
	{
		System.out.println("上传文件列表："+json);
		json = URLEncoder.encode(json,"utf-8");
		json = json.replace("+","%20");
		out.write(cbk + "({\"value\":\""+json+"\"})");
		return;
	}
}
out.write(cbk+"({\"value\":null})");
%>