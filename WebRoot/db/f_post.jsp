<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@
	page import="org.apache.commons.fileupload.FileItem" %><%@
	page import="org.apache.commons.fileupload.FileItemFactory" %><%@
	page import="org.apache.commons.fileupload.FileUploadException" %><%@
	page import="org.apache.commons.fileupload.disk.DiskFileItemFactory" %><%@
	page import="org.apache.commons.fileupload.servlet.ServletFileUpload" %><%@
	page import="org.apache.commons.lang.StringUtils" %><%@
	page import="java.net.URLDecoder"%><%@ 
	page import="java.util.Iterator"%><%@ 
	page import="java.util.List"%><%
/*
	此页面负责将文件块数据写入文件中。
	此页面一般由控件负责调用
	参数：
		uid
		idSvr
		md5
		lenSvr
		pathSvr
		RangePos
		fd_idSvr
		fd_lenSvr
	更新记录：
		2012-04-12 更新文件大小变量类型，增加对2G以上文件的支持。
		2012-04-18 取消更新文件上传进度信息逻辑。
		2012-10-25 整合更新文件进度信息功能。减少客户端的AJAX调用。
		2014-07-23 优化代码。
		2015-03-19 客户端提供pathSvr，此页面减少一次访问数据库的操作。
		2016-04-09 优化文件存储逻辑，增加更新文件夹进度逻辑
*/
//String path = request.getContextPath();
//String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid 			= "";// 		= request.getParameter("uid");
String idSvr 		= "";// 		= request.getParameter("fid");
String md5 			= "";// 			= request.getParameter("md5");
String perSvr 		= "";
String lenSvr		= "";
String lenLoc		= "";
String f_pos 		= "";// 	= request.getParameter("RangePos");
String complete		= "false";//文件块是否已发送完毕（最后一个文件块数据）
String fd_idSvr		= "";
String fd_lenSvr	= "";
String fd_perSvr	= "0%";
String pathSvr		= "";//add(2015-03-19):服务器文件路径由客户端提供，此页面减少一次访问数据库的操作。
 
// Check that we have a file upload request
boolean isMultipart = ServletFileUpload.isMultipartContent(request);
FileItemFactory factory = new DiskFileItemFactory();   
ServletFileUpload upload = new ServletFileUpload(factory);
//upload.setSizeMax(262144);//256KB
List files = null;
try 
{
	files = upload.parseRequest(request);
} 
catch (FileUploadException e) 
{// 解析文件数据错误  
    out.println("read file data error:" + e.toString());
    return;
   
}

FileItem rangeFile = null;
// 得到所有上传的文件
Iterator fileItr = files.iterator();
// 循环处理所有文件
while (fileItr.hasNext()) 
{
	// 得到当前文件
	rangeFile = (FileItem) fileItr.next();
	// 忽略简单form字段而不是上传域的文件域(<input type="text" />等)
	if(rangeFile.isFormField())
	{
		String fn = rangeFile.getFieldName();
		String fv = rangeFile.getString(); 
		if(fn.equals("uid")) uid = fv;
		if(fn.equals("idSvr")) idSvr = fv;
		if(fn.equals("md5")) md5 = fv;
		if(fn.equals("lenSvr")) lenSvr = fv;
		if(fn.equals("lenLoc")) lenLoc = fv;
		if(fn.equals("perSvr")) perSvr = fv;
		if(fn.equals("fd-idSvr")) fd_idSvr = fv;
		if(fn.equals("fd-lenSvr")) fd_lenSvr = fv;
		if(fn.equals("fd-perSvr")) fd_perSvr = fv;
		if(fn.equals("RangePos")) f_pos = fv;
		if(fn.equals("complete")) complete = fv;
		if(fn.equals("pathSvr")) pathSvr = fv;//add(2015-03-19):
	}
	else 
	{
		break;
	}
}

//参数为空
if ( 	StringUtils.isBlank( lenSvr )
	|| 	StringUtils.isBlank( uid )
	|| 	StringUtils.isBlank( idSvr )
	|| 	StringUtils.isBlank( md5 )
	|| 	StringUtils.isBlank( f_pos) 
	|| 	StringUtils.isBlank(pathSvr))
{
	XDebug.Output("uid", uid);
	XDebug.Output("idSvr", idSvr);
	XDebug.Output("md5", md5);
	XDebug.Output("f_pos", f_pos);
	XDebug.Output("param is null");
	return;
}

	pathSvr	= pathSvr.replace("+","%20");	
	pathSvr = URLDecoder.decode(pathSvr,"UTF-8");//utf-8解码//客户端使用的是encodeURIComponent编码，

	XDebug.Output("perSvr", perSvr);
	XDebug.Output("lenSvr", lenSvr);
	XDebug.Output("lenLoc", lenLoc);
	XDebug.Output("uid", uid);
	XDebug.Output("idSvr", idSvr);
	XDebug.Output("f_pos", f_pos);
	XDebug.Output("complete", complete);
	XDebug.Output("pathSvr",pathSvr);
	XDebug.Output("fd_idSvr",fd_idSvr);
	XDebug.Output("fd_lenSvr",fd_lenSvr);
	XDebug.Output("fd_perSvr",fd_perSvr);
	
	//保存文件块数据
	FileResumerPart res = new FileResumerPart();
	res.m_RangePos = Long.parseLong(f_pos);
	res.SaveFileRange(rangeFile, pathSvr);
	boolean cmp = StringUtils.equals(complete,"true");
	
	//更新文件进度信息
	DBFile db = new DBFile();
	boolean fd = !StringUtils.isBlank(fd_idSvr);
	if(fd) fd = !StringUtils.isBlank(fd_lenSvr);
	if(fd) fd = Integer.parseInt(fd_idSvr)>0;
	if(fd) fd = Long.parseLong(fd_lenSvr)>0;
	if(fd)
	{
		db.fd_fileProcess(Integer.parseInt(uid),Integer.parseInt(idSvr),Long.parseLong(f_pos),Long.parseLong(lenSvr),perSvr,Integer.parseInt(fd_idSvr),Long.parseLong(fd_lenSvr),fd_perSvr,cmp);
	}
	else
	{
		db.f_process(Integer.parseInt(uid),Integer.parseInt(idSvr),Long.parseLong(f_pos),Long.parseLong(lenSvr),perSvr,cmp);		
	}
			
	out.write("ok");

%>