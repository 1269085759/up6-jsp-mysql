package up6;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;

/**
 *文件续传类，负责将文件块写入硬盘中
 */
public class FileResumerPart {
	public long			m_RangeSize;	//当前文件块大小。由SaveFileRange()负责赋值
	public long 		m_RangePos;		//文件块起始位置。一般在ajax_post.jsp中赋值
	public String		m_pathSvr;	//远程文件路径。D:\\webapps\\upload\\2012\\05\\24\\QQ2012.exe
	HttpServletRequest 	m_hsr;
	ServletContext		m_sc;
	
	public FileResumerPart()
	{
	}
	
	/*
	 * 参数：
	 * 	sc	this.getServletContext()
	 * 	hsr	request
	 * */
	public FileResumerPart(ServletContext sc,HttpServletRequest hsr)
	{
		this.m_sc = sc;
		this.m_hsr = hsr;
	}

	//创建文件
	public void CreateFile()
	{
		try 
		{
		    RandomAccessFile raf = new RandomAccessFile(this.m_pathSvr, "rw");
		    raf.setLength(1);//
		    raf.close();

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
	
	/**
	 * 创建文件，一般在 ajax_create_fid.jsp 中调用。
	 * 这样做是为了避免多个用户同时上传相同文件时，频繁创建文件的问题。
	 * @param path	远程文件完整路径。例：d:\\soft\\qq.exe
	 * @param strLen 远程文件大小，以字节为单位。1201254
	 */
	public void CreateFile(String path)
	{
		try 
		{
			try
			{
				//wrtLock = m_wrtLock.writeLock();
				//wrtLock.lock();  
				File fp = new File(path);
				PathTool.createDirectory( fp.getParent());//
			    RandomAccessFile raf = new RandomAccessFile(path, "rw");
			    raf.setLength(0);//fix(2015-03-18):取消按实际大小创建文件，减少用户上传大文件等待的时间。
			    //raf.setLength(Long.parseLong(strLen));//
			    raf.close();
			}
			finally
			{
				//wrtLock.unlock();
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/*
	 * 创建临时文件名称。
	 * 逻辑：
	 * 	临时文件名称 = 远程文件名称 + tmp + 当前时间毫秒数
	 * 说明：
	 * 	加当前时间毫秒是为了防止多个用户同时上传相同文件时，创建临时文件会产生冲突的问题。
	 * 返回值：
	 * 	D:\\webapps\\upload\\2012\\05\\24\\QQ2012.exe.tmp201205241990
	 * */
	public String CreateTmpFileName()
	{
		SimpleDateFormat fmtDD = new SimpleDateFormat("dd");
		SimpleDateFormat fmtMM = new SimpleDateFormat("MM");
		SimpleDateFormat fmtYY = new SimpleDateFormat("yyyy");
		SimpleDateFormat fmtSS = new SimpleDateFormat("SSSS");
		
		Date date = new Date();
		String strDD = fmtDD.format(date);
		String strMM = fmtMM.format(date);
		String strYY = fmtYY.format(date);
		String strSS = fmtSS.format(date);
		
		String name = this.m_pathSvr + ".tmp" + strYY+strMM+strDD+strSS;
		return name;
		
	}
	
	/*
	 * 写入文件块数据
	 * 多线程参考：
	 * 	http://bbs.csdn.net/topics/80382727
	 * 
	 * */
	public synchronized void WriteRangeData(FileItem rangeFile)
	{
		//根据索引将文件块数据写入到在服务端文件中
		try {
			//rangeFile.saveAs(tmpName);

			InputStream stream = rangeFile.getInputStream();			
			byte[] data = new byte[(int)this.m_RangeSize];//128k
			int readLen = stream.read(data);//实际读取的大小
			stream.close();
			XDebug.Output("实际读取的大小",readLen);
			
			//bug:在部分服务器中会出现错误：(另一个程序正在使用此文件，进程无法访问。)
			RandomAccessFile raf = new RandomAccessFile(this.m_pathSvr,"rw");
			//定位文件位置
			raf.seek(this.m_RangePos);
			raf.write(data);

			raf.close();
			XDebug.Output("文件块保存完毕",readLen);
			//file.delete();//删除临时文件		
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/*
	 * 保存文件块
	 * 参数：
	 * 	rangeFile 	文件块
	 *	fileRemote	远程文件路径。d:\\webapps\\httpuploader3\\upload\\QQ2012.exe
	 * */
	public void SaveFileRange(FileItem rangeFile,String pathSvr)
	{
		this.m_pathSvr = pathSvr;
		this.m_RangeSize = rangeFile.getSize();
		try
		{
			File f = new File(pathSvr);
			
			//文件不存在则创建
			if(!f.exists()) this.CreateFile();
			
			
			boolean writeRange = f.length() == 0;
			if(!writeRange) writeRange = this.m_RangePos == 0;
			if(!writeRange) writeRange = f.length() <= this.m_RangePos;

			//文件块大小不为空
			if (rangeFile.getSize() > 0
				&& writeRange //服务器没有当前块数据	
				)
			{
				this.WriteRangeData(rangeFile);
			}
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}
		
	/*
	 * 保存文件块。
	 * 参数：
	 * 		rangeFile	文件块。
	 * 		md5			文件MD5
	 * 		fileSize	文件总大小
	 * */
	public void SaveFileRange(FileItem rangeFile,String uploadPath,String md5,long fileSize)
	{
		this.m_RangeSize = rangeFile.getSize();
		
		String fname = rangeFile.getName();
		int i = fname.lastIndexOf('.');
		String ext = fname.substring(i+1);
		this.m_pathSvr = uploadPath + md5 + "." + ext;

		this.CreateFile();
		
		try
		{
			File f = new File(this.m_pathSvr);
			
			//文件不存在则创建
			if(!f.exists()) this.CreateFile();

			//文件块大小不为空
			if (rangeFile.getSize() > 0)
			{
				this.WriteRangeData(rangeFile);
			}
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}
}
