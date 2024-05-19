--***************************************************************************
-- Copyright (c) Microsoft Corporation.
--
-- @File: instorcl.sql
--
-- Purpose:
-- 	Oracle install script to load heterogeneous replication package
-- 	
-- Notes:
--
-- @EndHeader@
--
--***************************************************************************

-- Create sequence for generating statement IDs
DROP SEQUENCE HREPL_STMT
/
CREATE SEQUENCE HREPL_STMT CACHE 10000 ORDER
/
-- Create sequence for generating change command IDs
DROP SEQUENCE HREPL_SEQ
/
CREATE SEQUENCE HREPL_SEQ CACHE 10000 ORDER
/
-- Create sequence for generating poll IDs
DROP SEQUENCE HREPL_POLLID
/
CREATE SEQUENCE HREPL_POLLID CACHE 10000 ORDER
/
-- Create Event Table used for synchronizing snapshots and row count requests
DROP TABLE HREPL_Event
/
CREATE TABLE HREPL_Event(
	Event_PollID			NUMBER,
	Event_Publication_ID	NUMBER,
	Event_Article_ID		NUMBER,
	Event_Table_ID			NUMBER,
	Event_Operation			NUMBER,
	Event_SEQ				NUMBER,
	Event_RowCnt			NUMBER,
	Event_CmdType			NUMBER,
	Event_EntryTime			NUMBER,
	Event_Directory			VARCHAR2(512),
	Event_ScriptSch			VARCHAR2(512),
	Event_ScriptIdx			VARCHAR2(512),	
	Event_Command			VARCHAR2(1000),
	Event_PreScript			VARCHAR2(512),
	Event_PostScript		VARCHAR2(512),
	Event_CreationScriptPath	VARCHAR2(256),
	Event_FtpAddress		VARCHAR2(512),
	Event_FtpPort			VARCHAR2(42),
	Event_FtpSubdirectory	VARCHAR2(1020),
	Event_FtpLogin			VARCHAR2(512),	
	Event_FtpPassword		VARCHAR2(2096),
	Event_AlternateSnapshotFolder	VARCHAR2(256),
	Event_CompressSnapshot		VARCHAR2(256)
) LOGGING 
/
-- Create Poll Table
DROP TABLE HREPL_Poll
/
CREATE TABLE HREPL_Poll(
	Poll_ROWID			ROWID PRIMARY KEY NOT NULL,
	Poll_PollID			NUMBER,
	Poll_UpdateFlag			NUMBER,
	Poll_RowCnt			NUMBER,
	Poll_TableID			NUMBER
) LOGGING 
/
CREATE UNIQUE INDEX Poll_ROWIDTableIDPollid_Indx ON HREPL_Poll(Poll_ROWID, Poll_TableID, Poll_Pollid)  
/
CREATE INDEX Poll_Pollid_Indx ON HREPL_Poll(Poll_Pollid)  
/
-- Create Published Tables Table
DROP TABLE HREPL_PublishedTables
/
CREATE TABLE HREPL_PublishedTables(
	Published_Owner  				VARCHAR2(256) NOT NULL,
	Published_Table  				VARCHAR2(256) NOT NULL,
	Published_TableID				NUMBER NOT NULL,
	Published_ArticleID				NUMBER NOT NULL,
	Published_LogInstance			NUMBER NOT NULL,
	Published_ArticleInstance		NUMBER NOT NULL,
	Published_LogDropPending		NUMBER NOT NULL,
	Published_ArticleDropPending	NUMBER NOT NULL
) LOGGING 
/
-- Create Publisher Table
DROP TABLE HREPL_Publisher
/
CREATE TABLE HREPL_Publisher (
	Publisher_GUID        	VARCHAR2(38) NOT NULL,
	Publisher_Name  		VARCHAR2(128) NULL,
	Publisher_ID			NUMBER NOT NULL,
	Publisher_PollInProcess	NUMBER,
	Publisher_CurrentPollid	NUMBER,
	Publisher_LSN			RAW(10),
	Publisher_HasChanges	NUMBER,
	Publisher_SyncInits		NUMBER,
	Publisher_SyncDones		NUMBER,
	Publisher_RowCntValidations	NUMBER,
	Publisher_TableChanges		NUMBER,
	Publisher_InReconciliation	NUMBER,
	Publisher_TracerTokens		NUMBER,
	Publisher_XactSetEnabled	NUMBER,
	Publisher_XactSetBeginTime	NUMBER,
	Publisher_XactSetInterval	NUMBER,
	Publisher_Timestamp			VARCHAR2(128)
) LOGGING 
/
-- Create Distributor table
DROP TABLE HREPL_Distributor
/
CREATE TABLE HREPL_Distributor (
	Distributor_PublisherName	VARCHAR2(128) NOT NULL,
	Distributor_DistributorName	VARCHAR2(128) NOT NULL,
	Distributor_DistributionDB	VARCHAR2(128) NOT NULL,
	Distributor_ProductVersion	VARCHAR2(128) NULL,
	Distributor_Status			NUMBER(4)     NOT NULL		
) LOGGING 
/
-- Create XactSetJob table
DROP TABLE HREPL_XactSetJob
/
CREATE TABLE HREPL_XactSetJob (
	XactSetJob_Enabled		VARCHAR2(1),
	XactSetJob_Interval	INTEGER,
	XactSetJob_Threshold	INTEGER,	
	XactSetJob_LRInterval	INTEGER,
	XactSetJob_LRThreshold	INTEGER,
	XactSetJob_What		VARCHAR2(400),
	XactSetJob_LRIsActive	VARCHAR2(1),
	XactSetJob_InactivityCount	INTEGER
) LOGGING 
/
-- Create SchemaFilter table
DROP TABLE HREPL_SchemaFilter
/
CREATE TABLE HREPL_SchemaFilter (
	SchemaFilter_Name	VARCHAR2(200)
) LOGGING 
/
-- Create HREPL_MUTEX table
DROP TABLE HREPL_MUTEX
/
CREATE TABLE HREPL_MUTEX (
	MUTEX_LOCK	INT
) LOGGING 
/
-- Create HREPL_Changes table
DROP TABLE HREPL_Changes
/
CREATE TABLE HREPL_Changes (
	ChangeCount	INT
) LOGGING 
/
-- Create HREPL_Version table
DROP TABLE HREPL_Version
/
CREATE TABLE HREPL_Version (
	SQLServerVersion	VARCHAR2(256)
) LOGGING 
/
-- Populate HREPL_SchemaFilter with defaults
INSERT INTO HREPL_SchemaFilter values('SYS')
/
INSERT INTO HREPL_SchemaFilter values('MTSSYS')
/
INSERT INTO HREPL_SchemaFilter values('SYSTEM')
/
INSERT INTO HREPL_SchemaFilter values('WMSYS')
/
INSERT INTO HREPL_SchemaFilter values('MDSYS')
/
INSERT INTO HREPL_SchemaFilter values('CTXSYS')
/
INSERT INTO HREPL_SchemaFilter values('WKSYS')
/
INSERT INTO HREPL_SchemaFilter values('OLAPSYS')
/
INSERT INTO HREPL_SchemaFilter values('DMSYS')
/
INSERT INTO HREPL_SchemaFilter values('XDB')
/
-- Populate HREPL_XactSetJob with defaults
INSERT INTO HREPL_XactSetJob values(0, 15, 1000, 1, 100, 'HREPL.XactSetJob;', 0, 0)
/
-- Populate HREPL_Version with initial setting
INSERT INTO HREPL_Version values('SQL Server 2005 BUILD 9.00.0000.00')
/
COMMIT
/
-----------------------------------------------------------------------------------
--
--  Name:    HREPL_ExecuteCommand
--  Purpose: This procedure takes a passed command, deposits the command in a
--			 DBMS_SQL.VARCHAR2S table, and calls ExecuteCommandTable to execute
--			 the command.
--	     	     
--  Input:
--  	 argSQLCommand	IN VARCHAR2
--
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE HREPL_ExecuteCommand
(
	argSQLCommand	IN VARCHAR2
)
AS
	CursorHandle 	INTEGER;
	ReturnValue 	INTEGER;
		
BEGIN
	-- Open a cursor 
	CursorHandle := DBMS_SQL.OPEN_CURSOR;
 
	-- Parse the command
	BEGIN 
		DBMS_SQL.PARSE(CursorHandle, argSQLCommand, DBMS_SQL.native);
	EXCEPTION
		WHEN OTHERS THEN
			DBMS_SQL.CLOSE_CURSOR(CursorHandle);
			RAISE;
	END;
 
	-- Execute the command
	BEGIN 
		ReturnValue := DBMS_SQL.EXECUTE(CursorHandle);
	EXCEPTION
		WHEN NO_DATA_FOUND THEN NULL;	
		WHEN OTHERS THEN
			DBMS_SQL.CLOSE_CURSOR(CursorHandle);
			RAISE;
	END;
	
	-- Close the cursor
	DBMS_SQL.CLOSE_CURSOR(CursorHandle);
	
END HREPL_ExecuteCommand;
/
SHOW ERRORS PROCEDURE HREPL_ExecuteCommand
-----------------------------------------------------------------------------------
--
--  Name:    DropPublisher
--  Purpose: Truncate publisher tables    
--
--  Notes:  Best effort to drop publisher.  No errors are returned.   
--
-----------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE HREPL_DropPublisher
AS
	SQLCommand VARCHAR2(500);

	CURSOR	object_cur
	IS
		SELECT object_name, object_type
		FROM all_objects
		WHERE
		owner = USER AND
		UPPER(object_name) LIKE 'HREPL%'
		AND object_type NOT IN('PROCEDURE');

BEGIN
	-- Drop objects
	FOR	object_rec
	IN	object_cur

	LOOP
		BEGIN
			SQLCommand := 'DROP ' || object_rec.object_type || ' ' || object_rec.object_name;
		HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;
	END LOOP;

	-- Drop public synonym for SetSQLOriginator, ignore error
	BEGIN
		SQLCommand := 'DROP PUBLIC SYNONYM MSSQLSERVERSETSQLORIGINATOR';
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	COMMIT;

EXCEPTION
	WHEN OTHERS THEN NULL;

END HREPL_DropPublisher;
/
SHOW ERRORS PROCEDURE HREPL_DropPublisher