package up6;
import java.sql.*;

/*
 * 原型
*/
public class DBFolder {

	public DBFolder()
	{
	}

	static public void Remove(String id,int uid)
	{
		DbHelper db = new DbHelper();
		Connection con = db.GetCon();
		
		try {
			con.setAutoCommit(false);
			Statement stmt = con.createStatement();
			stmt.addBatch("update up6_files set f_deleted=1 where f_id='" + id + "' and f_uid=" + uid);
			stmt.addBatch("update up6_files set f_deleted=1 where f_pidRoot='" + id + "' and f_uid=" + uid);
			stmt.addBatch("update up6_folders set fd_delete=1 where fd_id='" + id + "' and fd_uid=" + uid);
			stmt.executeBatch();
			con.commit();
			stmt.close();
			con.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
	}
}