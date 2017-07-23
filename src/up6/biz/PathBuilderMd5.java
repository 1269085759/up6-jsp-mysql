package up6.biz;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import up6.PathTool;
import up6.model.FileInf;


public class PathBuilderMd5 extends PathBuilder {
	
	/* 所有文件均以md5模式存储
	 * 格式：
	 * 	upload/年/月/日/md5.ext 
	 */
	public String genFile(int uid,FileInf f) throws IOException{

		SimpleDateFormat fmtDD = new SimpleDateFormat("dd");
		SimpleDateFormat fmtMM = new SimpleDateFormat("MM");
		SimpleDateFormat fmtYY = new SimpleDateFormat("yyyy");
		
		Date date = new Date();
		String strDD = fmtDD.format(date);
		String strMM = fmtMM.format(date);
		String strYY = fmtYY.format(date);
		
		String path = this.getRoot() + "/";
		path = path.concat(strYY);
		path = path.concat("/");
		path = path.concat(strMM);
		path = path.concat("/");
		path = path.concat(strDD);
		path = path.concat("/");
		path = path.concat(f.md5);
		
		File f_p = new File(f.pathLoc);
		String fileName = f_p.getName();
		int extIndex = fileName.lastIndexOf(".");
		//有扩展名
		if(-1 != extIndex)
		{
			path = path.concat(".");
			String ext = fileName.substring(extIndex + 1);
			path = path.concat(ext);	
		}
		
		File fl = new File(path);
		
		return fl.getCanonicalPath();//
	}
	
	public String genFile(int uid, String md5,String nameLoc) throws IOException
    {
		SimpleDateFormat fmtDD = new SimpleDateFormat("dd");
		SimpleDateFormat fmtMM = new SimpleDateFormat("MM");
		SimpleDateFormat fmtYY = new SimpleDateFormat("yyyy");
		
		Date date = new Date();
		String strDD = fmtDD.format(date);
		String strMM = fmtMM.format(date);
		String strYY = fmtYY.format(date);
		
		String path = this.getRoot() + "/";
		path = path.concat(strYY);
		path = path.concat("/");
		path = path.concat(strMM);
		path = path.concat("/");
		path = path.concat(strDD);
		path = path.concat("/");
		path = path.concat(md5);
		path = path.concat(".");
		path = path.concat(PathTool.getExtention(nameLoc));
			
		
		File fl = new File(path);
		
		return fl.getCanonicalPath();//
    }
}