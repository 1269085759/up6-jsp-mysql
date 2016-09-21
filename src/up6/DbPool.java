package up6;

import java.sql.Connection;
import java.sql.SQLException;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

/*
 * MySQL连接池
 * 参考：http://www.cnblogs.com/xproer/p/5412640.html
 * 说明：
 * 	在Tomcat中需要配置下面的文件
 * 		conf/context.xml
 * 		conf/server.xml
 * 使用方法：
 * Connection con = DbPool.getCon()
 * ........
 * .......
 * con.close();
 * */
public class DbPool 
{
	public DbPool(){}
	
	static String m_poolName = "MySqlDBPool";//数据库连接池名称
	private static DataSource pool;
	static
	{
		Context env = null;
		try
		{
			env = (Context) new InitialContext().lookup("java:comp/env");
			pool = (DataSource)env.lookup(m_poolName);
			if(pool == null)
			System.err.println("'DBPool' is an unknown DataSource");
		}
		catch(NamingException ne)
		{
			ne.printStackTrace();
		}
	}

	public static Connection getCon() throws SQLException
	{
		return pool.getConnection();
	}
}