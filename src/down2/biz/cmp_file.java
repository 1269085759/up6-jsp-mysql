package down2.biz;

import java.sql.ResultSet;
import java.sql.SQLException;

import down2.model.DnFileInf;


public class cmp_file extends DnFileInf
{
	public cmp_file(){}
	public void read(int pidRoot,ResultSet r) throws SQLException
	{
        this.idSvr = r.getInt(1);//与up6_files.f_id对应，f_down.aspx用到
        this.nameLoc = r.getString("f_nameLoc");
        this.pathLoc = r.getString("f_pathLoc");//
        this.lenSvr = r.getLong("f_lenSvr");
        this.sizeSvr = r.getString("f_sizeLoc");
        this.pidRoot = pidRoot;
        this.fdTask = r.getBoolean("f_fdTask");
        this.fdID = r.getInt("f_fdID");
        if (this.fdTask) this.pathLoc = r.getString("f_pathLoc");
	}
}
