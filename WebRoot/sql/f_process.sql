/*更新文件进度*/
create procedure f_process(
in posSvr bigint(19)
,in lenSvr bigint(19)
,in perSvr varchar(6)
,in uidSvr int
,in fidSvr int
,in complete tinyint(1))
update up6_files set f_pos=posSvr,f_lenSvr=lenSvr,f_perSvr=perSvr,f_complete=complete 
where f_uid=uidSvr and f_id=fidSvr;