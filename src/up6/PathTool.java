package up6;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

public class PathTool {

	public static String getName(String n){
		File f = new File(n);
		return f.getName();
	}
	public static String getExtention(String n){
		String name = getName(n);

		int extIndex = name.lastIndexOf(".");
		//有扩展名
		if(-1 != extIndex)
		{
			String ext = name.substring(extIndex + 1);
			return ext;
		}
		return "";
	}
	
	public static Boolean exist(String v)
	{
		File f = new File(v);
		return f.exists();
	}
	
	public static void createDirectory(String v){

		File fd = new File(v);		
		//fix():不创建文件夹
		if(!fd.exists()) fd.mkdirs();
	}
	
	//规范化路径，与操作系统保持一致。
	public static String canonicalPath(String v) throws IOException{
		File f = new File(v);
		return f.getCanonicalPath();
	}
	
	public static String combine(String a,String b) throws IOException
	{
		boolean split = a.endsWith("\\");
		if(!split) split = a.endsWith("/");		
		//没有斜杠
		if(!split)
		{
			File ps = new File(a.concat("/").concat(b));
			return ps.getCanonicalPath();
		}//有斜框
		else{
			File ps = new File(a.concat(b));
			return ps.getCanonicalPath();
		}
	}
	
	public static String url_decode(String v)
	{
		v = v.replace("+","%20");	
		try {
			v = URLDecoder.decode(v,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}//utf-8解码//客户端使用的是encodeURIComponent编码，
		return v;
	}
}
