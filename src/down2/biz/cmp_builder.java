package down2.biz;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import up6.DbHelper;

import com.google.gson.Gson;

import down2.model.DnFileInf;


public class cmp_builder {
	public List<cmp_file> files;
    public Map<Integer/*pidRoot*/,Integer/*files index*/> folders;
	
	public cmp_builder()
	{
    	this.folders = new HashMap<Integer,Integer>();
    	this.files = new ArrayList<cmp_file>();
	}
	
	public String read(Integer uid) throws SQLException
	{
        StringBuilder sb = new StringBuilder();
        sb.append("select ");
        sb.append(" up6_files.f_id");//1
        sb.append(",up6_files.f_pid");//2
        sb.append(",up6_files.f_fdTask");//3
        sb.append(",up6_files.f_fdID");//4
        sb.append(",up6_files.f_fdChild");//5
        sb.append(",up6_files.f_pidRoot");//6
        sb.append(",up6_files.f_nameLoc");//7
        sb.append(",up6_files.f_sizeLoc");//8
        sb.append(",up6_files.f_pathLoc");//9
        sb.append(",up6_files.f_lenSvr");//10
        sb.append(" from up6_files ");
        //
        sb.append(" where up6_files.f_uid=? and up6_files.f_deleted=0 and up6_files.f_complete=1");

        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        cmd.setInt(1, uid);
    	ResultSet r = db.ExecuteDataSet(cmd);

        while (r.next())
        {
            int pidRoot = r.getInt(6);

            //是一个子文件
            if (pidRoot != 0)
            {
                this.add_child(r, pidRoot);
            }//是一个文件项
            else
            {
                this.add_file(r, uid);
            }
        }
        r.close();

        return this.to_json();//
	}
	


    /// <summary>
    /// 添加一个文件项
    /// </summary>
    public void add_file(ResultSet r, int uid) throws SQLException
    {
        cmp_file f = new cmp_file();
        f.read(0, r);

        if (f.fdTask)
        {
            int fd_index = 0;
            //文件夹已存在
            if ( this.folders.containsKey(f.fdID) )
            {
            	fd_index = this.folders.get(f.fdID);
            	cmp_file fd = this.files.get(fd_index);
            	
                fd.nameLoc = f.nameLoc;
                fd.pathLoc = f.pathLoc;
                fd.fileUrl = f.fileUrl;
                fd.lenLoc = f.lenLoc;
                fd.lenSvr = f.lenSvr;
                fd.sizeSvr = f.sizeSvr;
                fd.perLoc = f.perLoc;
                fd.fdTask = true;
                fd.fdID = f.fdID;
            }//文件夹不存在
            else
            {
                f.files = new ArrayList<DnFileInf>();
                this.folders.put(f.fdID, this.files.size());
                this.files.add(f);
            }
        }//根级文件
        else
        {
            this.files.add(f);
        }
    }

    /// <summary>
    /// 查找父级文件夹并添加到其文件列表中
    /// </summary>
    public void add_child(ResultSet r, int pidRoot) throws SQLException
    {
        cmp_file f = new cmp_file();
        f.read(pidRoot, r);//
        
        //不存在文件夹
        if (!this.folders.containsKey(pidRoot) )
        {
            cmp_file fd = new cmp_file();
            fd.idSvr = pidRoot;
            fd.files = new ArrayList<DnFileInf>();
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
        	Gson g = new Gson();
        	return g.toJson(this.files);

        	//return JSONArray.fromObject(this.files).toString();
        }
        return null;
    }
}
