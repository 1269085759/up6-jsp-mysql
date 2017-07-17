package up6.model;

import com.google.gson.annotations.SerializedName;

/*
 * 文件夹信息
*/
public class FolderInf {

	public FolderInf()
	{
		try {
			Class.forName("Xproer.FolderInf");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public String getNameLoc() {
		return nameLoc;
	}

	public void setNameLoc(String name) {
		this.nameLoc = name;
	}

	public long getLenLoc() {
		return lenLoc;
	}

	public void setLenLoc(long lenLoc) {
		this.lenLoc = lenLoc;
	}

	public long getLenSvr() {
		return lenSvr;
	}

	public void setLenSvr(long lenSvr) {
		this.lenSvr = lenSvr;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
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

	public int getFolders() {
		return folders;
	}

	public void setFolders(int folders) {
		this.folders = folders;
	}

	public int getFiles() {
		return files;
	}

	public void setFiles(int files) {
		this.files = files;
	}

	public int getFilesCount() {
		return filesCount;
	}

	public void setFilesCount(int filesCount) {
		this.filesCount = filesCount;
	}

	public int getFilesComplete() {
		return filesComplete;
	}

	public void setFilesComplete(int filesComplete) {
		this.filesComplete = filesComplete;
	}

	public int getUid() {
		return uid;
	}

	public void setUid(int uid) {
		this.uid = uid;
	}

	public String getPathSvr() {
		return pathSvr;
	}

	public void setPathSvr(String pathSvr) {
		this.pathSvr = pathSvr;
	}

	public String getPathLoc() {
		return pathLoc;
	}

	public void setPathLoc(String pathLoc) {
		this.pathLoc = pathLoc;
	}

	public String getPathRel() {
		return pathRel;
	}

	public void setPathRel(String pathRel) {
		this.pathRel = pathRel;
	}

	public int getPidRoot() {
		return pidRoot;
	}

	public void setPidRoot(int pidRoot) {
		this.pidRoot = pidRoot;
	}

	public int getFoldersCount() {
		return foldersCount;
	}

	public void setFoldersCount(int foldersCount) {
		this.foldersCount = foldersCount;
	}

	public int getIdFile() {
		return idFile;
	}

	public void setIdFile(int idFile) {
		this.idFile = idFile;
	}

	public String getPerSvr() {
		return perSvr;
	}

	public void setPerSvr(String perSvr) {
		this.perSvr = perSvr;
	}

	public String nameLoc = "";
	
	/// <summary>
	/// 数字化的长度，以字节为单位。示例：10252412
	/// </summary>
	
	public long lenLoc = 0;

	/// <summary>
	/// 已上传大小
	/// </summary>
	
	public long lenSvr = 0;
	
	/// <summary>
	/// 格式化的长度，示例：10GB
	/// </summary>
	
	public String size = "";
	
	/// <summary>
	/// 客户端父ID，提供给JS使用。
	/// </summary>
	
	public int pidLoc = 0;
	
	/// <summary>
	/// 服务端父ID，与数据库对应。
	/// </summary>
	
	public int pidSvr = 0;
	
	/// <summary>
	/// 客户端文件夹ID，提供给JS使用。
	/// </summary>
	
	public int idLoc = 0;
	
	/// <summary>
	/// 服务端文件夹ID,与数据库对应
	/// </summary>
	
	public int idSvr = 0;
	
	/// <summary>
	/// 子文件夹总数
	/// </summary>
	@SerializedName("foldersCount")
	public int folders = 0;
	
	/// <summary>
	/// 子文件数
	/// </summary>	
	public int files = 0;
	
	//fix(2015-03-18):单独读取文件总数，供JS使用
	public int filesCount=0;

	/// <summary>
	/// 已上传完的文件数
	/// </summary>
	
	public int filesComplete = 0;

	/// <summary>
	/// 用户ID
	/// </summary>
	
	public int uid = 0;
		
	/**
	 * 文件夹在服务端路径。E:\\Web
	 */
	public String pathSvr = "";
	
	/// <summary>
	/// 文件夹在客户端的路径。D:\\Soft\\Image
	/// </summary>
	
	public String pathLoc = "";
	
	//根级路径
	public int pidRoot=0;//
	/**
	 * 相对路径。基于根节点。root\\child\\self
	 */
	public String pathRel="";
	
	public int foldersCount=0;

	public int idFile=0;

	public String perSvr = "0%";
}