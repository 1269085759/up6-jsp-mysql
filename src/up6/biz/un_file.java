package up6.biz;

import java.sql.ResultSet;
import java.sql.SQLException;

import up6.biz.folder.fd_root;


public class un_file extends fd_root
{
    public void read(int pidRoot,ResultSet  r) throws SQLException
    {
        this.idSvr = r.getInt("f_id");
        this.nameLoc = r.getString("f_nameLoc");
        this.nameSvr = r.getString("f_nameSvr");
        this.pidSvr = r.getInt("f_pid");
        this.fdTask = r.getBoolean("f_fdTask");
        this.fdChild = r.getBoolean("f_fdChild");
        this.fdID = r.getInt("f_fdID");
        this.pathLoc = r.getString("f_pathLoc");
        this.pathSvr = r.getString("f_pathSvr");
        this.lenLoc = r.getLong("f_lenLoc");
        this.sizeLoc = r.getString("f_sizeLoc");
        this.lenSvr = r.getLong("f_lenSvr");
        this.perSvr = r.getString("f_perSvr");
        this.pos = r.getLong("f_pos");
        this.complete = r.getBoolean("f_complete");
        this.md5 = r.getString("f_md5");
    }
    
    public void copy(un_file f)
    {
        this.idFile = f.idSvr;
        this.idSvr = f.idSvr;
        this.nameLoc = f.nameLoc;
        this.nameSvr = f.nameSvr;
        this.pidSvr = f.pidSvr;
        this.fdTask = f.fdTask;
        this.fdChild = f.fdChild;
        this.fdID = f.fdID;
        this.pathLoc = f.pathLoc;
        this.pathSvr = f.pathSvr;
        this.lenLoc = f.lenLoc;
        this.sizeLoc = f.sizeLoc;
        this.lenSvr = f.lenSvr;
        this.perSvr = f.perSvr;
        this.pos = f.pos;
        this.complete = f.complete;
        this.md5 = f.md5;
    }
}
