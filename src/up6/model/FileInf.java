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
public class FileInf {

	public FileInf()
	{		
	}

	public String id="";
	public String pid="";
    public String pidRoot="";	
	/**	 * 表示当前项是否是一个文件夹项。	 */
	public boolean fdTask=false;		
	//	/// 是否是文件夹中的子文件	/// </summary>
	public boolean fdChild=false;
	/**	 * 用户ID。与第三方系统整合使用。	 */
	public int uid=0;
	/**	 * 文件在本地电脑中的名称	 */
	public String nameLoc="";
	/**	 * 文件在服务器中的名称。	 */
	public String nameSvr="";
	/**	 * 文件在本地电脑中的完整路径。示例：D:\Soft\QQ2012.exe	 */
	public String pathLoc="";	
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
	public long offset=0;
	/**	 * 已上传大小。以字节为单位	 */
	public long lenSvr=0;
	/**	 * 已上传百分比。示例：10%	 */
	public String perSvr="0%";
	public boolean complete=false;
	public Date PostedTime = new Date();
	public boolean deleted=false;
	/**	 * 是否已经扫描完毕，提供给大型文件夹使用，大型文件夹上传完毕后开始扫描。	 */
	public boolean scaned=false;
}