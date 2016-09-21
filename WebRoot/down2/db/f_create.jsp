<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="down2.model.*" %><%@
	page import="down2.biz.*" %><%@ 
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
		2016-01-08 规范json返回值格式和数据
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid 		 = request.getParameter("uid");
String nameLoc 	 = request.getParameter("nameCustom");
String pathLoc	 = request.getParameter("pathLoc");
String pathSvr	 = request.getParameter("fileUrl");
String lenSvr 	 = request.getParameter("lenSvr");
String sizeSvr 	 = request.getParameter("sizeSvr"); 
String cbk  	 = request.getParameter("callback");//jsonp
pathLoc 		 = pathLoc.replaceAll("\\+","%20");
nameLoc			 = pathSvr.replaceAll("\\+","%20");
pathLoc			 = URLDecoder.decode(pathLoc,"UTF-8");//utf-8解码
nameLoc			 = URLDecoder.decode(pathSvr,"UTF-8");//utf-8解码

if (StringUtils.isBlank(uid)
	||StringUtils.isBlank(pathLoc)
	||StringUtils.isBlank(pathSvr)
	||StringUtils.isBlank(lenSvr))
{
	out.write(cbk + "({\"value\":null}) ");
	return;
}

DnFileInf	inf = new DnFileInf();
inf.uid = Integer.parseInt(uid);
inf.nameLoc = nameLoc;
inf.pathLoc = pathLoc;
inf.fileUrl = pathSvr;
inf.lenSvr = Long.parseLong(lenSvr);
inf.sizeSvr = sizeSvr;

DnFile db = new DnFile();
inf.idSvr = db.Add(inf);

Gson gson = new Gson();
String json = gson.toJson(inf);
json = URLEncoder.encode(json,"UTF-8");
json = json.replaceAll("\\+","%20");
json = cbk + "({\"value\":\"" + json + "\"})";//返回jsonp格式数据。
out.write(json);%>