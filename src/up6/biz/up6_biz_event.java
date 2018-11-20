package up6.biz;

import up6.biz.folder.fd_root;
import up6.model.FileInf;

public class up6_biz_event 
{
	public static void file_create_same(FileInf f){}
	public static void file_create(FileInf f) { }
    public static void file_post_complete(String id) { }
    public static void file_post_block(String id,int blockIndex) { }
    public static void file_post_process(String id) { }
    public static void folder_create(fd_root fd) { }
    public static void folder_post_complete(String id) { }
    //文件和文件夹都触发
    public static void file_del(String id,int uid) { }
}
