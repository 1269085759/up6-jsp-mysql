drop procedure if exists fd_files_check;
DELIMITER $$
/* =============================================
-- Author:		zysoft
-- Create date: 2016-08-04
-- Description:	批量查询相同MD5的文件
-- =============================================
*/
CREATE PROCEDURE fd_files_check(
	in md5s mediumtext	/*md5列表:a,b,c,d。如果长度不够可以换更大的数据类型：longtext*/
   ,in md5_len int /*单个MD5长度*/
   ,in md5s_len	int /*md5字符串总长度*/
)
BEGIN
	/*拆分md5*/
	declare md5_item varchar(40);
	declare md5_cur int;
	declare split_pos int;/*当前分割符位置*/
	create temporary table if not exists t_md5 /*不存在则创建临时表  */
         (  
           md5 varchar(40) primary key
         )engine=memory;
    truncate TABLE t_md5;  /*使用前先清空临时表*/
	
	set md5_cur = 0;
	set split_pos = position("," in md5s);

	/*有多个md5*/
	if md5s_len > md5_len then	
		while md5_cur < md5s_len do
			set md5_item = substring(md5s,md5_cur+1,md5_len);
			insert into t_md5(md5) values(md5_item);
			set md5_cur = md5_cur + md5_len + 1;
		end while;	
	else/*只有一个md5*/
		insert into t_md5(md5) values(md5s);
	end if;

	/*查询数据库*/
	select *
	from (select * from up6_files where f_id in (select max(f_id) from up6_files group by f_md5))fs
	inner join t_md5 t
	on t.md5 = fs.f_md5 ;
END$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/