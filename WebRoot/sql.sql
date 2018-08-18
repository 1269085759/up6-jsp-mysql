DROP TABLE IF EXISTS up6_files;
DROP TABLE IF EXISTS up6_folders;
DROP TABLE IF EXISTS down_files;
DROP PROCEDURE IF EXISTS fd_files_check;

CREATE TABLE IF NOT EXISTS `up6_files` (
  `f_id` 				char(32) NOT NULL,
  `f_pid` 				char(32) default '',
  `f_pidRoot` 			char(32) default '',
  `f_fdTask` 			tinyint(1) default '0',
  `f_fdChild` 			tinyint(1) default '0',
  `f_uid` 				int(11) default '0',
  `f_nameLoc` 			varchar(255) default '',
  `f_nameSvr` 			varchar(255) default '',
  `f_pathLoc` 			varchar(255) default '',
  `f_pathSvr` 			varchar(255) default '',
  `f_pathRel` 			varchar(255) default '',
  `f_md5` 				varchar(40) default '',
  `f_lenLoc` 			bigint(19) default '0',
  `f_sizeLoc` 			varchar(10) default '0',
  `f_pos` 				bigint(19) default '0',
  `f_lenSvr` 			bigint(19) default '0',
  `f_perSvr` 			varchar(7) default '0%',
  `f_complete` 			tinyint(1) default '0',
  `f_time` 				timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `f_deleted` 			tinyint(1) default '0',
  `f_scan` 				tinyint(1) default '0',
  PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `up6_folders` (
  `fd_id` 				char(32) NOT NULL ,
  `fd_name` 			varchar(50) default '',
  `fd_pid` 				char(32) default '',
  `fd_uid` 				int(11) default '0',
  `fd_length` 			bigint(19) default '0',
  `fd_size` 			varchar(50) default '0',
  `fd_pathLoc` 			varchar(255) default '',
  `fd_pathSvr` 			varchar(255) default '',
  `fd_pathRel` 			varchar(255) default '',
  `fd_folders` 			int(11) default '0',
  `fd_files` 			int(11) default '0',
  `fd_filesComplete` 	int(11) default '0',
  `fd_complete` 		tinyint(1) default '0',
  `fd_delete` 			tinyint(1) default '0',
  `fd_json` 			varchar(20000) default '',
  `timeUpload` 			timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `fd_pidRoot` 			char(32) default '',
  PRIMARY KEY  (`fd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE down_files
(
 f_id      		char(32) NOT NULL     
,f_uid        	int(11) 	DEFAULT '0' 
,f_mac        	varchar(50) DEFAULT  '' 
,f_nameLoc		varchar(255)DEFAULT ''
,f_pathLoc      varchar(255)DEFAULT '' 	
,f_fileUrl      varchar(255)DEFAULT '' 	
,f_perLoc    	varchar(6) 	DEFAULT '0' 
,f_lenLoc    	bigint(19) 	DEFAULT '0' 
,f_lenSvr		bigint(19)  DEFAULT '0'
,f_sizeSvr      varchar(10) DEFAULT '0' 
,f_complete		tinyint(1)	DEFAULT '0'	
,f_fdTask		tinyint(1) 	DEFAULT '0'	
,PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*批量查询MD5*/
CREATE PROCEDURE fd_files_check(
	in md5s longtext	/*md5列表:a,b,c,d。*/
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
end