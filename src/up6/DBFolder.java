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
		StringBuilder sb = new StringBuilder();
		sb.append("begin ");
		sb.append("update up6_files set f_deleted=1 where f_id=? and f_uid=?;");
		sb.append("update up6_files set f_deleted=1 where f_pidRoot=? and f_uid=?;");
		sb.append("update up6_folders set fd_delete=1 where fd_id=? and fd_uid=?;");
		sb.append(" end;");		
		DbHelper db = new DbHelper();
		PreparedStatement cmd = db.GetCommand(sb.toString());
		try 
		{
			cmd.setString(1, id);
			cmd.setInt(2, uid);
			cmd.setString(3, id);
			cmd.setInt(4, uid);
			cmd.setString(5, id);
			cmd.setInt(6, uid);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		db.ExecuteNonQuery(cmd);
	}
}