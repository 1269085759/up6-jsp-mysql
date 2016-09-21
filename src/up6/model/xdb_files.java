package up6.model;
import java.util.Date;

/*
 * 原型
 * 更新记录：
 * 	2016-01-07
 * 		FileMD5更名为md5
 * 		PostComplete更名为complete
 * 		FileLength更名为lenLoc
 * 		FileSize更名为sizeLoc
 * 		PostedPercent更名为perSvr
*/
public class xdb_files {

	public xdb_files()
	{
		this.complete = false;
	}

	//数据表唯一ID
	public int idSvr=0;
	//文件夹ID
	public int pid=0;
    public int getIdSvr() {
		return idSvr;
	}
	public void setIdSvr(int idSvr) {
		this.idSvr = idSvr;
	}

	public int getPid() {
		return pid;
	}
	public void setPid(int pid) {
		this.pid = pid;
	}
	public int getPidRoot() {
		return pidRoot;
	}
	public void setPidRoot(int pidRoot) {
		this.pidRoot = pidRoot;
	}
	public boolean isF_fdTask() {
		return f_fdTask;
	}
	public void setF_fdTask(boolean fFdTask) {
		f_fdTask = fFdTask;
	}
	public int getF_fdID() {
		return f_fdID;
	}
	public void setF_fdID(int fFdID) {
		f_fdID = fFdID;
	}
	public boolean isF_fdChild() {
		return f_fdChild;
	}
	public void setF_fdChild(boolean fFdChild) {
		f_fdChild = fFdChild;
	}
	public int getUid() {
		return uid;
	}
	public void setUid(int uid) {
		this.uid = uid;
	}
	public String getNameLoc() {
		return nameLoc;
	}
	public void setNameLoc(String nameLoc) {
		this.nameLoc = nameLoc;
	}
	public String getNameSvr() {
		return nameSvr;
	}
	public void setNameSvr(String nameSvr) {
		this.nameSvr = nameSvr;
	}
	public String getPathLoc() {
		return pathLoc;
	}
	public void setPathLoc(String pathLoc) {
		this.pathLoc = pathLoc;
	}
	public String getPathSvr() {
		return pathSvr;
	}
	public void setPathSvr(String pathSvr) {
		this.pathSvr = pathSvr;
	}
	public String getPathRel() {
		return pathRel;
	}
	public void setPathRel(String pathRel) {
		this.pathRel = pathRel;
	}
	public String getMd5() {
		return md5;
	}
	public void setMd5(String md5) {
		this.md5 = md5;
	}
	public long getLenLoc() {
		return lenLoc;
	}
	public void setLenLoc(long lenLoc) {
		this.lenLoc = lenLoc;
	}
	public String getSizeLoc() {
		return sizeLoc;
	}
	public void setSizeLoc(String sizeLoc) {
		this.sizeLoc = sizeLoc;
	}
	public long getFilePos() {
		return FilePos;
	}
	public void setFilePos(long filePos) {
		FilePos = filePos;
	}
	public long getLenSvr() {
		return lenSvr;
	}
	public void setLenSvr(long lenSvr) {
		this.lenSvr = lenSvr;
	}
	public String getPerSvr() {	return perSvr;}
	public void setPerSvr(String perSvr) {this.perSvr = perSvr;}
	public boolean isComplete() {return complete;}
	public void setComplete(boolean complete) {	this.complete = complete;}
	public Date getPostedTime() {return PostedTime;}
	public void setPostedTime(Date postedTime) {PostedTime = postedTime;}
	public boolean isDeleted() {return deleted;}
	public void setDeleted(boolean deleted) {this.deleted = deleted;}
	public String getFd_json() {return fd_json;	}
	public void setFd_json(String fdJson) {fd_json = fdJson;}
	public int getFilesCount() {return filesCount;}
	public void setFilesCount(int filesCount) {this.filesCount = filesCount;}
	public int getFilesComplete() {return filesComplete;}
	public void setFilesComplete(int filesComplete) {this.filesComplete = filesComplete;	}

	//根级文件夹ID
    public int pidRoot=0;	
	/**	 * 表示当前项是否是一个文件夹项。	 */
	public boolean f_fdTask=false;
	/**	 * 与xdb_folders.fd_id对应	 */
	public int f_fdID=0;
	//	/// 是否是文件夹中的子文件	/// </summary>
	public boolean f_fdChild=false;
	/**	 * 用户ID。与第三方系统整合使用。	 */
	public int uid=0;
	/**	 * 文件在本地电脑中的名称	 */
	public String nameLoc="";
	/**	 * 文件在服务器中的名称。	 */
	public String nameSvr="";
	/**	 * 文件在本地电脑中的完整路径。示例：D:\Soft\QQ2012.exe	 */
	public String pathLoc="";
	public String getpathLoc(){return this.pathLoc;}
	/**	 * 文件在服务器中的完整路径。示例：F:\\ftp\\uer\\md5.exe	 */
	public String pathSvr="";
	/**	 * 文件在服务器中的相对路径。示例：/www/web/upload/md5.exe	 */
	public String pathRel="";
	/**	 * 文件MD5	 */
	public String md5="";
	/**	 * 数字化的文件长度。以字节为单位，示例：120125	 */
	public long lenLoc=0;
	/**	 * 格式化的文件尺寸。示例：10.03MB	 */
	public String sizeLoc="";
	/**	 * 文件续传位置。	 */
	public long FilePos=0;
	/**	 * 已上传大小。以字节为单位	 */
	public long lenSvr=0;
	/**	 * 已上传百分比。示例：10%	 */
	public String perSvr="";
	public boolean complete=false;
	public Date PostedTime = new Date();
	public boolean deleted=false;
	/**	 * 文件夹JSON信息	 */
	public String fd_json="";	
	public int filesCount=0;//add(2015-03-18):供JS调用
	public int filesComplete=0;
}