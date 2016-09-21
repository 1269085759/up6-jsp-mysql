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
	此页面主要用来向数据库添加一条记录。
	一般在 HttpUploader.js HttpUploader_MD5_Complete(obj) 中调用
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
*/
String fid 		= request.getParameter("idSvr");
String uid 		= request.getParameter("uid");
String lenLoc	= request.getParameter("lenLoc");
String per		= request.getParameter("perLoc");
String cbk 		= request.getParameter("callback");//jsonp
//
String file_id  = request.getParameter("file_id");
String file_lenLoc = request.getParameter("file_lenLoc");
String file_per = request.getParameter("file_per");

if (StringUtils.isBlank(uid)
	||StringUtils.isBlank(fid)
	||StringUtils.isBlank(cbk)
	||StringUtils.isBlank(lenLoc))
{
	out.write(cbk + "({\"value\":0})");
	return;
}

DnFile db = new DnFile();
if(Integer.parseInt(fid)>0)db.updateProcess(Integer.parseInt(fid),Integer.parseInt(uid),lenLoc,per);
//更新子文件
if (!StringUtils.isBlank(file_id) && !StringUtils.isBlank(file_lenLoc))
{
    db.updateProcess(Integer.parseInt(file_id), Integer.parseInt(uid), file_lenLoc, file_per);
}
out.write(cbk + "({\"value\":1})");%>