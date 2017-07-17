package up6.biz.folder;

import java.util.List;

import up6.model.FileInf;

public class fd_root extends FileInf{
    public List<FileInf> folders;
    public List<FileInf> files;
    
    public fd_root()
    {
    	this.fdTask = true;
    	this.fdChild = false;
    }
}
