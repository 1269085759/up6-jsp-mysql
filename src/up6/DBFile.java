package up6;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import up6.model.FileInf;
import com.google.gson.Gson;

/*
 * 原型
*/
public class DBFile {

	public DBFile()
	{
	}
	
	/**
	 * 获取指定文件夹下面的所有文件，
	 * @param fid
	 * @param files
	 * @param ids
	 */
	public static void GetCompletes(int f_id,ArrayList<FileInf> files,ArrayList<String> ids)
	{
        StringBuilder sql = new StringBuilder("select ");
        sql.append(" f_id");
        sql.append(",f_nameLoc");
        sql.append(",f_pathLoc");
        sql.append(",f_lenLoc");
        sql.append(",f_sizeLoc");
        sql.append(",f_md5");
        sql.append(",f_pidRoot");
        sql.append(",f_pid");
        sql.append(",f_lenSvr");
        sql.append(",f_pathSvr");//fix:服务器会重复创建文件项的问题
        sql.append(",fd_pathRel");//
        sql.append(" from up6_files");
        sql.append(" left join up6_folders");
        sql.append(" on fd_id = f_pid");
        sql.append(" where f_pidRoot=? and f_complete=1");

        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sql.toString());
        try
        {
        	cmd.setInt(1, f_id);
        	ResultSet r = db.ExecuteDataSet(cmd);
            while (r.next())
            {	
                FileInf fi 		= new FileInf();
                fi.id 			= r.getString(1);
                fi.nameLoc 		= r.getString(2);
                fi.pathLoc 		= r.getString(3);
                fi.lenLoc 		= r.getLong(4);
                fi.sizeLoc 		= r.getString(5);
                fi.md5 			= r.getString(6);
                fi.pidRoot 		= r.getString(7);
                fi.pid 			= r.getString(8);
                fi.lenSvr 		= r.getLong(9);
                fi.pathSvr 		= r.getString(10);//fix:服务器会重复创建文件项的问题
                fi.pathRel 		= r.getString(11) + "\\";//相对路径：root\\child\\folder\\
                files.add(fi);
                //添加到列表
                ids.add( fi.id );
            }
            r.close();            
            cmd.close();
        }
        catch (SQLException e) {e.printStackTrace();}
        
	}
	
	/**
	 * 获取所有已经上传完的文件和文件夹供下载列表使用。
	 * @param f_uid
	 * @return
	 */
	public static String GetAllComplete(int f_uid)
	{
        StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");
        sb.append(",f_fdTask");        
        sb.append(",f_nameLoc");
        sb.append(",f_pathLoc");
        sb.append(",f_lenLoc");
        sb.append(",f_sizeLoc");
        sb.append(",f_perSvr");
        //sb.append(",fd_size");
        sb.append(" from up6_files");
        //sb.append(" left join up6_folders");
        //sb.append(" on f_fdID = fd_id");
        sb.append(" where f_deleted=0 and f_fdChild=0 and f_complete=1");

        ArrayList<FileInf> files = new ArrayList<FileInf>();
        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        try
        {
        	ResultSet r = db.ExecuteDataSet(cmd);
            while (r.next())
            {
                FileInf f = new FileInf();
                f.id 		= r.getString(1);
                f.fdTask 	= r.getBoolean(2);                
                f.nameLoc 	= r.getString(3);
                f.pathLoc 	= r.getString(4);
                f.lenLoc 	= r.getLong(5);
                f.sizeLoc 	= r.getString(6);
                f.perSvr 	= r.getString(7);//已下载百分比

                files.add(f);

            }
            r.close();
        }
        catch (SQLException e) {e.printStackTrace();}
        
        Gson g = new Gson();
	    return g.toJson( files );//bug:arrFiles为空时，此行代码有异常
	}
	
	static public String GetAllUnComplete(int f_uid)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("select ");
		sb.append(" f_id");
		sb.append(",f_fdTask");		
		sb.append(",f_nameLoc");
		sb.append(",f_pathLoc");
		sb.append(",f_md5");
		sb.append(",f_lenLoc");
		sb.append(",f_sizeLoc");
		sb.append(",f_pos");
		sb.append(",f_lenSvr");
		sb.append(",f_perSvr");
		sb.append(",f_complete");
		sb.append(",f_pathSvr");//fix(2015-03-16):修复无法续传文件的问题。
		sb.append(" from up6_files ");//change(2015-03-18):联合查询文件夹数据
		sb.append(" where f_uid=? and f_deleted=0 and f_fdChild=0 and f_complete=0;");//fix(2015-03-18):只加载未完成列表

		ArrayList<FileInf> files = new ArrayList<FileInf>();
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setInt(1, f_uid);
			ResultSet r = db.ExecuteDataSet(cmd);
			while(r.next())
			{
				FileInf f 		= new FileInf();
				f.uid			= f_uid;
				f.id 			= r.getString(1);
				f.fdTask 		= r.getBoolean(2);				
				f.nameLoc 		= r.getString(3);
				f.pathLoc 		= r.getString(4);
				f.md5 			= r.getString(5);
				f.lenLoc 		= r.getLong(6);
				f.sizeLoc 		= r.getString(7);
				f.offset 		= r.getLong(8);
				f.lenSvr 		= r.getLong(9);
				f.perSvr 		= r.getString(10);
				f.complete 		= r.getBoolean(11);
				f.pathSvr		= r.getString(12);//fix(2015-03-19):修复无法续传文件的问题。
				files.add(f);
				
			}
			r.close();
			cmd.close();
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		if(files.size() < 1) return null;
		
		Gson g = new Gson();
	    return g.toJson( files);//bug:arrFiles为空时，此行代码有异常	
	}
    
	/**
	 * 获取所有文件和文件夹列表，不包含子文件夹，包含已上传完的和未上传完的
	 * @param f_uid
	 * @return
	 */
	static public String GetAll(int f_uid)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("select ");
		sb.append(" f_id");
		sb.append(",f_fdTask");		
		sb.append(",f_nameLoc");
		sb.append(",f_pathLoc");
		sb.append(",f_md5");
		sb.append(",f_lenLoc");
		sb.append(",f_sizeLoc");
		sb.append(",f_pos");
		sb.append(",f_lenSvr");
		sb.append(",f_perSvr");
		sb.append(",f_complete");
		sb.append(",f_pathSvr");//fix(2015-03-16):修复无法续传文件的问题。
		sb.append(" from up6_files ");//change(2015-03-18):联合查询文件夹数据
		sb.append(" where f_uid=? and f_deleted=0 and f_fdChild=0;");//fix(2015-03-18):只加载未完成列表

		ArrayList<FileInf> files = new ArrayList<FileInf>();
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setInt(1, f_uid);
			ResultSet r = db.ExecuteDataSet(cmd);
			while(r.next())
			{
				FileInf f 	= new FileInf();
				f.uid			= f_uid;
				f.id			= r.getString(1);
				f.fdTask 		= r.getBoolean(2);				
				f.nameLoc 		= r.getString(4);
				f.pathLoc 		= r.getString(5);
				f.md5 			= r.getString(6);
				f.lenLoc 		= r.getLong(7);
				f.sizeLoc 		= r.getString(8);
				f.offset 		= r.getLong(9);
				f.lenSvr 		= r.getLong(10);
				f.perSvr 		= r.getString(11);
				f.complete 		= r.getBoolean(12);
				f.pathSvr		= r.getString(13);//fix(2015-03-19):修复无法续传文件的问题。

				files.add(f);
				
			}
			r.close();
			cmd.close();
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		Gson g = new Gson();
	    return g.toJson( files );//bug:arrFiles为空时，此行代码有异常		
	}

	/**
	 * 根据文件ID获取文件信息
	 * @param f_id
	 * @param inf
	 * @return
	 */
	public boolean GetFileInfByFid(String f_id,FileInf inf)
	{
		boolean ret = false;
		StringBuilder sb = new StringBuilder();
		sb.append("select ");
		sb.append(" f_uid");
		sb.append(",f_nameLoc");
		sb.append(",f_nameSvr");
		sb.append(",f_pathLoc");
		sb.append(",f_pathSvr");
		sb.append(",f_pathRel");
		sb.append(",f_md5");
		sb.append(",f_lenLoc");
		sb.append(",f_sizeLoc");
		sb.append(",f_pos");
		sb.append(",f_lenSvr");
		sb.append(",f_perSvr");
		sb.append(",f_complete");
		sb.append(",f_time");
		sb.append(",f_deleted");
		sb.append(" from up6_files where f_id=? limit 0,1");
		
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setString(1, f_id);
			ResultSet r = db.ExecuteDataSet(cmd);

			if (r.next())
			{
				inf.id			= f_id;
				inf.uid 		= r.getInt(1);
				inf.nameLoc 	= r.getString(2);
				inf.nameSvr 	= r.getString(3);
				inf.pathLoc 	= r.getString(4);
				inf.pathSvr 	= r.getString(5);
				inf.pathRel 	= r.getString(6);
				inf.md5 		= r.getString(7);
				inf.lenLoc 		= r.getLong(8);
				inf.sizeLoc 	= r.getString(9);
	            inf.offset	 	= r.getLong(10);
	            inf.lenSvr 		= r.getLong(11);
				inf.perSvr 		= r.getString(12);
				inf.complete 	= r.getBoolean(13);
				inf.PostedTime 	= r.getDate(14);
				inf.deleted		= r.getBoolean(15);
				ret = true;
			}
			cmd.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return ret;
	}

	/// <summary>
	/// 根据文件MD5获取文件信息
	/// </summary>
	/// <param name="md5"></param>
	/// <param name="inf"></param>
	/// <returns></returns>
	public boolean exist_file(String md5,/*out*/FileInf fileSvr)
	{
		boolean ret = false;
		StringBuilder sb = new StringBuilder();
		sb.append("select");
		sb.append(" f_id");
		sb.append(",f_uid");
		sb.append(",f_nameLoc");
		sb.append(",f_nameSvr");
		sb.append(",f_pathLoc");
		sb.append(",f_pathSvr");
		sb.append(",f_pathRel");
		sb.append(",f_md5");
		sb.append(",f_lenLoc");
		sb.append(",f_sizeLoc");
		sb.append(",f_pos");
		sb.append(",f_lenSvr");
		sb.append(",f_perSvr");
		sb.append(",f_complete");
		sb.append(",f_time");
		sb.append(",f_deleted");
		sb.append(" from up6_files where f_md5=? order by f_lenSvr DESC limit 0,1");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setString(1, md5);
			ResultSet r = db.ExecuteDataSet(cmd);
			if (r.next())
			{
				fileSvr.id 			= r.getString(1);
				fileSvr.uid 		= r.getInt(2);
				fileSvr.nameLoc 	= r.getString(3);
				fileSvr.nameSvr 	= r.getString(4);
				fileSvr.pathLoc 	= r.getString(5);
				fileSvr.pathSvr 	= r.getString(6);
				fileSvr.pathRel 	= r.getString(7);
				fileSvr.md5 		= r.getString(8);
				fileSvr.lenLoc 		= r.getLong(9);
				fileSvr.sizeLoc 	= r.getString(10);
				fileSvr.offset 		= r.getLong(11);
				fileSvr.lenSvr 		= r.getLong(12);
				fileSvr.perSvr 		= r.getString(13);
				fileSvr.complete 	= r.getBoolean(14);
				fileSvr.PostedTime 	= r.getDate(15);
				fileSvr.deleted 	= r.getBoolean(16);
				ret = true;
			}
			cmd.close();			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return ret;
	}

	/**
	 * 增加一条数据，在f_create中调用。
	 * 文件名称，本地路径，远程路径，相对路径都使用原始字符串。
	 * d:\soft\QQ2012.exe
	 * @param model
	 * @return
	 */
	public void Add(FileInf model)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("insert into up6_files(");
		sb.append(" f_id");//1
		sb.append(",f_pid");//2
		sb.append(",f_pidRoot");//3
		sb.append(",f_fdTask");//4
		sb.append(",f_fdChild");//5
		sb.append(",f_uid");//6
		sb.append(",f_pos");//7
		sb.append(",f_md5");//8
		sb.append(",f_lenLoc");//9
		sb.append(",f_lenSvr");//10
		sb.append(",f_perSvr");//11
		sb.append(",f_sizeLoc");//12
		sb.append(",f_nameLoc");//13
		sb.append(",f_nameSvr");//14
		sb.append(",f_pathLoc");//15
		sb.append(",f_pathSvr");//16
		sb.append(",f_pathRel");//17
		sb.append(",f_complete");//18
		
		sb.append(") values(");
		
		sb.append(" ?");//id
		sb.append(",?");//pid
		sb.append(",?");//pidRoot
		sb.append(",?");//fdTask
		sb.append(",?");//fdChild
		sb.append(",?");//uid
		sb.append(",?");//pos
		sb.append(",?");//md5
		sb.append(",?");//lenLoc
		sb.append(",?");//lenSvr
		sb.append(",?");//perSvr
		sb.append(",?");//sizeLoc
		sb.append(",?");//nameLoc
		sb.append(",?");//nameSvr
		sb.append(",?");//pathLoc
		sb.append(",?");//pathSvr
		sb.append(",?");//pathRel
		sb.append(",?");//complete
		sb.append(");");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setString(1, model.id);
			cmd.setString(2, model.pid);
			cmd.setString(3, model.pidRoot);
			cmd.setBoolean(4, model.fdTask);
			cmd.setBoolean(5, model.fdChild);
			cmd.setInt(6, model.uid);
			cmd.setLong(7, model.offset);
			cmd.setString(8, model.md5);
			cmd.setLong(9, model.lenLoc);
			cmd.setLong(10, model.lenSvr);
			cmd.setString(11, model.perSvr);
			cmd.setString(12, model.sizeLoc);
			cmd.setString(13, model.nameLoc);
			cmd.setString(14, model.nameSvr);			
			cmd.setString(15, model.pathLoc);
			cmd.setString(16, model.pathSvr);
			cmd.setString(17, model.pathRel);
			cmd.setBoolean(18, model.complete);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		db.ExecuteNonQuery(cmd);
	}
	
	/**
	 * 清空文件表，文件夹表数据。
	 */
	static public void Clear()
	{
		DbHelper db = new DbHelper();
		db.ExecuteNonQuery("delete from up6_files;");
		db.ExecuteNonQuery("delete from up6_folders;");
	}

	/**
	 * @param f_uid
	 * @param f_id
	 */
	static public void Complete(int f_uid, int f_id)
	{
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand("update up6_files set f_perSvr='100%' ,f_complete=1 where f_uid=? and f_fdID=?;");
		try {
			cmd.setInt(1, f_uid);
			cmd.setInt(2, f_id);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		db.ExecuteNonQuery(cmd);
	}
	
	/**
	 * @param f_uid
	 * @param f_id
	 */
	static public void fd_complete(String f_id, String uid)
	{
		DbHelper db = new DbHelper();
		Connection con = db.GetCon();
		
		try {
			con.setAutoCommit(false);
			Statement stmt = con.createStatement();
			stmt.addBatch("update up6_files set f_perSvr='100%' ,f_lenSvr=f_lenLoc,f_complete=1 where f_id='" + f_id+"'");
			stmt.addBatch("update up6_files set f_perSvr='100%' ,f_lenSvr=f_lenLoc,f_complete=1 where f_pidRoot='" + f_id+"'");
			stmt.addBatch("update up6_folders set fd_complete=1 where fd_id='" + f_id + "' and fd_uid=" + uid);
			stmt.executeBatch();
			con.commit();
			stmt.close();
			con.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}

	/// <summary>
	/// 更新上传进度
	/// </summary>
	///<param name="f_uid">用户ID</param>
	///<param name="f_id">文件ID</param>
	///<param name="f_pos">文件位置，大小可能超过2G，所以需要使用long保存</param>
	///<param name="f_lenSvr">已上传长度，文件大小可能超过2G，所以需要使用long保存</param>
	///<param name="f_perSvr">已上传百分比</param>
	public boolean f_process(int uid,String f_id,long offset,long f_lenSvr,String f_perSvr)
	{
		String sql = "update up6_files set f_pos=?,f_lenSvr=?,f_perSvr=? where f_uid=? and f_id=?";
		
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);
		
		try 
		{
			cmd.setLong(1, offset);
			cmd.setLong(2, f_lenSvr);
			cmd.setString(3, f_perSvr);
			cmd.setInt(4, uid);
			cmd.setString(5, f_id);
			db.ExecuteNonQuery(cmd);
		} catch (SQLException e) {e.printStackTrace();}

		return true;
	}

	/// <summary>
	/// 上传完成。将所有相同MD5文件进度都设为100%
	/// </summary>
	public void UploadComplete(String md5)
	{
		String sql = "update up6_files set f_lenSvr=f_lenLoc,f_perSvr='100%',f_complete=1 where f_md5=?";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);
		
		try 
		{
			cmd.setString(1, md5);
			db.ExecuteNonQuery(cmd);//在部分环境中测试发现执行后没有效果。
		} catch (SQLException e) {e.printStackTrace();}
	}

	/// <summary>
	/// 检查相同MD5文件是否有已经上传完的文件
	/// </summary>
	/// <param name="md5"></param>
	public boolean HasCompleteFile(String md5)
	{
		//为空
		if (md5 == null) return false;
		if(md5.isEmpty()) return false;

		String sql = "select f_id from up6_files where f_complete=1 and f_md5=?";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try {
			cmd.setString(1, md5);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		boolean ret = db.Execute(cmd);

		return ret;
	}

	/// <summary>
	/// 删除一条数据，并不真正删除，只更新删除标识。
	/// </summary>
	/// <param name="f_uid"></param>
	/// <param name="f_id"></param>
	public void Delete(int f_uid,String f_id)
	{
		String sql = "update up6_files set f_deleted=1 where f_uid=? and f_id=?";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try {
			cmd.setInt(1, f_uid);
			cmd.setString(2, f_id);
			db.ExecuteNonQuery(cmd);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

    /// <summary>
    /// 获取未上传完的文件列表
    /// </summary>
    /// <param name="fidRoot"></param>
    /// <param name="files"></param>
	static public void GetUnCompletes(int fidRoot,ArrayList<FileInf> files)
	{
		StringBuilder sql = new StringBuilder("select ");
        sql.append(" f_id");
        sql.append(",f_nameLoc");
		sql.append(",f_pathLoc");
		sql.append(",f_lenLoc");
		sql.append(",f_sizeLoc");
		sql.append(",f_md5");
		sql.append(",f_pidRoot");
        sql.append(",f_pid");
        sql.append(",f_lenSvr");
        sql.append(",f_pathSvr");//fix(2015-03-18):续传文件时服务器会创建重复文件项信息
		sql.append(" from up6_files where f_pidRoot=? and f_complete=False;");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql.toString());
		try 
		{
			cmd.setInt(1, fidRoot);
			ResultSet r = db.ExecuteDataSet(cmd);
			while (r.next())
			{
				FileInf fi = new FileInf();
	            fi.id		= r.getString(1);
				fi.nameLoc = r.getString(2);
				fi.pathLoc = r.getString(3);
				fi.lenLoc = r.getLong(4);
				fi.sizeLoc = r.getString(5);
				fi.md5 		= db.GetStringSafe(r.getString(6),"");
				fi.pidRoot 	= r.getString(7);
				fi.pid		= r.getString(8);
	            fi.lenSvr = r.getLong(9);
	            fi.pathSvr = r.getString(10);//fix(2015-03-18):修复续传文件时服务器会创建重复文件信息的问题。
				files.add(fi);
			}
			r.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}	
}