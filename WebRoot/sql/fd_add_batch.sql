/*批量添加文件和文件夹*/
DELIMITER $$
CREATE PROCEDURE fd_add_batch(
 in fCount int	/*文件总数*/
,in uid int		/*用户ID*/
)
begin
	declare f_ids text default '0';/*文件ID列表*/
	declare i int;
	set i = 0;
	set fCount = fCount + 1;
	
	/*批量添加文件*/
	while(i<fCount) do	
		insert into down_files(f_uid) values(uid);	
		set f_ids = concat( f_ids,",",last_insert_id() );
		set i = i + 1;
	end while;
	set f_ids = substring(f_ids,3);/*删除0,*/
	
	select f_ids;
end$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/