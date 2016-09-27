package down2.biz;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import down2.model.DnFileInf;
import down2.model.DnFolderInf;

import up6.DbHelper;
import up6.XDebug;


public class folder_appender 
{
	public folder_appender()
	{
		
	}
	
	public void add(DnFolderInf fd) throws SQLException
	{
        String sql = "{call fd_add_batch(?,?)}";
        DbHelper db = new DbHelper();
        CallableStatement stor = db.GetCommandStored(sql);
        stor.setInt(1, fd.files.size()+1);//单独增加一个文件夹
        stor.setInt(2, fd.uid);
        ResultSet rs = stor.executeQuery();
        Integer[] ids = new Integer[fd.files.size()+1];
        int index = 0;
        while(rs.next())
        {
        	ids[index++] = rs.getInt(1);
        }
        rs.close();
        
        StringBuilder sb = new StringBuilder();
        sb.append("update down_files set");
        sb.append(" f_nameLoc=?");
        sb.append(",f_pathLoc=?");
        sb.append(",f_fileUrl=?");
        sb.append(",f_lenSvr=?");
        sb.append(",f_sizeSvr=?");
        sb.append(",f_pidRoot=?");
        sb.append(",f_fdTask=?");
        sb.append(" where f_id=?");
        db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        
        XDebug.Output("ids总数",ids.length);
        XDebug.Output("files总数",fd.files.size());

        //更新文件夹
        fd.idSvr = ids[0];
        this.update_file(cmd, fd);
        
        //更新文件列表        
        for(int i = 1 , l = ids.length;i< l;++i)
        {
        	DnFileInf f = fd.files.get(i-1);
        	f.idSvr = ids[i];
        	f.pidRoot = fd.idSvr;
            
            this.update_file(cmd, f);
        }    
	}

    void update_file(PreparedStatement cmd,DnFileInf f) throws SQLException
    {
        cmd.setString(1, f.nameLoc);
        cmd.setString(2, f.pathLoc);
        cmd.setString(3, f.fileUrl);
        cmd.setLong(4, f.lenSvr);
        cmd.setString(5, f.sizeSvr);
        cmd.setInt(6, f.pidRoot);
        cmd.setBoolean(7, f.fdTask);
        cmd.setInt(8, f.idSvr);
        cmd.execute();
    }
}
