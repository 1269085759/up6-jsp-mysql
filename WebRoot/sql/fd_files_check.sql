drop procedure if exists fd_files_check;
DELIMITER $$
/* =============================================
-- Author:		zysoft
-- Create date: 2016-08-04
-- Description:	批量查询相同MD5的文件
-- =============================================
*/
CREATE PROCEDURE fd_files_check(
	in md5s varchar(8000)	/*md5列表:a,b,c,d*/
)
BEGIN
	/*拆分md5*/
	declare md5_len int;/*单个md5长度，固定值*/
	declare md5_item varchar(40);
	declare md5_len_total int; /*md5总长度*/
	declare md5_cur int;
	declare split_pos int;/*当前分割符位置*/
	create temporary table if not exists t_md5 /*不存在则创建临时表  */
         (  
           md5 varchar(40) primary key
         )engine=memory;
    truncate TABLE t_md5;  /*使用前先清空临时表*/
	
	set md5_cur = 0;
	set split_pos = position("," in md5s);
	set md5_len_total = length(md5s);
	set md5_len = split_pos;
	if md5_len = 0 then
		set md5_len = md5_len_total;
	end if;

	/*有多个md5*/
	if md5_len_total > md5_len then	
		while md5_cur < md5_len_total do
			set md5_item = substring(md5s,md5_cur+1,md5_len-1);
			insert into t_md5(md5) values(md5_item);
			set md5_cur = md5_cur + md5_len;
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