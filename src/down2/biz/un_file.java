package down2.biz;

import java.sql.ResultSet;
import java.sql.SQLException;

import down2.model.DnFileInf;


public class un_file extends DnFileInf
{
    public void read(int pidRoot, ResultSet r) throws SQLException
    {
        this.idSvr = r.getInt("f_id");//
        this.nameLoc = r.getString("f_nameLoc");
        this.pathLoc = r.getString("f_pathLoc");//
        this.lenLoc = r.getLong("f_lenLoc");
        this.perLoc = r.getString("f_perLoc");
        this.lenSvr = r.getLong("f_lenSvr");
        this.sizeSvr = r.getString("f_sizeSvr");
        this.fileUrl = r.getString("f_fileUrl");
        this.pidRoot = r.getInt("f_pidRoot");
        this.fdTask = r.getBoolean("f_fdTask");
        if (this.fdTask) this.pathLoc = r.getString("f_pathLoc");
    }

}
