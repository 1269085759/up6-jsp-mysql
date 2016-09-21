-- phpMyAdmin SQL Dump
-- version 2.11.2.1
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2015 年 01 月 30 日 02:16
-- 服务器版本: 5.0.45
-- PHP 版本: 5.2.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- 数据库: `httpuploader6`
--

-- --------------------------------------------------------

--
-- 表的结构 `up6_files`
--

CREATE TABLE `up6_files` (
  `f_id` int(11) NOT NULL auto_increment,
  `f_pid` int(11) default '0',
  `f_pidRoot` int(11) default '0',
  `f_fdTask` tinyint(1) default '0',
  `f_fdID` int(11) default '0',
  `f_fdChild` tinyint(1) default '0',
  `f_uid` int(11) default '0',
  `f_nameLoc` varchar(255) default '',
  `f_nameSvr` varchar(255) default '',
  `f_pathLoc` varchar(255) default '',
  `f_pathSvr` varchar(255) default '',
  `f_pathRel` varchar(255) default '',
  `f_md5` varchar(40) default '',
  `f_lenLoc` bigint(19) default '0',
  `f_sizeLoc` varchar(10) default '0',
  `f_pos` bigint(19) default '0',
  `f_lenSvr` bigint(19) default '0',
  `f_perSvr` varchar(6) default '0%',
  `f_complete` tinyint(1) default '0',
  `f_time` timestamp NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  `f_deleted` tinyint(1) default '0',
  PRIMARY KEY  (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- 删除已经存在的存储过程
drop procedure if exists f_process;
-- 创建存储过程
create procedure f_process(
in posSvr bigint(19)
,in lenSvr bigint(19)
,in perSvr varchar(6)
,in uidSvr int
,in fidSvr int
,in complete tinyint(1))
update up6_files set f_pos=posSvr,f_lenSvr=lenSvr,f_perSvr=perSvr,f_complete=complete 
where f_uid=uidSvr and f_id=fidSvr;

--更新文件夹进度
drop procedure if exists fd_process;
create procedure fd_process(
in uidSvr int
,in fd_idSvr int
,in fd_lenSvr bigint(19)
,in perSvr varchar(6)
)
update up6_files set f_lenSvr=fd_lenSvr,f_perSvr=perSvr where f_uid=uidSvr and f_id=fd_idSvr;