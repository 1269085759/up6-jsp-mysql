package up6.biz.folder;

import java.io.IOException;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import up6.DbHelper;
import up6.PathTool;
import up6.biz.PathBuilder;
import up6.biz.PathBuilderMd5;
import up6.model.FileInf;

/**
 * 以MD5模式保存文件夹，会判断重复文件，所有文件以MD5模式命名。
 * 检查重复文件，服务器不会保存重复文件，只在数据库中做标识，重复文件指向服务器同一个文件路径。
 * @author Administrator
 *
 */
public class fd_appender 
{
	DbHelper db;
	Connection con;
	PreparedStatement cmd_add_f = null;
	PreparedStatement cmd_add_fd = null;
	
	protected PathBuilder pb;
	Map<String,FileInf> svr_files;
	public fd_root m_root;
	private String m_md5s;
	
	public fd_appender()
	{
		this.db = new DbHelper();
		this.con = this.db.GetCon();		
		this.pb = new PathBuilderMd5();
		this.svr_files = new HashMap<String,FileInf>();
	}
	
	public void save() throws SQLException, IOException
	{
        this.get_md5s();//提取所有文件的MD5        
        //增加对空文件夹和0字节文件夹的处理
        if(this.m_md5s.length() > 0) this.get_md5_files();//查询相同MD5值。
        //对空文件夹的处理，或者0字节文件夹的处理
        if(this.m_root.lenLoc == 0) this.m_root.complete = true;        
        
        
        //检查相同文件
        this.check_files();
        this.save_file(this.m_root);
        this.save_folder(this.m_root);
        for(FileInf f : this.m_root.files)
        {
        	f.pathSvr = this.pb.genFile(this.m_root.uid, f.md5, f.nameLoc);
        	f.nameSvr = f.md5 + "." + PathTool.getExtention(f.nameLoc);
        	f.fdChild = true;        	
        	this.save_file(f);
        }
        for(FileInf fd : this.m_root.folders)
        {
        	fd.pathSvr = PathTool.combine(this.m_root.pathSvr, fd.pathRel);
        	this.save_folder(fd);
        }

        this.cmd_add_f.close();
        this.cmd_add_fd.close();
        this.con.close();//关闭连接
	}
	
	protected void save_file(FileInf f)
	{		
		if(this.cmd_add_f == null)
		{
			StringBuilder sb = new StringBuilder();
			sb.append("insert into up6_files (");
			sb.append(" f_id");//1
			sb.append(",f_pid");//2
			sb.append(",f_pidRoot");//3
			sb.append(",f_fdTask");//4
			sb.append(",f_fdChild");//5
			sb.append(",f_uid");//6
			sb.append(",f_nameLoc");//7
			sb.append(",f_nameSvr");//8
			sb.append(",f_pathLoc");//9
			sb.append(",f_pathSvr");//10
			sb.append(",f_pathRel");//11
			sb.append(",f_md5");//12
			sb.append(",f_lenLoc");//13
			sb.append(",f_sizeLoc");//14
			sb.append(",f_lenSvr");//15
			sb.append(",f_perSvr");//16
			sb.append(",f_complete");//17
			
			sb.append(") values(");
			
			sb.append(" ?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(",?");
			sb.append(")");
	        try {
				this.cmd_add_f = this.con.prepareStatement(sb.toString());
		        this.cmd_add_f.setString(1, "");//
		        this.cmd_add_f.setString(2, "");//
		        this.cmd_add_f.setString(3, "");//
		        this.cmd_add_f.setBoolean(4, false);//f_fdID
		        this.cmd_add_f.setBoolean(5, false);//f_fdChild
		        this.cmd_add_f.setInt(6, 0);//f_uid
		        this.cmd_add_f.setString(7, "");//f_nameLoc
		        this.cmd_add_f.setString(8, "");//f_nameSvr
		        this.cmd_add_f.setString(9, "");//f_pathLoc
		        this.cmd_add_f.setString(10, "");//f_pathSvr
		        this.cmd_add_f.setString(11, "");//f_pathRel
		        this.cmd_add_f.setString(12, "");//f_md5
		        this.cmd_add_f.setLong(13, 0);//f_lenLoc
		        this.cmd_add_f.setString(14, "");//f_sizeLoc
		        this.cmd_add_f.setLong(15, 0);//f_lenSvr	        
		        this.cmd_add_f.setString(16, "");//f_perSvr
		        this.cmd_add_f.setBoolean(17, false);//f_complete	        
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		

        try {
			this.cmd_add_f.setString(1, f.id);//id
	        this.cmd_add_f.setString(2, f.pid);//pid
	        this.cmd_add_f.setString(3, f.pidRoot);//pidRoot
	        this.cmd_add_f.setBoolean(4, f.fdTask);//fdTask
	        this.cmd_add_f.setBoolean(5, f.fdChild);//f_fdChild
	        this.cmd_add_f.setInt(6, f.uid);//f_uid
	        this.cmd_add_f.setString(7, f.nameLoc);//f_nameLoc
	        this.cmd_add_f.setString(8, f.nameSvr);//f_nameSvr
	        this.cmd_add_f.setString(9, f.pathLoc);//f_pathLoc
	        this.cmd_add_f.setString(10, f.pathSvr);//f_pathSvr
	        this.cmd_add_f.setString(11, f.pathRel);//f_pathRel
	        this.cmd_add_f.setString(12, f.md5);//f_md5
	        this.cmd_add_f.setLong(13, f.lenLoc);//f_lenLoc
	        this.cmd_add_f.setString(14, f.sizeLoc);//f_sizeLoc
	        this.cmd_add_f.setLong(15, f.lenSvr);//f_lenSvr	        
	        this.cmd_add_f.setString(16, f.lenLoc > 0 ? f.perSvr : "0%");//f_perSvr
	        this.cmd_add_f.setBoolean(17, f.lenLoc > 0 ? f.complete : true);//f_complete
	        this.cmd_add_f.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}//
	}
	
	protected void save_folder(FileInf f)
	{
		StringBuilder sb = new StringBuilder();
		sb.append("insert into up6_folders (");
		sb.append(" fd_id");//1
		sb.append(",fd_pid");//2
		sb.append(",fd_pidRoot");//3
		sb.append(",fd_name");//4
		sb.append(",fd_uid");//5
		sb.append(",fd_pathLoc");//6
		sb.append(",fd_pathSvr");//7
		sb.append(",fd_pathRel");//8
		sb.append(") values(");//
		sb.append(" ?");
		sb.append(",?");
		sb.append(",?");
		sb.append(",?");
		sb.append(",?");
		sb.append(",?");
		sb.append(",?");
		sb.append(",?");
		sb.append(")");
		
		if(this.cmd_add_fd == null)
		{
	        try {
				this.cmd_add_fd = this.con.prepareStatement(sb.toString());
		        this.cmd_add_fd.setString(1, "");//
		        this.cmd_add_fd.setString(2, "");//
		        this.cmd_add_fd.setString(3, "");//
		        this.cmd_add_fd.setString(4, "");//fd_name
		        this.cmd_add_fd.setInt(5, 0);//fd_uid	     
		        this.cmd_add_fd.setString(6, "");//
		        this.cmd_add_fd.setString(7, "");//
		        this.cmd_add_fd.setString(8, "");//
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}		

        try {
			this.cmd_add_fd.setString(1, f.id);//id
	        this.cmd_add_fd.setString(2, f.pid);//pid
	        this.cmd_add_fd.setString(3, this.m_root.id);//pidRoot
	        this.cmd_add_fd.setString(4, f.nameLoc);//name
	        this.cmd_add_fd.setInt(5, f.uid);//f_uid
	        this.cmd_add_fd.setString(6, f.pathLoc);//pid
	        this.cmd_add_fd.setString(7, f.pathSvr);//pid
	        this.cmd_add_fd.setString(8, f.pathRel);//pid
	        this.cmd_add_fd.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}//	
	}

    protected void get_md5s()
    {
        Map<String, Boolean> md5s = new HashMap<String, Boolean>();
        List<String> md5_arr = new ArrayList<String>();
        
        for(int i=0,l=this.m_root.files.size();i<l;++i)
        {        
        	FileInf f = this.m_root.files.get(i);
            if( !md5s.containsKey(f.md5) && !StringUtils.isEmpty(f.md5))
            {
                md5s.put(f.md5, true);
                md5_arr.add(f.md5);
            }
        }
        this.m_md5s = StringUtils.join( md5_arr.toArray(),",");
    }

    protected void get_md5_files() 
    {
        String sql ="{call fd_files_check(?,?,?)}";

        CallableStatement cmd;
		try 
		{
			cmd = this.con.prepareCall(sql);	
			cmd.setString(1, this.m_md5s);
			cmd.setInt(2, this.m_root.files.get(0).md5.length());
			cmd.setInt(3, this.m_md5s.length());
			cmd.execute();
			ResultSet rs = (ResultSet)cmd.getObject(2);
	        while(rs.next())
	        {
	            FileInf f = new FileInf();
	            f.id 		= rs.getString("f_id");
	            f.nameLoc = rs.getString("f_nameLoc");
	            f.nameSvr = rs.getString("f_nameSvr");
	            f.pid = rs.getString("f_pid");
	            f.fdTask = rs.getBoolean("f_fdTask");
	            f.fdChild = rs.getBoolean("f_fdChild");	            
	            f.pathLoc = rs.getString("f_pathLoc");
	            f.pathSvr = rs.getString("f_pathSvr");
	            f.lenLoc = rs.getLong("f_lenLoc");
	            f.sizeLoc = rs.getString("f_sizeLoc");
	            f.lenSvr = rs.getLong("f_lenSvr");
	            f.perSvr = rs.getString("f_perSvr");
	            f.offset = rs.getLong("f_pos");
	            f.complete = rs.getBoolean("f_complete");
	            f.md5 = rs.getString("f_md5");
	            if(!StringUtils.isEmpty(f.md5)) this.svr_files.put(f.md5, f);
	        }
	        rs.close();
	        cmd.close();
		} catch (SQLException e) 
		{
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }

    /// <summary>
    /// 查找相同MD5的文件
    /// </summary>
    protected void check_files() throws IOException
    {
        if (this.svr_files.size() < 1) return;
        for(int i = 0 , l = this.m_root.files.size();i<l;++i)
        {
        	FileInf f = this.m_root.files.get(i);
        	if(this.svr_files.containsKey(f.md5))
        	{
            	FileInf f_svr = this.svr_files.get(f.md5);
            	this.m_root.lenSvr += f_svr.lenSvr;
                f.nameSvr = f_svr.nameSvr;
                f.pathSvr = f_svr.pathSvr;
                f.lenLoc = f_svr.lenLoc;
                f.sizeLoc = f_svr.sizeLoc;
                f.lenSvr = f_svr.lenSvr;
                f.perSvr = f_svr.perSvr;
                f.offset = f_svr.offset;
                f.complete = f_svr.complete;
        	}
        }
    }
}