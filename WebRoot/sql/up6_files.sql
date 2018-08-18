CREATE TABLE IF NOT EXISTS `up6_files` (
  `f_id` 				char(32) NOT NULL,
  `f_pid` 				char(32) default '',		/*父级文件夹ID*/
  `f_pidRoot` 			char(32) default '',		/*根级文件夹ID*/
  `f_fdTask` 			tinyint(1) default '0',		/*是否是一条文件夹信息*/
  `f_fdChild` 			tinyint(1) default '0',		/*是否是文件夹中的文件*/
  `f_uid` 				int(11) default '0',
  `f_nameLoc` 			varchar(255) default '',	/*文件在本地的名称（原始文件名称）*/
  `f_nameSvr` 			varchar(255) default '',	/*文件在服务器的名称*/
  `f_pathLoc` 			varchar(255) default '',	/*文件在本地的路径*/
  `f_pathSvr` 			varchar(255) default '',	/*文件在远程服务器中的位置*/
  `f_pathRel` 			varchar(255) default '',
  `f_md5` 				varchar(40) default '',		/*文件MD5*/
  `f_lenLoc` 			bigint(19) default '0',		/*文件大小*/
  `f_sizeLoc` 			varchar(10) default '0',	/*文件大小（格式化的）*/
  `f_pos` 				bigint(19) default '0',		/*续传位置*/
  `f_lenSvr` 			bigint(19) default '0',		/*已上传大小*/
  `f_perSvr` 			varchar(7) default '0%',	/*已上传百分比*/
  `f_complete` 			tinyint(1) default '0',		/*是否已上传完毕*/
  `f_time` 				timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `f_deleted` 			tinyint(1) default '0',
  `f_scan` 				tinyint(1) default '0',
  PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;