/*批量添加文件和文件夹*/
DELIMITER $$
CREATE PROCEDURE fd_files_add_batch(
	in f_count int	/*文件总数，要单独增加一个文件夹*/
   ,in fd_count int	/*文件夹总数*/
)
BEGIN
	declare i int;
	/*使用临时表存ID*/
	create temporary table if not exists tb_ids 
         (  
           t_file tinyint(1),
           t_id int
         )engine=memory;
    truncate TABLE tb_ids;
	
	set i = 0;
	
	/*批量添加文件夹*/
	while(i<fd_count) do	
		insert into up6_folders(fd_pid) values(0);
		insert into tb_ids values(0,last_insert_id());	
		set i = i + 1;
	end while;
	
	/*批量添加文件*/
	set i = 0;
	while(i<f_count) do	
		insert into up6_files(f_pid) values(0);
		insert into tb_ids values(1,last_insert_id());	
		set i = i + 1;
	end while;
	
	select * from tb_ids;
END$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/
