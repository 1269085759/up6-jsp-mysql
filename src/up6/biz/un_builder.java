package up6.biz;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import up6.DbHelper;
import up6.biz.folder.fd_file;

import com.google.gson.Gson;


public class un_builder 
{
    /// <summary>
    /// 加载未上传完的文件和文件夹列表
    /// </summary>
    private List<un_file> files;
    private Map<Integer, Integer/*对应到files的索引*/> folders ;
    
    public un_builder()
    {
    	this.files = new ArrayList<un_file>();
    	this.folders = new HashMap<Integer,Integer>();
    }

    public String read(String uid) throws NumberFormatException, SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" f_id");//1
        sb.append(",f_pid");//2
        sb.append(",f_pidRoot");//3
        sb.append(",f_fdTask");//4
        sb.append(",f_fdID");//5
        sb.append(",f_fdChild");//6
        sb.append(",f_nameLoc");//7
        sb.append(",f_nameSvr");//8
        sb.append(",f_pathLoc");//9
        sb.append(",f_pathSvr");//10
        sb.append(",f_pathRel");//11
        sb.append(",f_md5");//12
        sb.append(",f_lenLoc");//13
        sb.append(",f_sizeLoc");//14
        sb.append(",f_pos");//15
        sb.append(",f_lenSvr");//16
        sb.append(",f_perSvr");//17
        sb.append(",f_complete");//18
        //
        sb.append(" from up6_files");
        //
        sb.append(" where f_uid=? and f_complete=0 and f_deleted=0");

        DbHelper db = new DbHelper();
        PreparedStatement  cmd = db.GetCommand(sb.toString());
        cmd.setInt(1, Integer.parseInt(uid));
        
        ResultSet r = cmd.executeQuery();

        while (r.next())
        {
            int pidRoot = r.getInt(3);

            //是一个子文件
            if (pidRoot != 0)
            {
                this.add_child(r, pidRoot);
            }//是一个文件项
            else
            {
                this.add_file(r, pidRoot);
            }
        }
        r.close();
        cmd.close();

        return this.to_json();//
    }

    /// <summary>
    /// 添加一个文件项
    /// </summary>
    void add_file(ResultSet r, int uid) throws SQLException
    {
        un_file f = new un_file();
        f.uid = uid;
        f.read(0, r);

        //是文件夹
        if (f.fdTask)
        {
            int fd_index = 0;//有文件夹
            if(this.folders.containsKey(f.fdID))
            {
            	fd_index = this.folders.get(f.fdID);
            	this.files.get(fd_index).copy(f);            	
            }//没有文件夹，先创建一个空文件夹
            else
            {
                f.files = new ArrayList<fd_file>();
                this.folders.put(f.pidRoot, files.size());
                this.files.add(f);
            }
        }
        else
        {
            files.add(f);
        }
    }

    /// <summary>
    /// 查找父级文件夹并添加到其文件列表中
    /// </summary>
    void add_child(ResultSet r, int pidRoot) throws SQLException
    {
        un_file f = new un_file();
        f.read(pidRoot, r);//
        
        //不存在文件夹
        if(!this.folders.containsKey(pidRoot))
        {
            un_file fd = new un_file();
            //fd.idSvr = pidRoot;
            fd.fdID = pidRoot;
            fd.files = new ArrayList<fd_file>();
            fd.files.add(f);

            this.folders.put(pidRoot, this.files.size());
            this.files.add(fd);
        }//存在文件夹
        else
        {
        	int fd_index = this.folders.get(pidRoot);
        	this.files.get(fd_index).files.add(f);
        }
    }

    public String to_json()
    {
        if (this.files.size() > 0)
        {
        	Gson gson = new Gson();
        	return gson.toJson(this.files);                
        }
        return null;
    }

}
