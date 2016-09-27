/*批量添加文件和文件夹*/
DELIMITER $$
CREATE PROCEDURE fd_add_batch(
	in f_count int	/*文件总数，要单独增加一个文件夹*/
   ,in uid int
)
BEGIN
	declare i int;
	/*使用临时表存ID*/
	create temporary table if not exists tb_ids 
         (  
           t_id int primary key
         )engine=memory;
    truncate TABLE tb_ids;
	
	set i = 0;
	
	while(i<f_count) do	
		insert into down_files(f_uid) values(uid);
		insert into tb_ids(t_id) values(last_insert_id());	
		set i = i + 1;
	end while;
	
	select * from tb_ids;
END$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/