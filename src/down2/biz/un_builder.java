package down2.biz;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import down2.model.DnFileInf;

import up6.DbHelper;

import net.sf.json.JSONArray;


public class un_builder 
{
    public List<un_file> files;
    private Map<Integer, Integer/*对应到files的索引*/> folders;

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
        sb.append(",f_nameLoc");//2
        sb.append(",f_pathLoc");//3
        sb.append(",f_perLoc");//4
        sb.append(",f_lenLoc");//5
        sb.append(",f_fileUrl");//6
        sb.append(",f_lenSvr");//7
        sb.append(",f_sizeSvr");//8
        sb.append(",f_pathLoc");//9
        sb.append(",f_pidRoot");//10
        sb.append(",f_fdTask");//11
        //
        sb.append(" from down_files");
        //
        sb.append(" where f_uid=? and f_complete=0");

        DbHelper db = new DbHelper();
        PreparedStatement cmd = db.GetCommand(sb.toString());
        cmd.setInt(1, Integer.parseInt(uid));
        ResultSet r = db.ExecuteDataSet(cmd);

        while (r.next())
        {
            Integer pidRoot = r.getInt(10);

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

        return this.to_json();//
    }

    /// <summary>
    /// 添加一个文件项
    /// </summary>
    void add_file(ResultSet r, int uid) throws SQLException
    {
        un_file f = new un_file();
        f.read(0,  r);

        //是文件夹
        if (f.fdTask)
        {
            
            if (this.folders.containsKey(f.idSvr) )
            {
            	int fd_index = this.folders.get(f.idSvr);
            	DnFileInf item = this.files.get(fd_index);
                item.nameLoc = f.nameLoc;
                item.pathLoc = f.pathLoc;
                item.fileUrl = f.fileUrl;
                item.lenLoc = f.lenLoc;
                item.lenSvr = f.lenSvr;
                item.sizeSvr = f.sizeSvr;
                item.perLoc = f.perLoc;
                item.fdTask = true;
            }
            else
            {
                f.files = new ArrayList<DnFileInf>();
                this.folders.put(f.idSvr, this.files.size());
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
        if (!this.folders.containsKey(pidRoot) )
        {
            un_file fd = new un_file();
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

    String to_json()
    {
        if (this.files.size() > 0)
        {
        	return JSONArray.fromObject(this.files).toString();
        }
        return null;
    }

}
