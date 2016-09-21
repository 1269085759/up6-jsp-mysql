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
	
    /// 创建一个文件夹下载任务。
    /// JSON格式：
    /// {
    //	"m_perSvr": "100%",
    //	"nameLoc": "files-1",
    //	"lenLoc": 12244936,
    //	"size": "11.6MB",
    //	"lenSvr": 12244936,
    //	"perSvr": "100%",
    //	"pidLoc": 0,
    //	"pidSvr": 0,
    //	"idLoc": 0,
    //	"idSvr": 1421,
    //	"idFile": 2524,
    //	"uid": 0,
    //	"foldersCount": 0,
    //	"filesCount": 1,
    //	"filesComplete": 0,
    //	"pathLoc": "C: \\\\Users\\\\Administrator\\\\Desktop\\\\test\\\\files-1",
    //	"pathSvr": "",
    //	"pidRoot": 0,
    //	"pathRel": "",
    //	"files": [{
    //		"nameLoc": "360wangpan_setup.exe",
    //		"pathLoc": "C:\\\\Users\\\\Administrator\\\\Desktop\\\\test\\\\files-1\\\\360wangpan_setup.exe",
    //		"pathSvr": "F:\\\\csharp\\\\HttpUploader6\\\\trunk\\\\v1.3-fd\\\\upload\\\\2016\\\\07\\\\24\\\\a03b6d45916dcd6db43d1660ac789f78.exe",
    //		"md5": "a03b6d45916dcd6db43d1660ac789f78",
    //		"pidLoc": 0,
    //		"pidSvr": 1421,
    //		"pidRoot": 1421,
    //		"idLoc": 0,
    //		"idSvr": 2525,
    //		"uid": 0,
    //		"lenLoc": 12244936,
    //		"sizeLoc": "11.6MB",
    //		"lenSvr": 12244936,
    //		"postPos": 0,
    //		"perSvr": "0%",
    //		"pathRel": null,
    //		"complete": false,
    //		"nameSvr": null
    //    }]
    //}
	更新记录：
		2015-05-13 创建
		2016-07-29 更新
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid 		= request.getParameter("uid");
String fdSvr	= request.getParameter("folder");
fdSvr		 	= fdSvr.replaceAll("\\+","%20");//fix(2015-07-31):防止中文名称出现乱码
fdSvr			= URLDecoder.decode(fdSvr,"UTF-8");//utf-8解码

if (StringUtils.isBlank(uid)
	||StringUtils.isBlank(fdSvr)
	)
{
	out.write(0);
	return;
}
Gson g = new Gson();
DnFolderInf fd = g.fromJson(fdSvr,DnFolderInf.class);
folder_appender fa = new folder_appender();
fa.add(fd);

String json = g.toJson(fd);
json = URLEncoder.encode(json,"utf-8");
//UrlEncode会将空格解析成+号
json = json.replaceAll("\\+", "%20");
out.write(json);
%>