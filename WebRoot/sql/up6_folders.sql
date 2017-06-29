CREATE TABLE up6_folders (
   fd_id 			int(11) NOT NULL auto_increment
  ,fd_name 			varchar(50) default ''
  ,fd_pid 			int(11) default '0'
  ,fd_uid 			int(11) default '0'
  ,fd_length 		bigint(19) default '0'
  ,fd_size 			varchar(50) default '0'
  ,fd_pathLoc 		varchar(255) default ''
  ,fd_pathSvr 		varchar(255) default ''
  ,fd_folders 		int(11) default '0'
  ,fd_files 		int(11) default '0'
  ,fd_filesComplete int(11) default '0'
  ,fd_complete 		tinyint(1) default '0'
  ,fd_delete 		tinyint(1) default '0'
  ,fd_json 			varchar(20000) default ''
  ,timeUpload 		timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
  ,fd_pidRoot		int(11) default '0'
  ,fd_pathRel		varchar(255) default ''
  ,PRIMARY KEY  (fd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;