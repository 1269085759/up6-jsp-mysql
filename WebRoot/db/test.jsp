<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page contentType="text/html;charset=UTF-8"%><%@
	page import="java.net.URLDecoder" %><%@
	page import="up6.*" %><%@
	page import="java.sql.*" %><%@ 
	page import="net.sf.json.JSONArray" %><%@ 
	page import="net.sf.json.JSONObject" %><%@ 
	page import="net.sf.json.util.JSONUtils" %><%@ 
	page import="com.google.gson.Gson" %><%@ 
	page import="com.google.gson.GsonBuilder" %><%@ 
	page import="com.google.gson.annotations.SerializedName" %><%@	 
	page import="org.apache.commons.fileupload.*" %><%@ 
	page import="org.apache.commons.fileupload.disk.*" %><%@ 
	page import="org.apache.commons.fileupload.servlet.*" %><%@  
	page import="java.io.*" %><%
/*
	此页面主要用来向数据库添加一条记录。
	一般在 HttpUploader.js HttpUploader_MD5_Complete(obj) 中调用
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，
*/

XDebug.Output("测试5");
try 
{
	DbHelper db = new DbHelper();
    String sql = "{call fd_files_check(?)}";

    CallableStatement cmd = db.GetCommandStored(sql);
    
    cmd.setString(1, "f27a549a9d87eb927c35a9b09ef0dc0a");
    ResultSet rs = cmd.executeQuery();
    while(rs.next())
    {
    	out.write(rs.getString("f_nameLoc"));
    }
    rs.close();
    cmd.close();
} catch (SQLException e) 
{
	// TODO Auto-generated catch block
	e.printStackTrace();
}
%>