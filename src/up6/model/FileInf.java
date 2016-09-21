package up6.model;

/*
 * 文件信息
*/
public class FileInf {

	public FileInf()
	{
		try {
			Class.forName("Xproer.FileInf");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/// <summary>
	/// 文件名称。示例：QQ2014.exe
	/// </summary>	
	public String nameLoc = "";
	public String nameSvr = "";
	
	/// <summary>
	/// 文件在客户端中的路径。示例：D:\\Soft\\QQ2013.exe
	/// </summary>	
	public String pathLoc = "";

	/// <summary>
	/// 文件在服务器上面的路径。示例：E:\\Web\\Upload\\QQ2013.exe
	/// </summary>	
	public String pathSvr = "";

	/// <summary>
	/// 客户端父ID(文件夹ID)
	/// </summary>	
	public int pidLoc = 0;

	/// <summary>
	/// 服务端父ID(文件夹在数据库中的ID)
	/// </summary>	
	public int pidSvr = 0;

	/// <summary>
	/// 根级文件夹ID，数据库ID，与xdb_folders.fd_id对应
	/// </summary>	
	public int pidRoot = 0;

	/// <summary>
	/// 本地文件ID。
	/// </summary>	
	public int idLoc = 0;

	/// <summary>
	/// 文件在服务器中的ID。
	/// </summary>	
	public int idSvr = 0;

	/// <summary>
	/// 用户ID
	/// </summary>	
	public int uid = 0;

	/// <summary>
	/// 数字化的长度。以字节为单位，示例：1021021
	/// </summary>	
	public long lenLoc = 0;

	/// <summary>
	/// 格式化的长度。示例：10G
	/// </summary>	
	public String sizeLoc = "0bytes";

	/// <summary>
	/// 文件上传位置。
	/// </summary>	
	public long postPos = 0;

	/// <summary>
	/// 上传百分比
	/// </summary>	
	public String perSvr = "0%";

	/// <summary>
	/// 已上传大小
	/// </summary>	
	public long lenSvr = 0;

	/// <summary>
	/// 文件MD5
	/// </summary>	
	public String md5 = "";
	public boolean complete = false;

	
	/**
	 * 相对路径。提供给下载控件使用。
	 */
	public String pathRel;


	public String getNameLoc() {
		return nameLoc;
	}


	public void setNameLoc(String nameLoc) {
		this.nameLoc = nameLoc;
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


	public int getPidLoc() {
		return pidLoc;
	}


	public void setPidLoc(int pidLoc) {
		this.pidLoc = pidLoc;
	}


	public int getPidSvr() {
		return pidSvr;
	}


	public void setPidSvr(int pidSvr) {
		this.pidSvr = pidSvr;
	}


	public int getPidRoot() {
		return pidRoot;
	}


	public void setPidRoot(int pidRoot) {
		this.pidRoot = pidRoot;
	}


	public int getIdLoc() {
		return idLoc;
	}


	public void setIdLoc(int idLoc) {
		this.idLoc = idLoc;
	}


	public int getIdSvr() {
		return idSvr;
	}


	public void setIdSvr(int idSvr) {
		this.idSvr = idSvr;
	}


	public int getUid() {
		return uid;
	}


	public void setUid(int uid) {
		this.uid = uid;
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


	public long getPostPos() {
		return postPos;
	}


	public void setPostPos(long postPos) {
		this.postPos = postPos;
	}


	public String getPerSvr() {
		return perSvr;
	}


	public void setPerSvr(String perSvr) {
		this.perSvr = perSvr;
	}


	public long getLenSvr() {
		return lenSvr;
	}


	public void setLenSvr(long lenSvr) {
		this.lenSvr = lenSvr;
	}


	public String getMd5() {
		return md5;
	}


	public void setMd5(String md5) {
		this.md5 = md5;
	}
	
	
	public boolean getComplete(){
		return complete;
	}
	
	
	public void setComplete(boolean complete){
		this.complete = complete;
	}


	public String getPathRel() {
		return pathRel;
	}


	public void setPathRel(String pathRel) {
		this.pathRel = pathRel;
	}
	
}