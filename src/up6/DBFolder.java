package up6;
import java.sql.*;
import java.util.ArrayList;

import org.apache.commons.lang.StringUtils;

import up6.model.FileInf;
import up6.model.FolderInf;

import com.google.gson.Gson;

import net.sf.json.JSONObject;

/*
 * 原型
*/
public class DBFolder {

	public DBFolder()
	{
	}

	/**
	 * 向数据库添加一条记录，此处操作需要优化成存储过程提高性能。
	 * @param inf
	 * @return
	 */
	static public int Add(FolderInf inf)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("insert into up6_folders(");
		sb.append("fd_name");
		sb.append(",fd_pid");
		sb.append(",fd_uid");
		sb.append(",fd_length");
		sb.append(",fd_size");
		sb.append(",fd_pathLoc");
		sb.append(",fd_pathSvr");
		sb.append(",fd_folders");
		sb.append(",fd_files");
		sb.append(",fd_pidRoot");
		sb.append(",fd_pathRel");

		sb.append(") values(");
		sb.append("?");//sb.append("@fd_name");
		sb.append(",?");//sb.append(",@pid");
		sb.append(",?");//sb.append(",@uid");
		sb.append(",?");//sb.append(",@length");
		sb.append(",?");//sb.append(",@size");
		sb.append(",?");//sb.append(",@pathLoc");
		sb.append(",?");//sb.append(",@pathSvr");
		sb.append(",?");//sb.append(",@folders");
		sb.append(",?");//sb.append(",@files");
		sb.append(",?");//sb.append(",@pidRoot");
		sb.append(",?");//sb.append(",@pathRel");
		sb.append(")");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setString(1, inf.nameLoc);
			cmd.setInt(2, inf.pidSvr);
			cmd.setInt(3, inf.uid);
			cmd.setLong(4, inf.lenLoc);
			cmd.setString(5, inf.size);
			cmd.setString(6, inf.pathLoc);
			cmd.setString(7, inf.pathSvr);
			cmd.setInt(8, inf.folders);
			cmd.setInt(9, inf.filesCount);	//fix(2015-03-16):读取文件列表错误的问题。
			cmd.setInt(10, inf.pidRoot);	//
			cmd.setString(11, inf.pathRel);	//
		} catch (SQLException e) {e.printStackTrace();}

		//获取新插入的ID
		db.ExecuteNonQuery(cmd, false);

		String sql = "select fd_id from up6_folders order by fd_id desc limit 0,1";		
		int f_id = db.ExecuteScalar(sql);
		return f_id;
	}

	/**
	 * 将文件夹上传状态设为已完成
	 * @param fid
	 * @param uid
	 */
	static public void Complete(int fid,int uid)
	{
		String sql = "update up6_folders set fd_complete=1 where fd_id=? and fd_uid=?;";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);
		try 
		{
			cmd.setInt(1, fid);
			cmd.setInt(2, uid);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		db.ExecuteNonQuery(cmd);
	}

	static public void Remove(int id_file,int id_folder,int uid)
	{
		String sql = "{call fd_remove(?,?,?)}";
		DbHelper db = new DbHelper();
		try 
		{
			CallableStatement cmd = db.GetCommandStored(sql);
			cmd.setInt(1, id_file);
			cmd.setInt(2, id_folder);
			cmd.setInt(3, uid);
			cmd.execute();
			cmd.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * 根据文件夹ID获取文件夹信息和未上传完的文件列表，转为JSON格式。
	 * @param fid
	 * @param root [out]
	 * @return
	 */
	static public String GetFilesUnComplete(int fid,FolderInf root)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("select ");
		sb.append(" fd_name");
		sb.append(",fd_length");
		sb.append(",fd_size");
		sb.append(",fd_pid");
		sb.append(",fd_pathLoc");
		sb.append(",fd_pathSvr");
		sb.append(",fd_folders");
		sb.append(",fd_files");
		sb.append(",fd_filesComplete");
		sb.append(" from up6_folders where fd_id=?;");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try {
			cmd.setInt(1, fid);
			ResultSet r = db.ExecuteDataSet(cmd);
			if (r.next())
			{
				root.nameLoc = r.getString(1);
				root.lenLoc = r.getLong(2);
				root.size = r.getString(3);
				root.pidSvr = r.getInt(4);
				root.idSvr = fid;
				root.pathLoc = r.getString(5);
				root.pathSvr = r.getString(6);
				root.folders = r.getInt(7);
				root.files = r.getInt(8);
				root.filesComplete = r.getInt(9);
			}
			r.close();

		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		//单独取已上传长度
		root.lenSvr = DBFolder.GetLenPosted(fid);

		//取文件信息
		ArrayList<FileInf> files = new ArrayList<FileInf>();
		DBFile.GetUnCompletes(fid,files);
		
		JSONObject obj = JSONObject.fromObject(root);//报错
		Gson g = new Gson();
		String js = g.toJson(files);
		//XDebug.Output(js);
		
		obj.element("files", js);//fix(2015-03-18):files.toString()没有自动解析成JSON格式		
		//return obj.toString();
		
		//fix:需要转换为JSON
		
		js = g.toJson( obj );//fix(2015-03-18):obj.toString()没有自动解析成JSON格式
		//XDebug.Output(js);
		return js;
	    //return g.toJson( obj );//bug:arrFiles为空时，此行代码有异常
	}

	/// <summary>
	/// 根据文件夹ID获取文件夹信息和未上传完的文件列表，转为JSON格式。
	/// </summary>
	/// <param name="fid"></param>
	/// <returns></returns>
	static public String GetFilesUnComplete(String fid)
	{
		return GetFilesUnComplete(fid);
	}

	static public FolderInf GetInf(String fid)
	{
		FolderInf inf = new FolderInf();
		GetInf(inf, fid);
		return inf;
	}

	/// <summary>
	/// 根据文件夹ID填充文件夹信息
	/// </summary>
	/// <param name="inf"></param>
	/// <param name="fid"></param>
	static public boolean GetInf(FolderInf inf, String fid)
	{
		boolean ret = false;
		StringBuilder sb = new StringBuilder();
		sb.append("select ");
		sb.append("fd_name");
		sb.append(",fd_length");
		sb.append(",fd_size");
		sb.append(",fd_pid");
		sb.append(",fd_pathLoc");
		sb.append(",fd_pathSvr");
		sb.append(",fd_folders");
		sb.append(",fd_files");
		sb.append(",fd_filesComplete");
		sb.append(" from up6_folders where fd_id=?;");

		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		
		try 
		{
			cmd.setInt(1, Integer.parseInt(fid) );
			ResultSet r = db.ExecuteDataSet(cmd);
			if (r.next())
			{
				inf.nameLoc = r.getString(1);
				inf.lenLoc = r.getLong(2);
				inf.size = r.getString(3);
				inf.pidSvr = r.getInt(4);
				inf.idSvr = Integer.parseInt(fid);
				inf.pathLoc = r.getString(5);
				inf.pathSvr = r.getString(6);
				inf.folders = r.getInt(7);
				inf.files = r.getInt(8);
				inf.filesComplete = r.getInt(9);
				ret = true;
			}
			r.close();
		} catch (NumberFormatException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return ret;
	}

	/// <summary>
	/// 获取文件夹已上传大小
	/// 计算所有文件已上传大小。
	/// </summary>
	/// <param name="fidRoot"></param>
	/// <returns></returns>
	static public long GetLenPosted(int fidRoot)
	{
		String sql = "select sum(f_lenSvr) as lenPosted from (select distinct f_md5,f_lenSvr from up6_files where f_pidRoot=? and LENGTH(f_md5) > 0) a";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);
		try {
			cmd.setInt(1, fidRoot);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		long len = db.ExecuteLong(cmd);

		return len;
	}		
	
	/**
	 * 获取指定文件夹的JSON数据。提供给下载控件使用。
	 * @param fid
	 * @param root
	 * @return
	 */
	public static String GetFolderData(int fid,FolderInf root)
	{
        StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" fd_name");
        sb.append(",fd_length");
        sb.append(",fd_size");
        sb.append(",fd_pid");
        sb.append(",fd_pathLoc");
        sb.append(",fd_pathSvr");
        sb.append(",fd_folders");
        sb.append(",fd_files");
        sb.append(",fd_filesComplete");
        sb.append(" from up6_folders");
        sb.append(" where fd_id=? and fd_complete=1");

        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        try {
			cmd.setInt(1, fid);
			ResultSet r = db.ExecuteDataSet(cmd);
			if (r.next())
			{
	            root.nameLoc = r.getString(1);
	            root.lenLoc = r.getLong(2);
	            root.size = r.getString(3);
	            root.pidSvr = r.getInt(4);
	            root.idSvr = fid;
	            root.pathLoc = r.getString(5);
	            root.pathSvr = r.getString(6);
	            root.folders = r.getInt(7);
	            root.filesCount = r.getInt(8);
	            root.filesComplete = r.getInt(9);
			}
			r.close();
		} catch (SQLException e) {e.printStackTrace();}       

        //单独取已上传长度
        //root.lenPosted = DBFolder.GetLenPosted(fid).ToString();

        //取文件信息
        ArrayList<FileInf> files = new ArrayList<FileInf>();
        ArrayList<String> ids = new ArrayList<String>();
        DBFile.GetCompletes(fid, files,ids);

        Gson g = new Gson();
        String filesJson = g.toJson(files);

        JSONObject obj = JSONObject.fromObject(root);//报错
        obj.element("files",filesJson);
        obj.element("length",root.lenLoc);        
        obj.element("ids",StringUtils.join(ids.toArray(),",") );
        return obj.toString();
	}

    /// <summary>
    /// 子文件上传完毕
    /// </summary>
    /// <param name="fd_idSvr"></param>
	public  static void child_complete(int fd_idSvr)
    {
        String sql = "update up6_folders set fd_filesComplete=fd_filesComplete+1 where fd_id=?";
        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sql);
		try {
			cmd.setInt(1, fd_idSvr);
		} catch (SQLException e) {e.printStackTrace();}        
        db.ExecuteNonQuery(cmd);
    }
}