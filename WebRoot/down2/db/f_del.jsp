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
	page import="java.io.*" %><%/*
	从down_files中删除文件下载任务
	更新记录：
		2015-05-13 创建
		2016-07-29 更新。
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String fid = request.getParameter("id");
String uid = request.getParameter("uid");
String cbk = request.getParameter("callback");//jsonp

if (	StringUtils.isEmpty(uid)
	||	StringUtils.isBlank(fid)
	)
{
	out.write(cbk + "({\"value\":null})");
	return;
}
DnFile.Delete(fid,Integer.parseInt(uid) );
out.write(cbk+"({\"value\":1})");%>