package down2.biz;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import up6.DbHelper;
import com.google.gson.Gson;
import down2.model.DnFileInf;

public class DnFile 
{
	public DnFile()
	{
	}
	
    public void Add(down2.model.DnFileInf inf)
    {
        StringBuilder sb = new StringBuilder();
        sb.append("insert into down_files(");        
        sb.append(" f_id");
        sb.append(",f_uid");
        sb.append(",f_nameLoc");
        sb.append(",f_pathLoc");
        sb.append(",f_fileUrl");
        sb.append(",f_lenSvr");
        sb.append(",f_sizeSvr");
        sb.append(",f_fdTask");
        
        sb.append(") values(");
        
        sb.append(" ?");//id
        sb.append(",?");//uid
        sb.append(",?");//nameLoc
        sb.append(",?");//pathLoc
        sb.append(",?");//fileUrl
        sb.append(",?");//lenSvr
        sb.append(",?");//sizeSvr
        sb.append(",?");//fdTask
        sb.append(")");
		
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommandPK(sb.toString());

		try
		{
			cmd.setString(1,inf.id);
			cmd.setInt(2,inf.uid);
			cmd.setString(3,inf.nameLoc);
			cmd.setString(4,inf.pathLoc);
			cmd.setString(5,inf.fileUrl);
			cmd.setLong(6,inf.lenSvr);
			cmd.setString(7,inf.sizeSvr);
			cmd.setBoolean(8,inf.fdTask);
			db.ExecuteNonQuery(cmd);			
		}
		catch (SQLException e){e.printStackTrace();}	

    }

    /**
     * 将文件设为已完成
     * @param fid
     */
    public void Complete(String fid)
    {
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand("update down_files set f_complete=1 where f_id=?");
		try
		{
			cmd.setString(1,fid);
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
    public static void Delete(String fid,int uid)
    {
        String sql = "delete from down_files where f_id=? and f_uid=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setString(1,fid);
			cmd.setInt(2,uid);			
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
    public void process(String fid,int uid,String lenLoc,String perLoc)
    {
        String sql = "update down_files set f_lenLoc=?,f_perLoc=? where f_id=? and f_uid=?";
        DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sql);

		try
		{
			cmd.setString(1,lenLoc);
			cmd.setString(2,perLoc);
			cmd.setString(3,fid);
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
    public static String all_uncmp(int uid)
    {
    	StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");
        sb.append(",f_nameLoc");
        sb.append(",f_pathLoc");
        sb.append(",f_perLoc");
        sb.append(",f_sizeSvr");
        sb.append(",f_fdTask");
        sb.append(" from down_files");
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
				f.id			= r.getString(1);
				f.nameLoc		= r.getString(2);
				f.pathLoc		= r.getString(3);
				f.perLoc		= r.getString(4);
				f.sizeSvr		= r.getString(5);
				f.fdTask		= r.getBoolean(6);
			    
				files.add(f);
			}
			cmd.close();//auto close ResultSet
		}
		catch (SQLException e){e.printStackTrace();}

        Gson g = new Gson();
	    return g.toJson( files );
	}
    
    /**
     * 从up6_files表中获取已经上传完的数据
     * @param uid
     * @return
     */
    public String all_complete(int uid)
    {
    	ArrayList<DnFileInf> files = new ArrayList<DnFileInf>();
    	StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");//0
        sb.append(",f_fdTask");//1
        sb.append(",f_nameLoc");//2
        sb.append(",f_sizeLoc");//3
        sb.append(",f_lenSvr");//4
        sb.append(",f_pathSvr");//5
        sb.append(" from up6_files ");
        //
        sb.append(" where f_uid=? and f_deleted=0 and f_complete=1 and f_fdChild=0");
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try
		{
			cmd.setInt(1,uid);
			ResultSet r = db.ExecuteDataSet(cmd);
			while (r.next())
			{
				DnFileInf f		= new DnFileInf();
				String uuid = UUID.randomUUID().toString();
				uuid = uuid.replace("-", "");

				f.id			= uuid;
				f.f_id			= r.getString(1);
				f.fdTask		= r.getBoolean(2);
				f.nameLoc		= r.getString(3);
				f.sizeSvr		= r.getString(4);
				f.lenSvr		= r.getLong(5);
				f.pathSvr		= r.getString(6);
			    
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