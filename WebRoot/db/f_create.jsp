<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@	
	page import="net.sf.json.*" %><%@
	page import="up6.biz.*" %><%@
	page import="up6.model.*" %><%@	
	page import="org.apache.commons.lang.StringUtils" %><%@
	page import="java.net.URLDecoder" %><%@
	page import="java.net.URLEncoder" %><%/*
	所有单个文件均以md5模式存储。
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
		2015-07-30 取消文件夹层级结构存储规则，改为使用日期存储规则，文件夹层级结构仅保存在数据库中。
		2016-01-07
			返回值改为JSON
			优化导入包
			优化变量名称
		2016-04-09 完善逻辑。
	JSON格式化工具：http://tool.oschina.net/codeformat/json
*/

String md5 		= request.getParameter("md5");
String uid 		= request.getParameter("uid");
String lenLoc	= request.getParameter("lenLoc");//数字化的文件大小。12021
String sizeLoc	= request.getParameter("sizeLoc");//格式化的文件大小。10MB
String callback	= request.getParameter("callback");//表示此文件是不是文件夹的子项。
String pathLoc	= request.getParameter("pathLoc");
pathLoc			= pathLoc.replace("+","%20");
pathLoc			= URLDecoder.decode(pathLoc,"UTF-8");//utf-8解码

//参数为空
if (	StringUtils.isBlank(md5)
	&& 	StringUtils.isBlank(uid)
	&& 	StringUtils.isBlank(sizeLoc))
{
	out.write(callback + "({\"value\":null})");
	return;
}

xdb_files fileSvr= new xdb_files();
fileSvr.f_fdChild = false;
fileSvr.uid = Integer.parseInt(uid);
fileSvr.nameLoc = PathTool.getName(pathLoc);
fileSvr.pathLoc = pathLoc;
fileSvr.lenLoc = Long.parseLong(lenLoc);
fileSvr.sizeLoc = sizeLoc;
fileSvr.deleted = false;
fileSvr.md5 = md5;
fileSvr.nameSvr = md5 + "." + PathTool.getExtention(fileSvr.nameLoc);

//所有单个文件均以md5方式存储
PathMd5Builder pb = new PathMd5Builder();
fileSvr.pathSvr = pb.genFile(fileSvr.uid,fileSvr);

	DBFile db = new DBFile();
	xdb_files fileExist = new xdb_files();

	boolean exist = db.exist_file(md5,fileExist);
	//数据库已存在相同文件，且有上传进度，则直接使用此信息
	if(exist && fileExist.lenSvr > 1)
	{
		fileSvr.pathSvr		= fileExist.pathSvr;
		fileSvr.perSvr 		= fileExist.perSvr;
		fileSvr.lenSvr		= fileExist.lenSvr;
		fileSvr.complete	= fileExist.complete;		
		fileSvr.idSvr 		= db.Add(fileSvr);	    
	}//此文件不存在
	else
	{
		fileSvr.idSvr = db.Add(fileSvr);	    
		
		FileResumerPart fr = new FileResumerPart();
		fr.CreateFile(fileSvr.pathSvr);		
	}

JSONObject obj = JSONObject.fromObject(fileSvr);
String json = obj.toString();
json = URLEncoder.encode(json,"UTF-8");//编码，防止中文乱码
json = json.replace("+","%20");
json = callback + "({\"value\":\"" + json + "\"})";//返回jsonp格式数据。
out.write(json);%>