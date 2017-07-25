<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="up6.*" %><%@
	page import="up6.model.*" %><%@ 
	page import="java.nio.*" %><%@
	page import="java.nio.channels.*" %><%@
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
	response.setHeader("err","参数为空");
	return;
}
File f = new File(pathSvr);
long fileLen = f.length();

response.setContentType("application/x-download");
response.setHeader("Pragma","No-cache");  
response.setHeader("Cache-Control","no-cache");
response.addHeader("Content-Length",blockSize);  
response.setDateHeader("Expires", 0);

OutputStream os = response.getOutputStream();
try
{
	RandomAccessFile raf = new RandomAccessFile(pathSvr,"r");
	
	int readToLen = Integer.parseInt(blockSize);
	int readLen = 0;
	raf.seek( Long.parseLong(blockOffset) );//定位索引
	byte[] data = new byte[1048576];
	
	while( readToLen > 0 )
	{
		readLen = raf.read(data,0,Math.min(1048576,readToLen) );
		readToLen -= readLen;
		os.write(data, 0, readLen);
		
	}
	os.flush();
	os.close();	
	raf.close();
	os = null;
	response.flushBuffer();	
	
	out.clear();
	out = pageContext.pushBody();
}
catch(Exception e)
{
	response.setStatus(500);
	e.printStackTrace();
}
finally
{	
	if(os != null)
	{
		os.close();		
		os = null;
	}
	out.clear();
	out = pageContext.pushBody();
}%>