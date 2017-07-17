package up6.biz.folder;

import java.io.IOException;
import java.sql.SQLException;

import up6.FileBlockWriter;
import up6.PathTool;
import up6.biz.PathBuilderUuid;
import up6.model.FileInf;

/**
 * uuid模式会在服务端创建文件夹层级结构，所有文件以原始名称命名。
 * 不会检查重复文件，服务器会保存重复文件。
 * @author Administrator
 *
 */
public class fd_uuid_appender extends fd_appender
{
	public fd_uuid_appender()
	{
		this.pb = new PathBuilderUuid();
	}

    public void save() throws IOException, SQLException
    {   
        this.m_root.pathSvr = this.pb.genFolder(this.m_root.uid, this.m_root.nameLoc);
        this.m_root.pathSvr = this.m_root.pathSvr.replace("\\", "/");
        PathTool.createDirectory(this.m_root.pathSvr);

        this.save_file(this.m_root);
        this.save_folder(this.m_root);
        
        //创建目录
        for(FileInf fd : this.m_root.folders)
        {
        	fd.pathSvr = PathTool.combine(this.m_root.pathSvr, fd.pathRel);
        	fd.pathSvr = fd.pathSvr.replace("\\", "/");
        	PathTool.createDirectory(fd.pathSvr);
        	this.save_folder( fd);
        }
        //创建文件
        for(FileInf f : this.m_root.files)
        {
        	f.nameSvr = f.nameLoc;
        	f.pathSvr = PathTool.combine(this.m_root.pathSvr, f.pathRel);
        	f.pathSvr = f.pathSvr.replace("\\", "/");
        	f.fdChild = true;
    		FileBlockWriter fr = new FileBlockWriter();
    		fr.CreateFile(f.pathSvr);		
        	this.save_file(f);
        }

        this.cmd_add_f.close();
        this.cmd_add_fd.close();
        this.con.close();//关闭连接
    }
    protected void get_md5s(){}//不查询重复文件
    protected void get_md5_files() { }//不查询重复文件
    protected void check_files(){}
}
