/*批量添加文件和文件夹*/
DELIMITER $$
CREATE PROCEDURE fd_files_add_batch(
 in fCount int	/*文件总数*/
,in fdCount int)/*文件夹总数*/
begin
	declare ids_f text default '0';/*文件ID列表*/
	declare ids_fd text default '0';/*文件夹ID列表*/
	declare i int;
	set i = 0;
	
	/*批量添加文件夹*/
	while(i<fdCount) do	
		insert into up6_folders(fd_pid) values(0);	
		set ids_fd = concat( ids_fd,",",last_insert_id() );
		set i = i + 1;
	end while;
	set ids_fd = substring(ids_fd,3);/*删除0,*/
	
	/*批量添加文件*/
	set i = 0;
	while(i<fCount) do	
		insert into up6_files(f_pid) values(0);	
		set ids_f = concat( ids_f,",",last_insert_id() );
		set i = i + 1;
	end while;	
	set ids_f = substring(ids_f,3);/*删除0,*/
	
	select ids_f,ids_fd;
end$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/