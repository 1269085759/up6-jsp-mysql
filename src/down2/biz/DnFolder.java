package down2.biz;

import com.google.gson.Gson;

import down2.model.DnFolderInf;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;

import up6.DBFile;
import up6.DbHelper;
import up6.model.FileInf;
import up6.model.FolderInf;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class DnFolder 
{
    public DnFolder()
    { }
    
    public static int Add(DnFolderInf inf)
    {
		StringBuilder sb = new StringBuilder();
		sb.append("insert into down_folders(");		
		sb.append(" fd_name");
		sb.append(",fd_uid");
		sb.append(",fd_mac");
		sb.append(",fd_pathLoc");
		sb.append(",fd_id_old");
		
		sb.append(") values(");		
		
		sb.append(" ?");//sb.append("@fd_name");
		sb.append(",?");//sb.append(",@fd_uid");
		sb.append(",?");//sb.append(",@fd_mac");
		sb.append(",?");//sb.append(",@fd_pathLoc");
		sb.append(",?");//sb.append(",@fd_id_old");
		sb.append(")");

		DbHelper db = new DbHelper();
		//PreparedStatement cmd = db.GetCommand(sb.toString(),"fd_id");
		PreparedStatement cmd = db.GetCommandPK(sb.toString());
		try {
			cmd.setString(1, inf.nameLoc);
			cmd.setInt(2, inf.uid);
			cmd.setString(3, inf.mac);
			cmd.setString(4, inf.pathLoc);
			cmd.setInt(5, inf.fdID);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		int fid = (int)db.ExecuteGenKey(cmd);		
		
		return fid;    	
    }
    
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
    
    
    /**
     * 获取文件夹JSON数据结构
     * @param fid
     * @param root
     * @return
     * {files:"文件列表",length:100,ids:"1,2,3,4,5,6"}
     */
    public static String GetFolderData(int fid,FolderInf root)
    {
        StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" xf.fd_name");
        sb.append(",xf.fd_length");
        sb.append(",xf.fd_size");
        sb.append(",xf.fd_pid");
        sb.append(",xf.fd_pathLoc");
        sb.append(",xf.fd_pathSvr");
        sb.append(",xf.fd_folders");
        sb.append(",xf.fd_files");
        sb.append(",xf.fd_filesComplete");
        sb.append(" from down_folders as df");
        sb.append(" left join xdb_files as xf");
        sb.append(" on xf.f_fID = df.fd_id");
        sb.append(" where df.fd_id=? and xf.fd_complete=1");

        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        try
        {
			cmd.setInt(1, fid );			
			ResultSet r = db.ExecuteDataSet(cmd);
			while (r.next())
			{
				root.nameLoc	= r.getString(1);
				root.lenLoc	    = r.getLong(2);
			    root.size		= r.getString(3);
				root.pidSvr		= r.getInt(4);
			    root.idSvr		= r.getInt(5);
			    root.pathLoc	= r.getString(8);
				root.pathSvr	= r.getString(8);
				root.folders	= r.getShort(1);
				root.filesCount = r.getInt(8);
				root.filesComplete = r.getInt(10);
			}
			r.close();
			cmd.close();
			cmd.getConnection().close();
        }
        catch(SQLException e)
        {
        	e.printStackTrace();
        }

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
}