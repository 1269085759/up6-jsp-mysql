drop procedure if exists fd_remove;
DELIMITER $$
/* =============================================
-- Author:		zysoft
-- Create date: 2016-08-04
-- Description:	批量查询相同MD5的文件
-- =============================================
*/
CREATE PROCEDURE fd_remove(
	 in id_file int
	,in id_folder int
	,in uid int
)
BEGIN
	update up6_files set f_deleted=1 where f_id=id_file and f_uid=uid;
	update up6_files set f_deleted=1 where f_pidRoot=id_folder and f_uid=uid;
	update up6_folders set fd_delete=1 where fd_id=id_folder and fd_uid=uid;
END$$
DELIMITER;/*--5.7.9版本MySQL必须加这一句，否则包含多条SQL语句的存储过程无法创建成功*/