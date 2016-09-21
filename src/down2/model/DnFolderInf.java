package down2.model;

import java.util.ArrayList;

public class DnFolderInf extends DnFileInf
{
	public DnFolderInf()
	{
		this.fdTask = true;
		this.files = new ArrayList<DnFileInf>();
	}
}
