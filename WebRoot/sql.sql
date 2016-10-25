DROP TABLE IF EXISTS up6_files;
DROP TABLE IF EXISTS up6_folders;
DROP TABLE IF EXISTS down_files;
DROP TABLE IF EXISTS down_folders;
DROP PROCEDURE IF EXISTS f_process;
DROP PROCEDURE IF EXISTS fd_process;
DROP PROCEDURE IF EXISTS fd_files_add_batch;
DROP PROCEDURE IF EXISTS fd_files_check;
DROP PROCEDURE IF EXISTS fd_update;
DROP PROCEDURE IF EXISTS fd_remove;
DROP PROCEDURE IF EXISTS f_update;
DROP PROCEDURE IF EXISTS fd_add_batch;

CREATE TABLE IF NOT EXISTS `up6_files` (
  `f_id` 				int(11) NOT NULL auto_increment,
  `f_pid` 				int(11) default '0',		
  `f_pidRoot` 			int(11) default '0',		
  `f_fdTask` 			tinyint(1) default '0',		
  `f_fdID` 				int(11) default '0',		
  `f_fdChild` 			tinyint(1) default '0',		
  `f_uid` 				int(11) default '0',
  `f_nameLoc` 			varchar(255) default '',	
  `f_nameSvr` 			varchar(255) default '',	
  `f_pathLoc` 			text,	
  `f_pathSvr` 			text,	
  `f_pathRel` 			text,
  `f_md5` 				varchar(40) default '',	
  `f_lenLoc` 			bigint(19) default '0',		
  `f_sizeLoc` 			varchar(10) default '0',	
  `f_pos` 				bigint(19) default '0',		
  `f_lenSvr` 			bigint(19) default '0',		
  `f_perSvr` 			varchar(7) default '0%',	
  `f_complete` 			tinyint(1) default '0',		
  `f_time` 				timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `f_deleted` 			tinyint(1) default '0',
  PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*--更新文件进度*/
CREATE PROCEDURE f_process(
in `posSvr` bigint(19),
in `lenSvr` bigint(19),
in `perSvr` varchar(6),
in `uidSvr` int,
in `fidSvr` int,
in `complete` tinyint)
update up6_files set f_pos=posSvr,f_lenSvr=lenSvr,f_perSvr=perSvr,f_complete=complete where f_uid=uidSvr and f_id=fidSvr;

/*更新文件夹进度*/
CREATE PROCEDURE fd_process(
in uidSvr int,
in fd_idSvr int,
in fd_lenSvr bigint(19),
in perSvr varchar(6))
update up6_files set f_lenSvr=fd_lenSvr ,f_perSvr=perSvr  where f_uid=uidSvr and f_id=fd_idSvr;

/*文件夹表*/
CREATE TABLE IF NOT EXISTS up6_folders (
  `fd_id` 				int(11) NOT NULL auto_increment,
  `fd_name` 			varchar(50) default '',
  `fd_pid` 				int(11) default '0',
  `fd_uid` 				int(11) default '0',
  `fd_length` 			bigint(19) default '0',
  `fd_size` 			varchar(50) default '0',
  `fd_pathLoc` 			text,
  `fd_pathSvr` 			text,
  `fd_folders` 			int(11) default '0',
  `fd_files` 			int(11) default '0',
  `fd_filesComplete` 	int(11) default '0',
  `fd_complete` 		tinyint(1) default '0',
  `fd_delete` 			tinyint(1) default '0',
  `fd_json` 			varchar(20000) default '',
  `timeUpload` 			timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `fd_pidRoot` 			int(11) default '0',
  `fd_pathRel` 			text,
  PRIMARY KEY  (`fd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*下载数据表*/
CREATE TABLE down_files
(
 f_id      		int(11) NOT NULL auto_increment    
,f_uid        	int(11) 	DEFAULT '0' 
,f_mac        	varchar(50) DEFAULT  '' 
,f_nameLoc		varchar(255)DEFAULT ''
,f_pathLoc      text 	
,f_fileUrl      varchar(255)DEFAULT '' 	
,f_perLoc    	varchar(6) 	DEFAULT '0' 
,f_lenLoc    	bigint(19) 	DEFAULT '0' 
,f_lenSvr		bigint(19) DEFAULT '0'
,f_sizeSvr      varchar(10) DEFAULT '0' 
,f_complete		tinyint(1)	DEFAULT '0'	
,f_pidRoot		int(11) 	DEFAULT '0'	
,f_fdTask		tinyint(1) 	DEFAULT '0'	
,PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*下载文件夹表*/
CREATE TABLE down_folders
(
   fd_id		int(11) 		NOT NULL auto_increment  		 /*--文件夹ID，自动编号*/
  ,fd_name  	varchar(50) 	DEFAULT ''   /*--文件夹名称。test*/
  ,fd_uid  		int(11) 		DEFAULT '0'  /*--用户ID */
  ,fd_mac  		varchar(50) 	DEFAULT ''   /*--用户电脑识别码*/
  ,fd_pathLoc	text						 /*--文件夹信息文件在本地路径。D:\\Soft\\test.cfg*/
  ,fd_complete  tinyint(1) 		DEFAULT '0'  /*--是否已经下载*/
  ,fd_id_old	varchar(512) 	DEFAULT ''   /*--对应表字段：xdb_folders.fd_id，用来获取文件夹JSON信息*/
  ,fd_percent	varchar(7) 		DEFAULT ''   /*--上传百分比。*/
  ,PRIMARY KEY  (`fd_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*文件夹初始化*/
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
end$$
DELIMITER ;

/*批量查询MD5*/
DELIMITER $$
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
end$$
DELIMITER ;
	
/*文件夹更新*/
DELIMITER $$
CREATE PROCEDURE fd_update(
 in _name			varchar(50)
,in _pid			int
,in _uid			int
,in _length			bigint
,in _size			varchar(50)
,in _pathLoc		text
,in _pathSvr		text
,in _folders		int
,in _files			int
,in _filesComplete	int
,in _complete		tinyint
,in _delete			tinyint
,in _pidRoot		int
,in _pathRel		text
,in _id				int
)
begin
	update up6_folders set
	 fd_name			= _name
	,fd_pid				= _pid
	,fd_uid				= _uid
	,fd_length			= _length
	,fd_size			= _size
	,fd_pathLoc			= _pathLoc
	,fd_pathSvr			= _pathSvr
	,fd_folders			= _folders
	,fd_files			= _files
	,fd_filesComplete	= _filesComplete
	,fd_complete		= _complete
	,fd_delete			= _delete
	,fd_pidRoot			= _pidRoot
	,fd_pathRel			= _pathRel
	where 
	fd_id = _id;
end$$
DELIMITER ;
	
/*文件夹删除*/
DELIMITER $$
CREATE PROCEDURE fd_remove(
	 in id_file int
	,in id_folder int
	,in uid int
)
BEGIN
	update up6_files set f_deleted=1 where f_id=id_file and f_uid=uid;
	update up6_files set f_deleted=1 where f_pidRoot=id_folder and f_uid=uid;
	update up6_folders set fd_delete=1 where fd_id=id_folder and fd_uid=uid;
end$$
DELIMITER ;

/*文件更新*/
DELIMITER $$
CREATE PROCEDURE f_update(
 in _pid		int
,in _pidRoot	int
,in _fdTask		tinyint
,in _fdID		int
,in _fdChild	tinyint
,in _uid		int
,in _nameLoc	varchar(255)
,in _nameSvr	varchar(255)
,in _pathLoc	text
,in _pathSvr	text
,in _md5		varchar(40)
,in _lenLoc		bigint
,in _lenSvr		bigint
,in _perSvr		varchar(7)
,in _sizeLoc	varchar(10)
,in _complete	tinyint
,in _id			int
)
begin
	update up6_files set
	 f_pid		= _pid
	,f_pidRoot	= _pidRoot
	,f_fdTask	= _fdTask
	,f_fdID		= _fdID
	,f_fdChild	= _fdChild
	,f_uid		= _uid
	,f_nameLoc	= _nameLoc
	,f_nameSvr	= _nameSvr
	,f_pathLoc	= _pathLoc
	,f_pathSvr	= _pathSvr
	,f_md5		= _md5
	,f_lenLoc	= _lenLoc
	,f_lenSvr	= _lenSvr
	,f_perSvr	= _perSvr
	,f_sizeLoc	= _sizeLoc
	,f_complete	= _complete
	where f_id = _id;
end$$
DELIMITER ;

/*下载文件夹初始化*/
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
DELIMITER ;

select f_id from up6_files limit 0,1;