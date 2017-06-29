/*更新文件夹进度*/
create procedure fd_process(
in uidSvr int
,in fd_idSvr int
,in fd_lenSvr bigint(19)
,in perSvr varchar(6)
)
update up6_files set f_lenSvr=fd_lenSvr,f_perSvr=perSvr where f_uid=uidSvr and f_id=fd_idSvr;