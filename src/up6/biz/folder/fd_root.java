package up6.biz.folder;

import java.util.List;

public class fd_root extends fd_child{
    public List<fd_child> folders;
    public List<fd_file> files;
    public int idFile = 0;//文件夹id与up6_files.f_id对应。
}
