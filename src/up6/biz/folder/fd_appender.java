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
import up6.FileResumerPart;
import up6.PathTool;
import up6.XDebug;
import up6.biz.PathBuilder;
import up6.biz.PathMd5Builder;


public class fd_appender 
{
	Integer[] fd_ids;
	Integer[] f_ids;
	DbHelper db;
	Connection con;	
	PreparedStatement cmd_update_fd;
	PreparedStatement cmd_update_file;
	
	protected PathBuilder pb;
	protected Map<Integer,Integer> map_pids;
	protected Map<Integer,Integer> map_fd_ids;
	Map<String,fd_file> svr_files;
	public fd_root m_root;
	private String m_md5s;
	
	public fd_appender()
	{
		this.db = new DbHelper();
		this.con = this.db.GetCon();
		this.m_md5s = "";
		this.pb = new PathMd5Builder();
		this.map_pids = new HashMap<Integer,Integer>();
		this.map_fd_ids = new HashMap<Integer,Integer>();
		this.svr_files = new HashMap<String,fd_file>();
	}
	
	public void save() throws SQLException, IOException
	{
        this.get_md5s();//提取所有文件的MD5
        this.make_ids();
        //增加对空文件夹和0字节文件夹的处理
        if(this.m_md5s.length() > 1) this.check_files_svr();//查询相同MD5值。

        this.set_ids();     //设置文件和文件夹id
        this.update_rel();  //更新结构关系

        //对空文件夹的处理，或0字节文件夹的处理
        if(this.m_root.lenLoc == 0) this.m_root.complete = true;
        
        //更新文件夹信息
        this.pre_udpate_fd();
        for(int i = 0 , l = this.m_root.folders.size();i<l;++i)        
        {
        	fd_child fc = this.m_root.folders.get(i);
            this.update_fd(fc);
        }

        //更新根级文件夹信息
        int id_file = this.m_root.idSvr;
        this.m_root.idSvr = this.m_root.fdID;//设为文件夹表的ID
        this.update_fd(this.m_root);
        this.cmd_update_fd.close();
        this.m_root.idSvr = id_file;//设为文件表的ID。
        this.m_root.idFile = id_file;

        //检查相同文件
        this.check_files_loc();

        //批量更新文件
        this.pre_update_files();
        for(int i = 0 , l = this.m_root.files.size();i<l;++i)
        {
        	fd_file f = this.m_root.files.get(i);
        	//文件不存在
        	if(!PathTool.exist(f.pathSvr))
        	{
            	FileResumerPart fr = new FileResumerPart();
            	fr.CreateFile(f.pathSvr);        		
        	}
        		
            this.update_file(f);
        }
        this.update_file(this.m_root);
        this.cmd_update_file.close();
        this.con.close();//关闭连接
	}

    protected void get_md5s()
    {
        Map<String, Boolean> md5s = new HashMap<String, Boolean>();
        List<String> md5_arr = new ArrayList<String>();        
        
        for(int i=0,l=this.m_root.files.size();i<l;++i)
        {        
        	fd_file f = this.m_root.files.get(i);
            if( !md5s.containsKey(f.md5) && !StringUtils.isEmpty(f.md5) )
            {
                md5s.put(f.md5, true);
                md5_arr.add(f.md5);
            }
        }
        this.m_md5s = StringUtils.join( md5_arr.toArray(),",");
    }

    void make_ids() throws SQLException
    {
    	CallableStatement cmd = this.con.prepareCall("{call fd_files_add_batch(?,?)}");
        cmd.setInt(1, this.m_root.files.size()+1);
        cmd.setInt(2, this.m_root.folders.size()+1);
        ResultSet rs = cmd.executeQuery();
        List<Integer> arr_f = new ArrayList<Integer>();
        List<Integer> arr_fd = new ArrayList<Integer>();
        while(rs.next())
        {
        	if(rs.getBoolean(1))//文件
        	{
        		arr_f.add(rs.getInt(2));
        	}
        	else//文件夹
        	{
        		arr_fd.add(rs.getInt(2));
        	}
        }
        this.f_ids = arr_f.toArray(new Integer[0]);
        this.fd_ids = arr_fd.toArray(new Integer[0]);
        rs.close();
        cmd.close();
    }

    /// <summary>
    /// 设置ID值
    /// 设置文件的父级ID
    /// 设置文件夹的父级ID
    /// </summary>
    void set_ids()
    {
    	XDebug.Output("文件总数：",this.m_root.files.size());
    	XDebug.Output("文件夹总数：",this.m_root.folders.size());
    	XDebug.Output("文件ID总数：",this.f_ids.length);
    	XDebug.Output("文件夹ID总数：",this.fd_ids.length);
        this.m_root.idSvr = this.f_ids[this.m_root.files.size()];//取最后一个
        this.m_root.fdID = this.fd_ids[this.m_root.folders.size()]; //取最后一个
        this.map_pids.put( 0, this.m_root.fdID);

        //设置文件夹ID，
        for (int i = 0, l = this.m_root.folders.size(); i < l; ++i)
        {
        	fd_child cd = this.m_root.folders.get(i);
        	cd.idSvr = this.fd_ids[i];
        	cd.pidRoot = this.m_root.idSvr;
            this.map_pids.put(cd.idLoc, cd.idSvr);
            this.map_fd_ids.put(cd.idLoc, i);//添加idLoc,index索引
        }

        for (int i = 0, l = this.m_root.files.size(); i < l; ++i)
        {
        	fd_file f = this.m_root.files.get(i);
            f.idSvr = this.f_ids[i];
            f.pidRoot = this.m_root.fdID;
            f.fdChild = true;//
        }
    }

    /// <summary>
    /// 更新层级结构信息
    /// 更新文件夹父级ID
    /// 更新文件父级ID
    /// </summary>
    /// <param name="fd"></param>
    public void update_rel() throws IOException
    {
        //更新文件夹的层级ID
    	for(int i = 0 , l = this.m_root.folders.size();i<l;++i)        
        {
    		fd_child fd = this.m_root.folders.get(i);
            int pidSvr = 0;
            if(this.map_pids.containsKey(fd.pidLoc))
            {
            	pidSvr = this.map_pids.get(fd.pidLoc);
                fd.pidSvr = pidSvr;
            }
        }

        //更新文件的层级ID
    	for(int i = 0 , l = this.m_root.files.size();i<l;++i)
    	{
    		fd_file f = this.m_root.files.get(i);
            int pidSvr = 0;
            if(this.map_pids.containsKey(f.pidLoc))
            {
            	pidSvr = this.map_pids.get(f.pidLoc);
            }
            //this.map_pids.TryGetValue(f.pidLoc, out pidSvr);
            f.pidSvr = pidSvr;
            //生成服务器文件名称            
            f.nameSvr = f.md5 + "." + PathTool.getExtention(f.pathLoc).toLowerCase();
            //生成文件路径
            f.pathSvr = this.pb.genFile(f.uid, f.md5, f.nameLoc);            
        }
    }

    void pre_udpate_fd() throws SQLException
    {
        StringBuilder sb = new StringBuilder();        
        sb.append("update up6_folders set");
        sb.append(" fd_name=?");
        sb.append(",fd_pid=?");
        sb.append(",fd_uid=?");
        sb.append(",fd_length=?");
        sb.append(",fd_size=?");
        sb.append(",fd_pathLoc=?");
        sb.append(",fd_pathSvr=?");
        sb.append(",fd_folders=?");
        sb.append(",fd_files=?");
        sb.append(",fd_pidRoot=?");
        sb.append(" where fd_id=?");

        this.cmd_update_fd = this.con.prepareStatement(sb.toString());
        this.cmd_update_fd.setString(1, "");//fd_name
        this.cmd_update_fd.setInt(2, 0);//fd_pid
        this.cmd_update_fd.setInt(3, 0);//fd_uid
        this.cmd_update_fd.setInt(4, 0);//fd_length
        this.cmd_update_fd.setInt(5, 0);//fd_size
        this.cmd_update_fd.setString(6, "");//fd_pathLoc
        this.cmd_update_fd.setString(7, "");//fd_pathSvr
        this.cmd_update_fd.setInt(8, 0);//fd_folders
        this.cmd_update_fd.setInt(9, 0);//fd_files
        this.cmd_update_fd.setInt(10, 0);//fd_pidRoot
        this.cmd_update_fd.setInt(11, 0);//fd_id
    }

    void update_fd(fd_child fd) throws SQLException
    {
        this.cmd_update_fd.setString(1,fd.nameLoc);
        this.cmd_update_fd.setInt(2, fd.pidSvr);//fd_pid
        this.cmd_update_fd.setInt(3, fd.uid);//fd_uid
        this.cmd_update_fd.setLong(4, fd.lenLoc);//fd_length
        this.cmd_update_fd.setString(5, fd.sizeLoc);//fd_size
        this.cmd_update_fd.setString(6, fd.pathLoc);//fd_pathLoc
        this.cmd_update_fd.setString(7, fd.pathSvr);//fd_pathSvr
        this.cmd_update_fd.setInt(8, fd.foldersCount);//fd_folders
        this.cmd_update_fd.setInt(9, fd.filesCount);//fd_files
        this.cmd_update_fd.setInt(10, fd.pidRoot);//fd_pidRoot
        this.cmd_update_fd.setInt(11, fd.idSvr);//fd_id
        this.cmd_update_fd.execute();
    }

    protected void check_files_svr() throws SQLException
    {
    	if(this.m_root.files.size() < 1) return;//没有文件
        String sql = "{call fd_files_check(?,?,?)}";

        CallableStatement cmd = this.con.prepareCall(sql);
        
        cmd.setString(1, this.m_md5s);
        cmd.setInt(2, this.m_root.files.get(0).md5.length());
        cmd.setInt(3, this.m_md5s.length());
        ResultSet rs = cmd.executeQuery();
        while(rs.next())
        {
            fd_file f = new fd_file();
            f.idSvr = rs.getInt("f_id");
            f.nameLoc = rs.getString("f_nameLoc");
            f.nameSvr = rs.getString("f_nameSvr");
            f.pidSvr = rs.getInt("f_pid");
            f.fdTask = rs.getBoolean("f_fdTask");
            f.fdChild = rs.getBoolean("f_fdChild");
            f.fdID = rs.getInt("f_fdID");
            f.pathLoc = rs.getString("f_pathLoc");
            f.pathSvr = rs.getString("f_pathSvr");
            f.lenLoc = rs.getLong("f_lenLoc");
            f.sizeLoc = rs.getString("f_sizeLoc");
            f.lenSvr = rs.getLong("f_lenSvr");
            f.perSvr = rs.getString("f_perSvr");
            f.pos = rs.getLong("f_pos");
            f.complete = rs.getBoolean("f_complete");
            f.md5 = rs.getString("f_md5");
            if(!StringUtils.isEmpty(f.md5)) this.svr_files.put(f.md5, f);
        }
        rs.close();
        cmd.close();
    }

    /// <summary>
    /// 查找相同MD5的文件
    /// </summary>
    protected void check_files_loc() throws IOException
    {
        if (this.svr_files.size() < 1) return;
        for(int i = 0 , l = this.m_root.files.size();i<l;++i)
        {
        	fd_file f = this.m_root.files.get(i);
        	if(this.svr_files.containsKey(f.md5))
        	{
            	fd_file f_svr = this.svr_files.get(f.md5);
            	this.m_root.lenSvr += f_svr.lenSvr;
                f.nameSvr = f_svr.nameSvr;
                f.pathSvr = f_svr.pathSvr;
                f.lenLoc = f_svr.lenLoc;
                f.sizeLoc = f_svr.sizeLoc;
                f.lenSvr = f_svr.lenSvr;
                f.perSvr = f_svr.perSvr;
                f.pos = f_svr.pos;
                f.complete = f_svr.complete;
        	}
        }
    }

    void pre_update_files() throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append("update up6_files set");
        sb.append(" f_pid=?");
        sb.append(",f_pidRoot=?");
        sb.append(",f_fdTask=?");
        sb.append(",f_fdID=?");
        sb.append(",f_fdChild=?");
        sb.append(",f_uid=?");
        sb.append(",f_nameLoc=?");
        sb.append(",f_nameSvr=?");
        sb.append(",f_pathLoc=?");
        sb.append(",f_pathSvr=?");
        sb.append(",f_pathRel=?");
        sb.append(",f_md5=?");
        sb.append(",f_lenLoc=?");
        sb.append(",f_sizeLoc=?");
        sb.append(",f_pos=?");
        sb.append(",f_lenSvr=?");
        sb.append(",f_perSvr=?");
        sb.append(",f_complete=?");
        sb.append(" where f_id=?");

        this.cmd_update_file = this.con.prepareStatement(sb.toString());
        this.cmd_update_file.setInt(1, 0);//f_pid
        this.cmd_update_file.setInt(2, 0);//f_pidRoot
        this.cmd_update_file.setBoolean(3, false);//f_fdTask
        this.cmd_update_file.setInt(4, 0);//f_fdID
        this.cmd_update_file.setBoolean(5, false);//f_fdChild
        this.cmd_update_file.setInt(6, 0);//f_uid
        this.cmd_update_file.setString(7, "");//f_nameLoc
        this.cmd_update_file.setString(8, "");//f_nameSvr
        this.cmd_update_file.setString(9, "");//f_pathLoc
        this.cmd_update_file.setString(10, "");//f_pathSvr
        this.cmd_update_file.setString(11, "");//f_pathRel
        this.cmd_update_file.setString(12, "");//f_md5
        this.cmd_update_file.setInt(13, 0);//f_lenLoc
        this.cmd_update_file.setString(14, "");//f_sizeLoc
        this.cmd_update_file.setLong(15, 0);//f_pos
        this.cmd_update_file.setLong(16, 0);//f_lenSvr
        this.cmd_update_file.setString(17, "");//f_perSvr
        this.cmd_update_file.setBoolean(18, false);//f_complete
        this.cmd_update_file.setInt(19, 0);//f_id
    }

    void update_file(fd_file f) throws SQLException
    {
        this.cmd_update_file.setInt(1, f.pidSvr);//f_pid
        this.cmd_update_file.setInt(2, f.pidRoot);//f_pidRoot
        this.cmd_update_file.setBoolean(3, f.fdTask);//f_fdTask
        this.cmd_update_file.setInt(4, f.fdID);//f_fdID
        this.cmd_update_file.setBoolean(5, f.fdChild);//f_fdChild
        this.cmd_update_file.setInt(6, f.uid);//f_uid
        this.cmd_update_file.setString(7, f.nameLoc);//f_nameLoc
        this.cmd_update_file.setString(8, f.nameSvr);//f_nameSvr
        this.cmd_update_file.setString(9, f.pathLoc);//f_pathLoc
        this.cmd_update_file.setString(10, f.pathSvr);//f_pathSvr
        this.cmd_update_file.setString(11, f.pathRel);//f_pathRel
        this.cmd_update_file.setString(12, f.md5);//f_md5
        this.cmd_update_file.setLong(13, f.lenLoc);//f_lenLoc
        this.cmd_update_file.setString(14, f.sizeLoc);//f_sizeLoc
        this.cmd_update_file.setLong(15, f.pos);//f_pos
        this.cmd_update_file.setLong(16, f.lenSvr);//f_lenSvr
        this.cmd_update_file.setString(17, f.lenLoc > 0 ? f.perSvr : "100%");//f_perSvr
        this.cmd_update_file.setBoolean(18, f.lenLoc > 0 ? f.complete : true);//f_complete
        this.cmd_update_file.setInt(19, f.idSvr);//f_id
        this.cmd_update_file.execute();
    }
}