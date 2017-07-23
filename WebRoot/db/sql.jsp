<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%><%@ 
	page import="java.io.File"%><%@
	page import="java.io.BufferedReader"%><%@
	page import="java.io.FileReader"%><%@
	page import="java.io.InputStreamReader"%><%@
	page import="java.io.FileInputStream"%><%@
	page import="up6.DbHelper"%><%@
	page import="up6.PathTool"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";


String pathCur = application.getRealPath(request.getServletPath());
String pathParent = new File(pathCur).getParent();
pathParent = new File(pathParent).getParent();
String sqlDir = PathTool.combine(pathParent,"sql");
String downDir = PathTool.combine(pathParent,"sql.down");
DbHelper db = new DbHelper();
String[] sql_clear = {
					 "DROP PROCEDURE if exists fd_files_check"
					,"DROP PROCEDURE if exists fd_add_batch"
					,"DROP TABLE IF EXISTS up6_files"
					,"DROP TABLE IF EXISTS up6_folders"
					,"DROP TABLE IF EXISTS down_files"
					,"DROP TABLE IF EXISTS down_folders"
					};
for(String str : sql_clear)
{
	db.ExecuteNonQuery(str);	
}

File dir = new File(sqlDir);
if(dir.exists())
{
	File[] files = dir.listFiles();
	if(files.length > 0)
	{
		for(File file : files)
		{
			if(file.getName().endsWith(".sql"))
			{
				InputStreamReader isr = new InputStreamReader(new FileInputStream(file), "UTF-8");
				BufferedReader reader = new BufferedReader(isr);
				StringBuffer buffer = new StringBuffer();
				String text;
				while((text = reader.readLine()) != null)
				{
					buffer.append(text + "\n");
				}
				String output = buffer.toString();
				db.ExecuteNonQuery(output);
			}
		}
	}	
}

dir = new File(downDir);
if(dir.exists())
{
	File[] files = dir.listFiles();
	if(files.length > 0)
	{
		for(File file : files)
		{
			if(file.getName().endsWith(".sql"))
			{
				InputStreamReader isr = new InputStreamReader(new FileInputStream(file), "UTF-8");
				BufferedReader reader = new BufferedReader(isr);
				StringBuffer buffer = new StringBuffer();
				String text;
				while((text = reader.readLine()) != null)
				{
					buffer.append(text + "\n");
				}
				String output = buffer.toString();
				db.ExecuteNonQuery(output);
			}
		}
	}
}
out.write("数据库初始化完毕");
%>


