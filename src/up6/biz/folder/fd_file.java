package up6.biz.folder;

public class fd_file 
{
    public int idLoc = 0;
    public int idSvr = 0;//与up6_files.f_id对应
    public String nameLoc = "";
    public String nameSvr = "";
    public String pathLoc = "";
    public String pathSvr = "";
    public String pathRel = "";
    public String md5 = "";
    public int pidLoc = 0;
    public int pidSvr = 0;
    public int pidRoot = 0;//
    public int fdID = 0;//与up6_folders.fd_id对应，提供给文件夹使用。
    public Boolean fdChild=false;//是否是一个子文件
    public long lenLoc = 0;
    public String sizeLoc = "0";//sizeLoc
    public long pos;//上传位置
    public long lenSvr = 0;
    public String perSvr = "0%";
    public int uid = 0;
    public int filesCount = 0;
    public int foldersCount = 0;
    public Boolean complete = false;
    public Boolean fdTask = false;

}
