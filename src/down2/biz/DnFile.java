package down2.biz;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import up6.DbHelper;
import com.google.gson.Gson;
import down2.model.DnFileInf;
import down2.model.DnFolderInf;

public class DnFile 
{
	public DnFile()
	{
	}
	
	/**
	 * 获取文件信息
	 * @param fid
	 * @return
	 */
	public down2.model.DnFileInf Find(int fid)
	{		
		String sql = "select * from down_files where f_id=?";
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);
		try
		{
			down2.model.DnFileInf inf 	= new DnFileInf();
			cmd.setInt(1, fid);
			ResultSet r = db.ExecuteDataSet(cmd);
			if(r.next())
			{
				inf.idSvr 		= fid;
				inf.lenLoc 	= r.getLong(6);
				inf.lenSvr 	= r.getLong(7);
				inf.mac 		= r.getString(3);
				inf.pathLoc 	= r.getString(4);
				inf.fileUrl 	= r.getString(5);
				
				cmd.close();
				cmd.getConnection().close();
			}
			
			return inf;
		}
		catch(SQLException e){e.printStackTrace();}
		return null;
	}

    public int Add(down2.model.DnFileInf inf)
    {
    	int idSvr = 0;
        StringBuilder sb = new StringBuilder();
        sb.append("insert into down_files(");        
        sb.append(" f_uid");
        sb.append(",f_nameLoc");
        sb.append(",f_pathLoc");
        sb.append(",f_fileUrl");
        sb.append(",f_lenSvr");
        sb.append(",f_sizeSvr");
        sb.append(") values(");        
        sb.append(" ?");//uid
        sb.append(",?");//name
        sb.append(",?");//pathLoc
        sb.append(",?");//pathSvr
        sb.append(",?");//lenSvr
        sb.append(",?");//sizeSvr
        sb.append(")");
		
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommandPK(sb.toString());

		try
		{
			cmd.setInt(1,inf.uid);
			cmd.setString(2,inf.nameLoc);
			cmd.setString(3,inf.pathLoc);
			cmd.setString(4,inf.fileUrl);
			cmd.setLong(5,inf.lenSvr);
			cmd.setString(6,inf.sizeSvr);
			idSvr = (int) db.ExecuteGenKey(cmd);			
		}
		catch (SQLException e){e.printStackTrace();}		

		return idSvr;
    }
    
    /**
     * 添加一个文件夹下载任务
     * @param inf
     * @return
     */
    public static int Add(DnFolderInf inf)
    {
    	int idSvr = 0;
        StringBuilder sb = new StringBuilder();
        sb.append("insert into down_files(");        
        sb.append(" f_uid");
        sb.append(",f_mac");
        sb.append(",f_pathLoc");
        sb.append(",f_fdID");
        sb.append(") values(");        
        sb.append(" ?");//uid
        sb.append(",?");//mac
        sb.append(",?");//pathLoc
        sb.append(",?");//fdID
        sb.append(")");
		
		DbHelper db = new DbHelper();
		//PreparedStatement cmd = db.GetCommand(sb.toString(),"f_id");
		PreparedStatement cmd = db.GetCommandPK(sb.toString());

		try
		{
			cmd.setInt(1,inf.uid);
			cmd.setString(2,inf.mac);
			cmd.setString(3,inf.pathLoc);
			cmd.setInt(4,inf.fdID);
			idSvr = (int)db.ExecuteGenKey(cmd);
		}
		catch (SQLException e){e.printStackTrace();}
		return idSvr;    	
    }

    /**
     * 将文件设为已完成
     * @param fid
     */
    public void Complete(int fid)
    {
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand("update down_files set f_complete=1 where f_id=?");
		try
		{
			cmd.setInt(1,fid);
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
		db.ExecuteNonQuery(cmd);
    }

    /// <summary>
    /// 删除文件
    /// </summary>
    /// <param name="fid"></param>
    public void Delete(int fid,int uid,String mac)
    {
        String sql = "delete from down_files where f_id=? and f_uid=? and f_mac=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setInt(1,fid);
			cmd.setInt(2,uid);
			cmd.setString(3,mac);
			db.ExecuteNonQuery(cmd);
		}
		catch (SQLException e){e.printStackTrace();}
    }
    
    public static void Delete(String fid,String uid)
    {
        String sql = "delete from down_files where f_id=? and f_uid=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setInt(1,Integer.parseInt(fid) );
			cmd.setInt(2,Integer.parseInt(uid) );
			db.ExecuteNonQuery(cmd);
		}
		catch (SQLException e){e.printStackTrace();}
    }
    
    //删除文件夹的所有子文件
    public static void delFiles(String pidRoot,String uid)
    {
        String sql = "delete from down_files where f_pidRoot=? and f_uid=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setInt(1,Integer.parseInt(pidRoot) );
			cmd.setInt(2,Integer.parseInt(uid) );
			db.ExecuteNonQuery(cmd);
		}
		catch (SQLException e){e.printStackTrace();}    	
    }

    /**
     * 更新文件进度信息
     * @param fid
     * @param uid
     * @param mac
     * @param lenLoc
     */
    public void updateProcess(int fid,int uid,String lenLoc,String perLoc)
    {
        String sql = "update down_files set f_lenLoc=?,f_perLoc=? where f_id=? and f_uid=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setString(1,lenLoc);
			cmd.setString(2,perLoc);
			cmd.setInt(3,fid);
			cmd.setInt(4,uid);
			
			db.ExecuteNonQuery(cmd);
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
    }

    /// <summary>
    /// 获取所有未下载完的文件列表
    /// </summary>
    /// <returns></returns>
    public static String GetAll(int uid)
    {
    	StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");
        sb.append(",f_pathLoc");
        sb.append(",f_fileUrl");
        sb.append(",f_lenLoc");
        sb.append(",f_perLoc");
        sb.append(",f_lenSvr");
        sb.append(",f_sizeSvr");
        sb.append(",f_nameLoc");
        sb.append(",fd_name");
        sb.append(",fd_id");
        sb.append(",fd_pathLoc");
        sb.append(",fd_id_old");
        sb.append(",fd_percent");
        sb.append(" from down_files");
        sb.append(" left join down_folders");
        sb.append(" on down_folders.fd_id = down_files.f_fdID");
        sb.append(" where f_uid=? and f_complete=0");

        ArrayList<DnFileInf> files = new ArrayList<DnFileInf>();
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try
		{
			cmd.setInt(1,uid);
			ResultSet r = db.ExecuteDataSet(cmd);
			while (r.next())
			{
				DnFileInf f		= new DnFileInf();
				f.idSvr			= r.getInt(1);
			    f.pathLoc		= r.getString(2);
				f.fileUrl		= r.getString(3);
			    f.lenLoc		= r.getLong(4);
			    f.perLoc		= r.getString(5);
			    f.lenSvr		= r.getLong(6);
			    f.sizeSvr		= r.getString(7);
			    f.nameLoc		= r.getString(8);
			    f.complete		= true;
			    f.fdID		= r.getInt(10);
			    if(0 != f.fdID)
			    {
			    	//f.m_nameLoc = r.getString(7);
			    	//f.m_fdTask = true;
			    	//f.m_perLoc = r.getString(11);
			    	//f.m_pathLoc = r.getString(9);
			    }
				files.add(f);
			}
			cmd.close();//auto close ResultSet
		}
		catch (SQLException e){e.printStackTrace();}

        Gson g = new Gson();
	    return g.toJson( files );
	}
    
    public static void Clear()
    {
		DbHelper db = new DbHelper();
		db.ExecuteNonQuery("truncate table down_files");
		//db.ExecuteNonQuery("truncate table hup_folders");
    }
}