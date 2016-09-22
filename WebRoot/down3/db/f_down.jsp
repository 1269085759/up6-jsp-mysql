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

String fid 	= request.getParameter("fid");
if (StringUtils.isBlank(fid))
{
	return;
}

xdb_files inf = new xdb_files();
DBFile db = new DBFile();
//文件不存在
if(!db.GetFileInfByFid(Integer.parseInt(fid),inf))
{
	return;
}
File f = new File(inf.pathSvr);
long fileLen = f.length();
RandomAccessFile raf = new RandomAccessFile(inf.pathSvr,"r");
FileInputStream in = new FileInputStream( raf.getFD() );

String fileName = inf.nameLoc;//QQ.exe
fileName = URLEncoder.encode(fileName,"UTF-8");
fileName = fileName.replaceAll("\\+","%20");
response.setContentType("application/x-download");
response.setHeader("Pragma","No-cache");  
response.setHeader("Cache-Control","no-cache");  
response.setDateHeader("Expires", 0);
response.addHeader("Content-Disposition","attachment;filename=" + fileName);

OutputStream os = null;
try
{
	os = response.getOutputStream();
	String range = request.getHeader("Range");
	long rangePos = 0;
	if(range != null)
	{
		//客户端提交的字段：0-100
		String[] rs = range.split("-");//bytes=10254
		int numBegin = rs[0].indexOf("=")+1;
		String pos = rs[0].substring(numBegin);
		
		rangePos = Long.parseLong(pos);//起始位置
	}
	response.addHeader("Content-Length",Long.toString(inf.lenLoc-rangePos));
	
	response.setHeader("Content-Range",new StringBuffer()
		.append("bytes ")
		.append(rangePos)//起始位置
		.append("-")
		.append(Long.toString(fileLen-1)).toString()//结束位置
		);
	byte[] b = new byte[1024];
	int i = 0;
	in.skip(rangePos);//定位索引
	
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
catch(Exception e){}
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