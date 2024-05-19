--***************************************************************************
-- Copyright (c) Microsoft Corporation
--
-- File:
--  oracleadmin.sql
--
-- Purpose:
-- 	PL/SQL script to create a database user with the required permissions
--  	to administer SQL Server publishing for an Oracle database.
-- 	
--	&&ReplLogin        == Replication user login
--	&&ReplPassword     == Replication user password
--	&&DefaultTablespace == Tablespace that will serve as the default tablespace for the replication user.
--                         The replication user will be authorized to allocate UNLIMITED space 
--                         on the default tablespace, which must already exist.
--
-- Notes:
--
--	This script must be run from an Oracle login having the authorization to
--	create a new user and grant unlimited tablespace on any existing tablespace.  The
--	login must also be able to grant to the newly created login the following authorizations:
--
--      create public synonym
--      drop public synonym
--      create sequence
--      create procedure
--      create session
--      create table
--      create view
--
--  Additionally, the following properties are also required for transactional
--  publications.
--
--      create any trigger 
--
--  All of the privileges may be granted through a role, with the exception
--  of create table, create view, and create any trigger.  These must be
--  granted explicitly to the replication user login.  In the script, all grants are
--  granted explicitly to the replication user.
--
--  In addition to these general grants, a table owner must explicitly grant select
--  authorization to the replication user on a table before the table can be published.
--
--***************************************************************************

ACCEPT ReplLogin CHAR PROMPT 'User to create for replication: ';
ACCEPT ReplPassword CHAR PROMPT 'Replication user passsword: ' HIDE;
ACCEPT DefaultTableSpace CHAR DEFAULT 'SYSTEM' PROMPT 'Default tablespace: ';

-- Create the replication user account
CREATE USER &&ReplLogin IDENTIFIED BY &&ReplPassword DEFAULT TABLESPACE &&DefaultTablespace QUOTA UNLIMITED ON &&DefaultTablespace;

-- It is recommended that only the required grants be granted to this user.
--
-- The following 5 privileges are granted explicitly, but could be granted through a role.
GRANT CREATE PUBLIC SYNONYM TO &&ReplLogin;
GRANT DROP PUBLIC SYNONYM TO &&ReplLogin;
GRANT CREATE SEQUENCE TO &&ReplLogin;
GRANT CREATE PROCEDURE TO &&ReplLogin;
GRANT CREATE SESSION TO &&ReplLogin;

-- The following privileges must be granted explicitly to the replication user.
GRANT CREATE TABLE TO &&ReplLogin;
GRANT CREATE VIEW TO &&ReplLogin;

-- The replication user login needs to be able to create a tracking trigger on any table that is
-- to be published in a transactional publication. The CREATE ANY privilege is used to
-- obtain the authorization to create these triggers.  To replicate a table, the table 
-- owner must additionally explicitly grant select authorization on the table to the
-- replication user.
--
-- NOTE: CREATE ANY TRIGGER is not required for snapshot publications.
GRANT CREATE ANY TRIGGER TO &&ReplLogin;

EXIT
