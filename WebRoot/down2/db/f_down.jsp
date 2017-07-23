<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="up6.*" %><%@
	page import="up6.model.*" %><%@ 
	page import="java.net.URLDecoder" %><%@ 
	page import="java.net.URLEncoder" %><%@ 
	page import="org.apache.commons.lang.*" %><%@ 
	page import="com.google.gson.FieldNamingPolicy" %><%@ 
	page import="com.google.gson.Gson" %><%@ 
	page import="com.google.gson.GsonBuilder" %><%@ 
	page import="com.google.gson.annotations.SerializedName" %><%@ 
	page import="java.io.*" %><%/*
	下载数据库中的文件。
	相关错误：
		getOutputStream() has already been called for this response
			解决方法参考：http://stackoverflow.com/questions/1776142/getoutputstream-has-already-been-called-for-this-response
	更新记录：
		2015-05-13 创建
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String fid 			= request.getHeader("id");
String blockIndex 	= request.getHeader("blockIndex");//基于1
String blockOffset 	= request.getHeader("blockOffset");//块偏移，相对于整个文件
String blockSize 	= request.getHeader("blockSize");//块大小（当前需要下载的大小）
String pathSvr 		= request.getHeader("pathSvr");//文件在服务器的位置
pathSvr 			= PathTool.url_decode(pathSvr);

if (  StringUtils.isBlank(fid)
	||StringUtils.isBlank(blockIndex)
	||StringUtils.isEmpty(blockOffset)
	||StringUtils.isBlank(blockSize)
	||StringUtils.isBlank(pathSvr))
{
	response.setStatus(500);
	return;
}
File f = new File(pathSvr);
long fileLen = f.length();
RandomAccessFile raf = new RandomAccessFile(pathSvr,"r");
FileInputStream in = new FileInputStream( raf.getFD() );

response.setContentType("application/x-download");
response.setHeader("Pragma","No-cache");  
response.setHeader("Cache-Control","no-cache");  
response.setDateHeader("Expires", 0);

OutputStream os = null;
try
{
	os = response.getOutputStream();
	response.addHeader("Content-Length",blockSize);
	byte[] b = new byte[1048576];
	int i = 0;
	in.skip(Long.parseLong(blockOffset) );//定位索引
	
	while((i = in.read(b)) > 0 )
	{
		os.write(b, 0, i);
	}
	os.flush();
	os.close();		
	os = null;
	response.flushBuffer();	
	
	out.clear();
	out = pageContext.pushBody();
}
catch(Exception e){response.setStatus(500);}
finally
{	
	if(os != null)
	{
		os.close();		
		os = null;
	}
	out.clear();
	out = pageContext.pushBody();
}
in.close();
in = null;%>