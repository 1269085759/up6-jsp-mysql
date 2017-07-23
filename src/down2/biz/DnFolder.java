package down2.biz;

import up6.DbHelper;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.google.gson.Gson;

import down2.model.DnFileInf;

public class DnFolder 
{
    public DnFolder()
    { }
    
    
    public static void Clear()
    {
		DbHelper db = new DbHelper();
		db.ExecuteNonQuery("truncate table down_folders");
		db.ExecuteNonQuery("truncate table down_files");
    }
    
    public static void Del(String idF,String idFD,String uid,String mac)
    {
        String sql = "delete from down_folders where fd_id=? and fd_mac=? and fd_uid=?";
        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sql);
        try
        {
			cmd.setInt(1, Integer.parseInt(idFD) );
			cmd.setString(2, mac);
			cmd.setString(3, uid);
			db.ExecuteNonQuery(cmd);
			
			//删除down_files
			sql = "delete from down_files where f_id=? and f_mac=? and f_uid=?";
			cmd = db.GetCommand(sql);
			cmd.setInt(1, Integer.parseInt(idF));
			cmd.setString(2, mac);
			cmd.setString(3, uid);
			db.ExecuteNonQuery(cmd);
        }
        catch(SQLException e)
        {
        	e.printStackTrace();
        }
    }
    
    public static void Update(String fid,String uid,String mac,String percent)
    {
        String sql = "update down_folders set fd_percent=? where fd_id=? and fd_uid=? and fd_mac=?";
        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sql);
        try
        {
			cmd.setString(1, percent );
			cmd.setInt(2, Integer.parseInt(fid) );
			cmd.setInt(3, Integer.parseInt(uid) );
			cmd.setString(4, mac );
			db.ExecuteNonQuery(cmd);
        }
        catch(SQLException e)
        {
        	e.printStackTrace();
        }    	
    }
    
    public static String all_file(String id)
    {
    	StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");
        sb.append(",f_nameLoc");
        sb.append(",f_pathSvr");
        sb.append(",f_pathRel");
        sb.append(",f_lenSvr");
        sb.append(",f_sizeLoc");        
        sb.append(" from up6_files");
        sb.append(" where f_pidRoot=?");

        ArrayList<DnFileInf> files = new ArrayList<DnFileInf>();
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try
		{
			cmd.setString(1,id);
			ResultSet r = db.ExecuteDataSet(cmd);
			while (r.next())
			{
				DnFileInf f		= new DnFileInf();
				f.f_id			= r.getString(1);
				f.nameLoc		= r.getString(2);
				f.pathSvr		= r.getString(3);
				f.pathRel		= r.getString(4);
				f.lenSvr		= r.getLong(5);
				f.sizeSvr		= r.getString(6);
			    
				files.add(f);
			}
			cmd.close();//auto close ResultSet
		}
		catch (SQLException e){e.printStackTrace();}

        Gson g = new Gson();
	    return g.toJson( files );	
    }
}