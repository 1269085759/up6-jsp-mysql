/* =============================================
-- Author:		zysoft
-- Create date: 2016-08-04
-- Description:	批量查询相同MD5的文件
-- =============================================
--drop procedure if exists fd_remove;
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
END