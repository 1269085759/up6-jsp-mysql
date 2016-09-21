<%@ page language="java" import="up6.*" pageEncoding="UTF-8"%><%@
	page contentType="text/html;charset=UTF-8"%><%@ 
	page import="down2.biz.*" %><%@
	page import="org.apache.commons.lang.StringUtils" %><%@
	page import="java.net.URLEncoder" %><%
/*
	列出所有文件，文件夹，包括未完成的，已经上传完成的。	
	更新记录：
		2012-05-24 完善
		2012-06-29 增加创建文件逻辑，

	JSON格式化工具：http://tool.oschina.net/codeformat/json
*/
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

String uid = request.getParameter("uid");
String cbk = request.getParameter("callback");//jsonp
String json = cbk + "({\"value\":null})";


if(! StringUtils.isBlank(uid) )
{
	cmp_builder cb = new cmp_builder();
	json = cb.read(Integer.parseInt(uid));
	if(!StringUtils.isBlank(json))
	{
		json = URLEncoder.encode(json,"utf-8");
		//encode会将空格解析成+号
		json = json.replaceAll("\\+","%20");
		out.write(cbk + "({\"value\":\""+json+"\"})");
		return;
	}
}
out.write(json);
%>