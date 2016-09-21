package up6.biz;

import java.io.File;
import java.io.IOException;

import org.apache.commons.lang.StringUtils;

import up6.model.xdb_files;


public class PathBuilder {
	
	public PathBuilder(){}
	
	/**
	 * 获取上传路径
	 * 格式：
	 * 	webapp_name/upload
	 * @return
	 * @throws IOException
	 */
	public String getRoot() throws IOException{

		String path = new String("");
		//前面会多返回一个"/", 例如  /D:/test/WEB-INF/, 奇怪, 所以用 substring()
		path = this.getClass().getResource("/").getPath().substring(1).replaceAll("//", "/");
		if ( !StringUtils.isBlank(path) && !path.endsWith("/"))
		{
			path = path.concat("/");    //避免 WebLogic 和 WebSphere 不一致
		}
		path = path.replace("classes/", "");
		//D:/apache-tomcat-6.0.29/webapps/Uploader6.1MySQL/WEB-INF/
		path = path.replace("%20", " ");//fix(2016-02-29):如果路径中包含空格,getPath会自动转换成%20
		//D:/apache-tomcat-6.0.29/webapps/Uploader6.1MySQL
		path = path.replace("WEB-INF/", "");
		//D:/apache-tomcat-6.0.29/webapps/Uploader6.1MySQL/upload
		path = path.concat("upload/");
		
		File f = new File(path);
		//D:/apache-tomcat-6.0.29/webapps/Uploader6.1MySQL
		path = f.getCanonicalPath();//取规范化的路径。
		return path;
	}
	public String genFolder(int uid,String nameLoc) throws IOException{return "";}
	public String genFile(int uid,xdb_files f) throws IOException{return "";}
	public String genFile(int uid,String md5,String nameLoc)throws IOException{return "";}

}
