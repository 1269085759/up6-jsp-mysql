package up6.biz.folder;

import java.io.IOException;
import java.sql.SQLException;

import up6.PathTool;
import up6.biz.PathUuidBuilder;


public class fd_uuid_appender extends fd_appender
{
	public fd_uuid_appender()
	{
		this.pb = new PathUuidBuilder();
	}

    public void save() throws IOException, SQLException
    {
        this.m_root.pathRel = this.m_root.nameLoc;//
        
        this.m_root.pathSvr = this.pb.genFolder(this.m_root.uid, this.m_root.nameLoc);
        PathTool.createDirectory(this.m_root.pathSvr);

        super.save();
    }
    protected void get_md5s(){}//不查询重复文件
    protected void check_files_svr() { }//不查询重复文件

    public void update_rel() throws IOException
    {
        //更新文件夹的层级ID
    	for(int i = 0 , l = this.m_root.folders.size();i<l;++i)
    	{
    		fd_child fd = this.m_root.folders.get(i);
            int pidSvr = 0;
            if( this.map_pids.containsKey(fd.pidLoc) ) pidSvr = this.map_pids.get(fd.pidLoc);
            fd.pidSvr = pidSvr;

            //构建层级路径
            String parentPath = this.m_root.pathSvr;
            String parentRel = this.m_root.pathRel;
            int parentIndex = 0;
            if (fd.pidLoc != 0) parentIndex = this.map_fd_ids.get(fd.pidLoc);
            if (fd.pidLoc != 0) parentPath = this.m_root.folders.get(parentIndex).pathSvr;
            if (fd.pidLoc != 0) parentRel = this.m_root.folders.get(parentIndex).pathRel;
            fd.pathSvr = PathTool.combine(parentPath, fd.nameLoc);
            fd.pathRel = PathTool.combine(parentRel, fd.nameLoc);
        }

        //更新文件的层级ID
    	for(int i = 0 , l = this.m_root.files.size();i<l;++i)
    	{
    		fd_file f = this.m_root.files.get(i);
            int pidSvr = 0;
            if( this.map_pids.containsKey(f.pidLoc) ) pidSvr = this.map_pids.get(f.pidLoc);
            //this.map_pids.TryGetValue(f.pidLoc, out pidSvr);
            f.pidSvr = pidSvr;
            f.nameSvr = f.nameLoc;

            //构建层级路径
            String parentPath = this.m_root.pathSvr;
            String parentRel = this.m_root.pathRel;
            int parentIndex = 0;
            if (f.pidLoc != 0) parentIndex = this.map_fd_ids.get(f.pidLoc);
            if (f.pidLoc != 0) parentPath = this.m_root.folders.get(parentIndex).pathSvr;
            if (f.pidLoc != 0) parentRel = this.m_root.folders.get(parentIndex).pathRel;
            f.pathSvr = PathTool.combine(parentPath, f.nameLoc);
            f.pathRel = PathTool.combine(parentRel, f.nameLoc);
        }
    }
}
