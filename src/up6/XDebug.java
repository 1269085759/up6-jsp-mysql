package up6;
/**
 * 
 */

/**
 * 输出调试信息。
 * 更新记录：
 * 	2012-05-22 创建
 *
 */
public class XDebug {

	public static void Output(String name, int v)
	{
		System.out.print(name);
		System.out.print(":");
		System.out.print(v);
		System.out.print("\n");
	} 

	public static void Output(String name,long v)
	{
		System.out.print(name);
		System.out.print(":");
		System.out.print(v);
		System.out.print("\n");
	}

	public static void Output(String name,float v)
	{
		System.out.print(name);
		System.out.print(":");
		System.out.print(v);
		System.out.print("\n");
	}

	public static void Output(String name,double v)
	{
		System.out.print(name);
		System.out.print(":");
		System.out.print(v);
		System.out.print("\n");
	}

	public static void Output(String name, String v)
	{
		System.out.print(name);
		System.out.print(":");
		System.out.print(v);
		System.out.print("\n");
	}

	public static void Output(String v)
	{
		System.out.println(v);		
	}
}
