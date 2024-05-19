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
-- Create package HREPL
CREATE OR REPLACE PACKAGE HREPL
AS
	SQLORIGINATOR BOOLEAN := FALSE;
	
	BASETIMET CONSTANT DATE := TO_DATE('2000-01-01 01:00:00', 'YYYY-MM-DD HH:MI:SS');

	PROCEDURE RefreshXactSetJob(argXactSetJobEnabled IN INTEGER, argXactSetJobInterval IN INTEGER, argXactSetJobThreshold IN INTEGER,
		argXactSetJobLRInterval IN INTEGER, argXactSetJobLRThreshold IN INTEGER);

	PROCEDURE PollBegin(argLSN IN RAW);

	PROCEDURE XactSetJob;

	PROCEDURE PollEnd(argLSN IN RAW);

	PROCEDURE SnapshotBegin(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argPublicationID IN NUMBER,
		argArticleID IN NUMBER, argDirectory IN VARCHAR2, argScriptSch IN VARCHAR2, argScriptIdx IN VARCHAR2,
		argSyncCommand IN VARCHAR2, argPreScript IN VARCHAR2, argPostScript IN VARCHAR2,
		argCreationScriptPath IN VARCHAR2, argFtpAddress IN VARCHAR2, argFtpPort IN VARCHAR2,
		argFtpSubdirectory IN VARCHAR2, argFtpLogin IN VARCHAR2, argFtpPassword IN VARCHAR2,
		argAlternateSnapshotFolder IN VARCHAR2, argCompressSnapshot IN VARCHAR2);

	PROCEDURE SnapshotEnd(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argPublicationID IN NUMBER,
		argArticleID IN NUMBER);
	
	PROCEDURE RowCnt(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argPublicationID IN NUMBER,
		argArticleID IN NUMBER, argCommandType IN NUMBER, argCommand IN VARCHAR2, argSubscriptionLevel IN NUMBER);

	PROCEDURE MarkSubscription( argPublicationID IN NUMBER,	argArticleID IN NUMBER, argCommandType IN NUMBER, argCommand IN VARCHAR2);

	PROCEDURE PublishTable(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER, argTriggerStyle IN NUMBER,
		argRecreateTriggers IN NUMBER, argArticleView IN VARCHAR2, argReplFreq IN NUMBER, argTimestamp IN VARCHAR2, argInstance IN NUMBER, argColumnMask IN RAW, argTriggerMask IN RAW, argFilterClause IN LONG);

	PROCEDURE AlterTableLog(argTableID IN NUMBER, argTablespace IN VARCHAR2);

	PROCEDURE ValidateRowFilter(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argColumnMask IN RAW, argFilterClause IN LONG);
	
	PROCEDURE UnPublishTable(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER, argArticleView IN VARCHAR2, argDropTriggers IN NUMBER, argTimestamp IN VARCHAR2);

	PROCEDURE InitPublisher;
	
	PROCEDURE SetSqlOriginator;
	
	PROCEDURE Trace(argPublicationID IN NUMBER, argArticleID IN NUMBER, argTracerCmdType IN NUMBER, argTracerStr IN VARCHAR2);

	PROCEDURE CompileTriggers;
	
END HREPL;
/
SHOW ERRORS PACKAGE HREPL
CREATE OR REPLACE PACKAGE BODY HREPL
AS
-----------------------------------------------------------------------------------
--  Declare PL/SQL table types
-----------------------------------------------------------------------------------
	TYPE string_tab IS TABLE OF VARCHAR2(128) 
	INDEX BY BINARY_INTEGER;
	TYPE number_tab IS TABLE OF NUMBER
	INDEX BY BINARY_INTEGER;
-----------------------------------------------------------------------------------
--  Declare Constants
-----------------------------------------------------------------------------------
	DeleteOp CONSTANT INTEGER := 1;
	InsertOp CONSTANT INTEGER := 2;
	UpdateOldOp CONSTANT INTEGER := 3;
	UpdateNewOp CONSTANT INTEGER := 4;
	DeleteUnqOp CONSTANT INTEGER := 15;
	InsertUnqOp CONSTANT INTEGER := 16;
	NoPollInProcess CONSTANT INTEGER := 0;
	ProcessingChanges CONSTANT INTEGER := 1;
	ProcessingSyncDone CONSTANT INTEGER := 2;  
	UpdateCommand CONSTANT INTEGER := 1;
	DeleteCommand CONSTANT INTEGER := 2;
	UpdateAndDeleteCommand CONSTANT INTEGER := 3;
	NewCommand CONSTANT INTEGER := 4;
	SYNCINIT CONSTANT NUMBER := 5;
	SYNCDONE CONSTANT NUMBER := 6;
	SNAPSHOT CONSTANT NUMBER := 7;
	TABLEROWCNT CONSTANT NUMBER := 10;
	INRECONCILIATION CONSTANT NUMBER := 11;
	PENDINGSUBSCRIPTIONMARKER CONSTANT NUMBER := 12;
	ACTIVESUBSCRIPTIONMARKER CONSTANT NUMBER := 13;
	TRACERTOKEN CONSTANT NUMBER := 14;
	Language CONSTANT INTEGER := DBMS_SQL.native;
	MAXLEN CONSTANT INTEGER := 255;
	ArticleLogTemplate CONSTANT VARCHAR2(30) := 'HREPL_ARTICLEXLOG_Y';
	LogViewTemplate CONSTANT VARCHAR2(30) := 'HREPL_LOG_X_Y_Z';
	ArticleViewTemplate CONSTANT VARCHAR2(30) := 'HREPL_ARTICLE_X_Y';
	ArticleTriggerRowTemplate CONSTANT VARCHAR2(30) := 'HREPL_ARTICLEX_TRIGGER_ROW';
	ArticleTriggerStmtTemplate CONSTANT VARCHAR2(30) := 'HREPL_ARTICLEX_TRIGGER_STMT';
	ArticleTempView CONSTANT VARCHAR2(30) := 'HREPL_TempViewX';
	ArticleFuncLongLen CONSTANT VARCHAR2(30) := 'HREPL_LEN_X_Y_Z';
	MatchString CONSTANT VARCHAR2(1) := 'X';
	MatchStringY CONSTANT VARCHAR2(1) := 'Y';
	MatchStringZ CONSTANT VARCHAR2(1) := 'Z';
	SecondsInaDay CONSTANT NUMBER := 86400;
	BASETIME CONSTANT DATE := TO_DATE('2000-01-01 01:00:00', 'YYYY-MM-DD HH:MI:SS');
-----------------------------------------------------------------------------------
--  Declare Error values
-----------------------------------------------------------------------------------
	EPollInProgress		CONSTANT NUMBER	:= -20001;
	EPublisherLSNMismatch   CONSTANT NUMBER := -20002;
	ECompilationError	CONSTANT NUMBER := -20003;
	EInconsistentDatatypes  CONSTANT NUMBER := -20932;
-----------------------------------------------------------------------------------
--  Declare Error strings
-----------------------------------------------------------------------------------
	StrPollInProgress	CONSTANT VARCHAR2(200)	:= 'Poll already in process';
	StrPublisherLSNMismatch CONSTANT VARCHAR2(200) := 'The LSN associated with this poll interval at the publisher did not match the LSN sent with the PollEnd.';
	StrInconsistentDatatypes CONSTANT VARCHAR2(200) := 'Inconsistent datatypes';   				  				
-----------------------------------------------------------------------------------
	FUNCTION is_string (data_type IN VARCHAR2) RETURN BOOLEAN
	IS
	BEGIN
		RETURN (data_type IN ('CHAR', 'VARCHAR2', 'NCHAR', 'NVARCHAR2'));
	END;

	FUNCTION is_number (data_type IN VARCHAR2) RETURN BOOLEAN
	IS
	BEGIN
		RETURN (data_type IN ('NUMBER', 'FLOAT'));
	END;

	FUNCTION is_raw (data_type IN VARCHAR2) RETURN BOOLEAN
	IS
	BEGIN
		RETURN (data_type IN ('RAW'));
	END;
-----------------------------------------------------------------------------------
--  Declare internal procedures
-----------------------------------------------------------------------------------
	FUNCTION HREPLPOLLIsEmpty RETURN NUMBER;

	FUNCTION HREPLPOLLHasChanges(argPollid IN NUMBER) RETURN NUMBER;
	
	FUNCTION HREPLPOLLHasTableChanges(argPollid IN NUMBER) RETURN NUMBER;
	
	FUNCTION HREPLPOLLHasOnlyInrecCommands(argPollid IN NUMBER) RETURN NUMBER;
	
	FUNCTION HREPLPUBLISHEDTABLESIsEmpty RETURN NUMBER;
	
	FUNCTION HREPLEVENTHasEntries(argPollid IN NUMBER, argOperation IN NUMBER) RETURN NUMBER;

	PROCEDURE PopulatePollTable;
	
	PROCEDURE SeqFixupForUniqueColumnUpdates;
	
	PROCEDURE GetTableIDs(argTableIDs IN OUT number_tab, argInstanceIDs IN OUT number_tab);

	PROCEDURE CreateTableTriggers(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER, argLogTable IN VARCHAR2, argTriggerStyle IN NUMBER,
		argColumnCount IN NUMBER, argColNames IN string_tab, argColTypes IN string_tab, argColMask IN number_tab);

	PROCEDURE CreateRowTrigger(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER, argLogTable IN VARCHAR2, argColumnCount IN NUMBER,
		argColNames IN string_tab, argColTypes IN string_tab, argTriggerStyle IN NUMBER, argColMask IN number_tab);

	PROCEDURE GenerateRowTrigger(argCommandTable IN OUT DBMS_SQL.VARCHAR2S, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2,
		argTableID IN NUMBER, argLogTable IN VARCHAR2, argColumnCount IN NUMBER, argColNames IN string_tab,
		argColTypes IN string_tab, argTriggerStyle IN NUMBER, argColMask IN number_tab);
		
	PROCEDURE CreateStmtTrigger(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER);

	PROCEDURE GenerateStmtTrigger(argCommandTable IN OUT DBMS_SQL.VARCHAR2S, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2,
		 argTableID IN NUMBER);

	PROCEDURE GenerateValueClause(argCommandTable IN OUT DBMS_SQL.VARCHAR2S, argType IN VARCHAR2, argColumnCount IN NUMBER, 
		argColNames IN string_tab, argColTypes IN string_tab, argTriggerStyle IN NUMBER, argCommand IN INTEGER, argTableID IN NUMBER,
		argLogTable IN VARCHAR2, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argColMask IN number_tab);

	PROCEDURE GeneratePKClause(argCommandTable IN OUT DBMS_SQL.VARCHAR2S, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2);

	PROCEDURE GeneratePKList(argCommandTable IN OUT DBMS_SQL.VARCHAR2S, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2);

	PROCEDURE GenerateCreateCommand(argLogTable IN VARCHAR2, argColumnCount IN NUMBER,
		argSQLCommand IN OUT DBMS_SQL.VARCHAR2S, argColNames IN string_tab, argColTypes IN string_tab,
		argTriggerStyle IN NUMBER, argColMask IN number_tab);

	PROCEDURE GenerateIndexCommand(argLogTable IN VARCHAR2, argSQLCommand IN OUT DBMS_SQL.VARCHAR2S);

	PROCEDURE CreateView(argTableName IN VARCHAR2, argTableOwner IN VARCHAR2, argViewName IN VARCHAR2, 
		argColumnCount IN NUMBER, argColNames IN string_tab, argColTypes IN string_tab,
		argColMask IN number_tab, argFilterClause IN LONG);
		
	PROCEDURE GenerateView(argTableName IN VARCHAR2, argTableOwner IN VARCHAR2, argViewName IN VARCHAR2, argColumnCount IN NUMBER,
		argSQLCommand IN OUT DBMS_SQL.VARCHAR2S, argColNames IN string_tab, argColTypes IN string_tab,
		argColMask IN number_tab, argFilterClause IN LONG);

	PROCEDURE CreateGetLongLenFunction(argArticleID IN NUMBER, argTableID IN NUMBER, argArticleInstance IN NUMBER,
		argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argColumnCount IN NUMBER,	argColNames  IN string_tab,
		argColTypes IN string_tab, argColMask IN number_tab);
		
	PROCEDURE GenerateFunctionGetLongLen(argFuncName IN VARCHAR2, argTableOwner IN VARCHAR2, argTableName IN VARCHAR2,
		argColInd IN NUMBER, argSQLCommand IN OUT DBMS_SQL.VARCHAR2S, argColNames  IN string_tab, argColTypes IN string_tab,
		argColMask IN number_tab);

	PROCEDURE AddToSQLCommand(argString IN VARCHAR2, argCommandTable IN OUT DBMS_SQL.VARCHAR2S);

	FUNCTION NextRow(argStringIn IN VARCHAR2, argStartInOut IN OUT BINARY_INTEGER, argLenIn IN BINARY_INTEGER) RETURN VARCHAR2; 

	PROCEDURE CreateTableLog( argLogTable IN VARCHAR2, argTriggerStyle IN NUMBER,
		argColCount IN NUMBER, argColNames IN string_tab, argColTypes IN string_tab, argColMask IN number_tab);

	PROCEDURE CreateTableIndex( argLogTable IN VARCHAR2);

	PROCEDURE PopulateColumnTables(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argColCount OUT NUMBER,
		argColNames IN OUT string_tab, argColTypes IN OUT string_tab);

	PROCEDURE TableCleanup(argTableOwner IN VARCHAR2, argTableName IN VARCHAR2, argTableID IN NUMBER);
	
	PROCEDURE DropView(argArticleView IN VARCHAR2);

	PROCEDURE DropLog(argArticleLog IN VARCHAR2);
	
	PROCEDURE DropFunction(argFunctionName IN VARCHAR2);
	
	PROCEDURE SetColumnsIncluded(argColumnMask IN RAW, argColumnsIncluded IN OUT number_tab);
	
	FUNCTION HasValidTriggers (argTableName IN VARCHAR2, argTableOwner IN VARCHAR2, argTableID IN NUMBER,
		argLogInstance IN NUMBER) RETURN NUMBER;

	FUNCTION ToNumFromHex (argChar IN CHAR) RETURN NUMBER;

	PROCEDURE ExecuteCommand(argSQLCommand IN VARCHAR2);
	
	PROCEDURE ExecuteCommandTable(argSQLCommandTable IN DBMS_SQL.VARCHAR2S);
	
	PROCEDURE ExecuteCommandForPollID(argSQLCommand	IN VARCHAR2, argPollidValue IN NUMBER);

	PROCEDURE ExecuteCommandForPollIDTableID(argSQLCommand	IN VARCHAR2, argPollidValue IN NUMBER, argTableidValue IN NUMBER);

	PROCEDURE ExecuteCommandTableForPollID(argSQLCommandTable IN DBMS_SQL.VARCHAR2S, argPollidValue IN NUMBER);

	PROCEDURE CheckCompilationErrors(argObjectName IN VARCHAR2, argObjectType IN VARCHAR2);
	
	PROCEDURE CleanupLogsandViews;

-----------------------------------------------------------------------------------
--
--  Name:    HREPLPOLLIsEmpty
--
--  Purpose: This procedure checks HREPL_POLL to determine whether it has
--           any rows.  It is a more efficient way to determine whether HREPL_POLL
--           is empty than using COUNT(*), since COUNT can be extremely costly if
--			 HREPL_POLL has a large number of entries.
--  Input:   None.
--	     
--  Returns: 1 = HREPL_POLL is empty
--           0 = HREPL_POLL has at least one row
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLPOLLIsEmpty
RETURN NUMBER
IS
	IsEmpty NUMBER;
	pollid NUMBER;	
	CURSOR	poll_cur
	IS
		SELECT Poll_Pollid FROM HREPL_POLL;
	
BEGIN
	OPEN poll_cur;
	FETCH poll_cur INTO pollid;

	IF poll_cur%NOTFOUND
	THEN
		IsEmpty := 1;
	ELSE
		IsEmpty := 0;
	END IF;
	
	CLOSE poll_cur;
				
	RETURN IsEmpty;
END HREPLPOLLIsEmpty;
-----------------------------------------------------------------------------------
--
--  Name:    HREPLPOLLHasChanges
--
--  Purpose: This procedure checks HREPL_POLL to determine whether it has any rows
--           whose POLLID is the current pollid.  It is a more efficient way to determine 
--           whether HREPL_POLL has changes to be processed than using COUNT(*), since COUNT 
--			 can be extremely costly if HREPL_POLL has a large number of entries.
--  Input:   
--			 argPollid  current pollid to check
--	     
--  Returns: 1 = HREPL_POLL has changes to process for the identified poll interval
--           0 = HREPL_POLL does not have changes to process for the identified poll interval
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLPOLLHasChanges
(
	argPollid	IN NUMBER
)
RETURN NUMBER
AS
	HasChanges NUMBER;
	pollid NUMBER;
	
	CURSOR	poll_cur
	IS
		SELECT Poll_Pollid FROM HREPL_POLL
		WHERE Poll_Pollid = argPollid;
BEGIN
	OPEN poll_cur;
	FETCH poll_cur INTO pollid;

	IF poll_cur%NOTFOUND
	THEN
		HasChanges := 0;
	ELSE
		HasChanges := 1;
	END IF;
	
	CLOSE poll_cur;			
	
	RETURN HasChanges;
	
END HREPLPOLLHasChanges;
-----------------------------------------------------------------------------------
--
--  Name:    HREPLPOLLHasTableChanges
--
--  Purpose: This procedure checks HREPL_POLL to determine whether it has any table changes
--           whose POLLID is the current pollid.  It is a more efficient way to determine 
--           whether HREPL_POLL has table changes to be processed than using COUNT(*), since COUNT 
--			 can be extremely costly if HREPL_POLL has a large number of entries.
--  Input:   
--			 argPollid  current pollid to check
--	     
--  Returns: 1 = HREPL_POLL has table changes to process for the identified poll interval
--           0 = HREPL_POLL does not have table changes for the identified poll interval
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLPOLLHasTableChanges
(
	argPollid	IN NUMBER
)
RETURN NUMBER
IS
	HasTableChanges NUMBER;
	pollid NUMBER;	

	CURSOR	poll_cur
	IS
		SELECT Poll_Pollid FROM HREPL_POLL
		WHERE Poll_Pollid = argPollid
		AND Poll_UpdateFlag IN (0, 1, 2);
		
BEGIN
	OPEN poll_cur;
	FETCH poll_cur INTO pollid;

	IF poll_cur%NOTFOUND
	THEN
		HasTableChanges := 0;
	ELSE
		HasTableChanges := 1;
	END IF;
	
	CLOSE poll_cur;			
	
	RETURN HasTableChanges;
	
END HREPLPOLLHasTableChanges;
-----------------------------------------------------------------------------------
--
--  Name:    HREPLPOLLHasOnlyInrecCommands
--
--  Purpose: This procedure checks HREPL_POLL to determine whether it has only in reconciliation
--           commands whose POLLID is the current pollid.  It is a more efficient way to determine 
--           whether HREPL_POLL has primary key updates to be processed than using COUNT(*), 
--			 since COUNT can be extremely costly if HREPL_POLL has a large number of entries.
--  Input:   
--			 argPollid  current pollid to check
--	     
--  Returns: 1 = HREPL_POLL has either no entries or only in reconciliation entries
--           0 = HREPL_POLL does not have only in reconciliation entries
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLPOLLHasOnlyInrecCommands
(
	argPollid	IN NUMBER
)
RETURN NUMBER
AS
	HasOnlyInrecCommands NUMBER;
	pollid NUMBER;
		
	CURSOR	poll_cur
	IS
		SELECT Poll_Pollid FROM HREPL_POLL
		WHERE Poll_Pollid = argPollid
		AND Poll_UpdateFlag <> INRECONCILIATION;
		
BEGIN
	OPEN poll_cur;
	FETCH poll_cur INTO pollid;

	IF poll_cur%NOTFOUND
	THEN
		HasOnlyInrecCommands := 1;
	ELSE
		HasOnlyInrecCommands := 0;
	END IF;
	
	CLOSE poll_cur;			
	
	RETURN HasOnlyInrecCommands;
	
END HREPLPOLLHasOnlyInrecCommands;
-----------------------------------------------------------------------------------
--
--  Name:    HREPLPUBLISHEDTABLESIsEmpty
--
--  Purpose: This procedure checks HREPL_PUBLISHEDTABLES to determine whether it has
--           any rows.  It is a more efficient way to determine whether HREPL_PUBLISHEDTABLES
--           is empty than using COUNT(*), since COUNT can be extremely costly if
--			 HREPL_PUBLISHEDTABLES has a large number of entries.
--  Input:   none
--	     
--  Returns: 1 = HREPL_PUBLISHEDTABLES is empty
--           0 = HREPL_PUBLISHEDTABLES has at least one row
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLPUBLISHEDTABLESIsEmpty
RETURN NUMBER
IS
	IsEmpty NUMBER;
	tableid NUMBER;	
	CURSOR	tab_cur
	IS
		SELECT Published_TableID FROM HREPL_PUBLISHEDTABLES
		WHERE Published_LogDropPending = 0
		AND	  Published_ArticleDropPending = 0;
	
BEGIN
	OPEN tab_cur;
	FETCH tab_cur INTO tableid;

	IF tab_cur%NOTFOUND
	THEN
		IsEmpty := 1;
	ELSE
		IsEmpty := 0;
	END IF;
	
	CLOSE tab_cur;
				
	RETURN IsEmpty;
END HREPLPUBLISHEDTABLESIsEmpty;
-----------------------------------------------------------------------------------
--
--  Name:    HREPLEVENTHasEntries
--
--  Purpose: This procedure checks HREPL_EVENT to determine whether it has any entries having
--           a given pollid and operation type.  It is a more efficient way to determine 
--           whether HREPL_EVENT has entries associated with a given operation to be processed  
--			 than using COUNT(*), since COUNT can be extremely costly if HREPL_EVENT has a large
--			 number of entries.
--  Input:   
--			 argPollid		Pollid of entry
--			 argOperation	Event operation of entry
--	     
--  Returns: 1 = HREPL_EVENT has entries associated with the passed pollid and operation
--           0 = HREPL_EVENT does not have entries associated with the passed pollid and operation
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
FUNCTION HREPLEVENTHasEntries
(
	argPollid		IN NUMBER,
	argOperation	IN NUMBER
)
RETURN NUMBER
AS
	HasEntries NUMBER;
	pollid NUMBER;
		
	CURSOR	event_cur 
	IS
		SELECT Poll_Pollid FROM HREPL_EVENT e, HREPL_POLL p
		WHERE CHARTOROWID(e.ROWID) = p.Poll_ROWID
		AND Event_Operation = argOperation
		AND p.Poll_Pollid = argPollid;
		
BEGIN
	OPEN event_cur; 
	FETCH event_cur INTO pollid;

	IF event_cur%NOTFOUND
	THEN
		HasEntries := 0;
	ELSE
		HasEntries := 1;
	END IF;
	
	CLOSE event_cur;			
	
	RETURN HasEntries;
	
END HREPLEVENTHasEntries;
-----------------------------------------------------------------------------------
--
--  Name:    RefreshXactSetJob
--  Input:
--       argXactSetJobEnabled IN INTEGER	Flag to indicate whether Poll Job is enable
--                                          0 = Enable, 1 = Disabled
--       argXactSetJobInterval IN INTEGER	Number of minutes between successive executions
--                                          of the Poll Job
--       argXactSetJobThreshold IN INTEGER	Number of changes that need to be exceeded in order
--                                          to force a new poll interval
--       argXactSetJobLRInterval IN INTEGER Number of minutes between successive executions
--                                          of the Poll Job when log reader is active
--       argXactSetJobLRThreshold IN INTEGER Number of changes that need to be exceeded in order
--                                          to force a new poll interval when log reader is active
--  Output:
--  Purpose: Refresh the publisher with current parameter settings for the Poll Job.
--           The input parameters are used to reset the poll job parameters in HREPL_XactSetJob.
--
--           The job queue is interrogated to determine whether the poll job is currently
--           in the queue:
--
--           (1)  If the job is not in the job queue and the job is now marked as
--                disabled, no action is taken.
--
--           (2)  If the job is not in the job queue and the job is now marked as
--                enabled, the job is started using the current parameters.
--
--           (3)  If the job is in the job queue and the job is now marked as disabled,
--                the job is removed from the job queue.
--
--           (4)  If the job is in the job queue and the job is now marked as enabled,
--                the old and new interval values are compared.  If there has been a
--                change, the job is removed from the job queue, and the job is reentered
--                using the current parameters.
--
--  Notes:   HREPL_XactSetJob is updated with current information on the job
--
-----------------------------------------------------------------------------------
PROCEDURE RefreshXactSetJob
(
	argXactSetJobEnabled IN INTEGER,
	argXactSetJobInterval IN INTEGER,
	argXactSetJobThreshold IN INTEGER,
	argXactSetJobLRInterval IN INTEGER,
	argXactSetJobLRThreshold IN INTEGER
)
AS
	Jobno BINARY_INTEGER := 0;
	XactSetJobEnabled INTEGER;
	XactSetJobInterval INTEGER;
	XactSetJobLRInterval INTEGER;
	XactSetJobLRIsActive INTEGER;
	Interval INTEGER;

BEGIN
	-- Update non null poll job parameters
	IF NOT argXactSetJobEnabled IS NULL THEN
		UPDATE HREPL_XactSetJob SET XactSetJob_Enabled = argXactSetJobEnabled;
	END IF;	
	IF NOT argXactSetJobInterval IS NULL THEN
		UPDATE HREPL_XactSetJob SET XactSetJob_Interval = argXactSetJobInterval;
	END IF;	
	IF NOT argXactSetJobThreshold IS NULL THEN
		UPDATE HREPL_XactSetJob SET XactSetJob_Threshold = argXactSetJobThreshold;
	END IF;	
	IF NOT argXactSetJobLRInterval IS NULL THEN
		UPDATE HREPL_XactSetJob SET XactSetJob_LRInterval = argXactSetJobLRInterval;
	END IF;	
	IF NOT argXactSetJobLRThreshold IS NULL THEN
		UPDATE HREPL_XactSetJob SET XactSetJob_LRThreshold = argXactSetJobLRThreshold;
	END IF;	
	
	-- Obtain current XactSet job parameters from HREPL_XactSetJob
	SELECT	XactSetJob_Enabled,	
			XactSetJob_Interval,	
			XactSetJob_LRInterval,	
			XactSetJob_LRIsActive
	INTO	XactSetJobEnabled,
			XactSetJobInterval,
			XactSetJobLRInterval,
			XactSetJobLRIsActive
	FROM	HREPL_XactSetJob;
	
	-- Set Interval based upon parity of LRIsActive
	IF XactSetJobLRIsActive = 1 THEN
		Interval := XactSetJobLRInterval;
	ELSE
		Interval := XactSetJobInterval;
	END IF;	

	-- Determine whether the job is currently in the job queue
	BEGIN
		SELECT	JOB INTO Jobno
		FROM	USER_JOBS 
		WHERE	LOG_USER = USER
		AND	WHAT = 'HREPL.XactSetJob;';
	EXCEPTION
		WHEN NO_DATA_FOUND THEN NULL;	
		WHEN OTHERS THEN RAISE;
	END;	

	IF (Jobno = 0) THEN
		-- If the job is not currently in the job queue
		-- and the job is enabled, enter the job in the
		-- queue.
		IF (XactSetJobEnabled = 1) THEN
			
			-- Enter Poll Job in job queue
			DBMS_JOB.SUBMIT(
				Jobno,
				'HREPL.XactSetJob;',
				SYSDATE + Interval/1440,
				'SYSDATE + ' || TO_CHAR(Interval) || '/1440'
			);
			COMMIT;

		END IF;

	ELSE
		-- If the job is currently in the job queue 
		-- and the job is disabled, remove the job from
		-- the queue.
		IF (XactSetJobEnabled = 0) THEN

			-- Remove Poll Job from job queue
			DBMS_JOB.REMOVE(Jobno);
			COMMIT;
			
		END IF;

	END IF;
	
	-- Commit transaction
	COMMIT;

EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;
	
END RefreshXactSetJob;
-----------------------------------------------------------------------------------
--
--  Name:    PollBegin
--  Input:
--       argLSN       	IN RAW(10)  LSN from distributor that will be associated
--                              	with this poll interval   
--  Output:
--  Purpose: Identify the next poll interval for the Log Reader to process and 
--           update Publisher Status Table
--  Input:
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE PollBegin
(
	argLSN      IN RAW
)
AS
	PollInProcess 	NUMBER;
	ChangeCount     NUMBER;
	HasChanges		NUMBER;
	HasTableChanges	NUMBER;
	HasSyncInits	NUMBER;
	HasSyncDones	NUMBER;
	HasRowCounts	NUMBER;
	HasInReconciliations NUMBER;
	HasTracerTokens NUMBER;
	TableCount		NUMBER := 0;
	CurrentPollid	NUMBER := 0;
	Jobno			BINARY_INTEGER := 0;
	XactSetJobEnabled		INTEGER := 0;
	XactSetEnabled	INTEGER := 0;
	LRInterval		NUMBER;
	XactSetBeginTime	NUMBER;
BEGIN
	-- Set the begin time for XactSet processing
	UPDATE	HREPL_Publisher
	SET		Publisher_XactSetBeginTime = round(to_number((SYSDATE - BASETIME) * SecondsInaDay));
	
	SELECT Publisher_PollInProcess,
	       Publisher_XactSetEnabled
	INTO   PollInProcess,
	       XactSetEnabled
	FROM HREPL_Publisher;

	-- Make sure we have received the Poll End from the last poll request
	IF	NOT PollInProcess = NoPollInProcess THEN
		RAISE_APPLICATION_ERROR(EPollInProgress,StrPollInProgress);
	END IF;
	
	-- Make sure that we have at least one published table
	BEGIN
		IF HREPLPUBLISHEDTABLESIsEmpty = 1 THEN
		BEGIN
			-- If there are no tables currently being published,
			-- update publisher status variables and return
			Update HREPL_Publisher set Publisher_LSN = argLSN,
       			Publisher_HasChanges = 0,
				Publisher_SyncInits = 0,
				Publisher_SyncDones = 0,
       			Publisher_RowCntValidations = 0,
       			Publisher_TableChanges = 0,
       			Publisher_InReconciliation = 0,
       			Publisher_TracerTokens = 0,
				Publisher_PollInProcess = 0;
            COMMIT;
            RETURN;
   		END;
   		END IF;
   	END;
   	
	IF (HREPLPOLLIsEmpty = 1) AND XactSetEnabled = 1 THEN
		-- If there are no Xact sets currently defined in HREPL_Poll
		-- and the creation of Xact sets is currently enabled, create
		-- a new Xact set, setting the Pollid value to be used by Log
		-- Reader.
		
		-- Create a critical section around HREPL.PopulatePollTable by
		-- obtaining an exclusive write lock on HREPL_MUTEX.  This is needed,
		-- since both the Log Reader during PollBegin processing and the
		-- asynchronous Poll Job can execute PopulatePollTable.
		BEGIN
			-- If the lock is held, wait for it to be released
			COMMIT;
			LOCK TABLE HREPL_MUTEX IN EXCLUSIVE MODE; 
				
			-- Commit here to release the lock.  It will be
			-- acquired in PopulatePollTable.
			COMMIT;
			
			-- If HREPL_POLL is still not populated, try
			-- to populate it now, while the lock is held.
			-- The lock is released when PopulatePollTable
			-- issues a commit or rollback.
			IF HREPLPOLLIsEmpty = 1 THEN
				HREPL.PopulatePollTable;
			END IF;	

		END;
	END IF;
	
	-- Set the current pollid to the minimum value found in HREPL_Poll.
	SELECT MIN(Poll_PollID) INTO CurrentPollid FROM HREPL_Poll;
	
	-- If the only changes represented in the poll table for this interval are 
  	-- INRECONCILIATION entries, DELETE them from the poll table and event table.
	IF ( HREPLPOLLHasOnlyInrecCommands(CurrentPollid) = 1 ) THEN
		BEGIN
		
			FOR POLLID IN (SELECT CurrentPollid FROM DUAL)
			LOOP
				BEGIN
					DELETE HREPL_EVENT e
					WHERE Event_Operation = INRECONCILIATION
					AND EXISTS ( SELECT p.POLL_POLLID 
					             FROM HREPL_POLL p
					             WHERE p.POLL_ROWID = CHARTOROWID(e.ROWID)
					             AND p.Poll_Pollid = POLLID.CurrentPollid);
				EXCEPTION
					WHEN NO_DATA_FOUND THEN NULL;	
					WHEN OTHERS THEN RAISE;
				END;

				BEGIN
					DELETE HREPL_POLL
					WHERE Poll_UpdateFlag = INRECONCILIATION
					AND Poll_Pollid = POLLID.CurrentPollid;
				EXCEPTION
					WHEN NO_DATA_FOUND THEN NULL;	
					WHEN OTHERS THEN RAISE;
				END;
			END LOOP;
					
		END;
	END IF;
	
	-- Set the current pollid in the publisher table
	UPDATE HREPL_PUBLISHER
	SET	Publisher_CurrentPollid = CurrentPollid;
	
	-- At this point, if HREPL_POLL is empty, there is
	-- nothing to do.
	IF HREPLPOLLIsEmpty = 1 THEN
		-- If there are no changes to process,
		-- update publisher status variables and return
		Update HREPL_Publisher set Publisher_LSN = argLSN,
   			Publisher_HasChanges = 0,
			Publisher_SyncInits = 0,
			Publisher_SyncDones = 0,
   			Publisher_RowCntValidations = 0,
   			Publisher_TableChanges = 0,
   			Publisher_InReconciliation = 0,
   			Publisher_TracerTokens = 0,
			Publisher_PollInProcess = 0;
        COMMIT;
        RETURN;
   	END IF;

	-- Generate sequence value fixup for unique column updates
	HREPL.SeqFixupForUniqueColumnUpdates;

	IF HREPLPOLLHasChanges(CurrentPollid) = 1 THEN
		HasChanges := 1;
		PollInProcess := 1;
	ELSE
		HasChanges := 0;
		PollInProcess := 0;
	END IF;
	
	IF HREPLPOLLHasTableChanges(CurrentPollid) = 1 THEN
		HasTableChanges := 1;
	ELSE
		HasTableChanges := 0;
	END IF;
	
	IF HREPLEVENTHasEntries(CurrentPollid, INRECONCILIATION) = 1 THEN
		HasInReconciliations := 1;
	ELSE
		HasInReconciliations := 0;
	END IF;
					                
	IF HREPLEVENTHasEntries(CurrentPollid, SYNCINIT) = 1 THEN
		HasSyncInits := 1;
	ELSE
		HasSyncInits := 0;
	END IF;
	
	IF HREPLEVENTHasEntries(CurrentPollid, SYNCDONE) = 1 THEN
		HasSyncDones := 1;
	ELSE
		HasSyncDones := 0;
	END IF;
	
	IF HREPLEVENTHasEntries(CurrentPollid, TABLEROWCNT) = 1 THEN
		HasRowCounts := 1;
	ELSE
		HasRowCounts := 0;
	END IF;
	
	IF HREPLEVENTHasEntries(CurrentPollid, TRACERTOKEN) = 1 THEN
		HasTracerTokens := 1;
	ELSE
		HasTracerTokens := 0;
	END IF;

	-- Update remaining publisher status variables
	UPDATE HREPL_Publisher SET
       		Publisher_LSN				= argLSN,
       		Publisher_HasChanges        = HasChanges,
       		Publisher_TableChanges		= HasTableChanges,	
       		Publisher_SyncInits         = HasSyncInits,
       		Publisher_SyncDones         = HasSyncDones,
       		Publisher_RowCntValidations = HasRowCounts,
       		Publisher_InReconciliation  = HasInReconciliations,
       		Publisher_TracerTokens      = HasTracerTokens,
            Publisher_PollInProcess		= PollInProcess;
      
	-- Determine whether the poll job is currently enabled
	SELECT	XactSetJob_Enabled,
			XactSetJob_LRInterval
	INTO	XactSetJobEnabled,
			LRInterval
	FROM	HREPL_XactSetJob;
	LRInterval := LRInterval/1440;				

	IF (XactSetJobEnabled = 1) THEN
		BEGIN
			-- Get the Job number of the job from the job queue
			BEGIN
				SELECT	JOB INTO Jobno
				FROM	USER_JOBS 
				WHERE	LOG_USER = USER
				AND	WHAT = 'HREPL.XactSetJob;';
			EXCEPTION
				WHEN NO_DATA_FOUND THEN NULL;	
				WHEN OTHERS THEN RAISE;
			END;
			
			-- Set the LRIsActive flag to true and the InactivityCount
			-- to 0 in HREPL_XactSetJob table
			UPDATE HREPL_XactSetJob
			SET XactSetJob_LRIsActive = 1, XactSetJob_InactivityCount = 0;
		
			-- If the XactSet job is enabled and the job is in the job queue,
			-- reschedule it to run using the interval appropriate when the
			-- log reader is active. We can ignore errors here, since if the
			-- XactSet job doesn't create a XactSet, one will get created by the
			-- Log Reader when one is needed.
			IF (Jobno <> 0) THEN
				BEGIN
					-- Update job interval to reflect LR active interval
					DBMS_JOB.CHANGE(
						Jobno,
						NULL,
						SYSDATE + LRInterval,
						'SYSDATE + ' || TO_CHAR(LRInterval)  
					);
					COMMIT;
				EXCEPTION
					WHEN OTHERS THEN NULL;
				END;
			END IF;	
		END;
	END IF;
	
  	-- Commit transaction
	COMMIT;

EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;
	
END PollBegin;
-----------------------------------------------------------------------------------
--
--  Name:    XactSetJob
--  Input:
--
--  Output:
--  Purpose: HREPL_Poll is queried to determine the number of pending XactSets to be
--			 processed by the log reader.  If the number exceeds 3, the LRIsActive
--           flag in HREPL_XactSetJob is set to false to indicate that the log reader
--           is not keeping up or is not active.  The interval and threshold values
--           are then set based upon the parity of LRIsActive.  The current number
--           of changes not assigned to an XactSet is then compared to the threshold
--           value.  If the number of changes exceeds the threshold value,
--           PopulatePollTable is called to create a new XactSet in HREPL_Poll.
--           Each time the XactSet job runs and its threshold is insufficient to cause
--           PopulatePollTable to be called, an inactivity counter is incremented.
--           When the threshold is met or exceeded, the inactivity counter is zeroed.
--           Whenever the activity counter exceeds 3, LRIsActive is set to 0 to resume
--           less aggressive scheduling.  Before exiting, the XactSet job sets its
--           interval of execution to reflect the current job interval.
--
--  Input:
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE XactSetJob
AS
	TableIDs	number_tab;
	InstanceIDs	number_tab;
	IDCount 	BINARY_INTEGER;
	LogTable	VARCHAR2(255);
	SelectCmd	VARCHAR2(500);
	ChangeCnt	NUMBER := 0;
	ChangeTotal	NUMBER := 0;
	Jobno		BINARY_INTEGER := 0;
	Interval	NUMBER := 0;
	Threshold	NUMBER := 0;
	PendingCnt  NUMBER := 0;
	XactSetJobInterval INTEGER;
	XactSetJobThreshold INTEGER;
	XactSetJobLRInterval INTEGER;
	XactSetJobLRThreshold INTEGER;
	XactSetJobLRIsActive INTEGER;
	XactSetJobInactivityCount INTEGER;
	XactSetEnabled INTEGER;

BEGIN
	-- Obtain the current XactSet job parameters from HREPL_XactSetJob
	-- and the XactSet enabled flag from HREPL_Publisher
	SELECT	XactSetJob_Interval,	
			XactSetJob_LRInterval,	
			XactSetJob_Threshold,	
			XactSetJob_LRThreshold,
			XactSetJob_LRIsActive,
			XactSetJob_InactivityCount,
			Publisher_XactSetEnabled
	INTO	XactSetJobInterval,
			XactSetJobLRInterval,
			XactSetJobThreshold,
			XactSetJobLRThreshold,
			XactSetJobLRIsActive,
			XactSetJobInactivityCount,
			XactSetEnabled
	FROM	HREPL_XactSetJob, HREPL_Publisher;
	
	-- If XactSet creation is not enabled, reset the job execution interval
	-- to its long cycle and exit.  No XactSets should be created.
	IF XactSetEnabled = 0 THEN
		Interval := XactSetJobInterval/1440;
	ELSE		
	BEGIN
		-- If the change threshold is 0, set ChangeTotal to 1 and bypss
		-- counting the number of pending changes, since an xactset should
		-- always be created.
		IF Threshold = 0  THEN
			ChangeTotal := 1;
		ELSE 
			-- Get the Table IDs of the published tables
			HREPL.GetTableIDs(TableIDs, InstanceIDs);
			IDCount := TableIDs.COUNT;

			-- Empty the change table, and insert one entry
			DELETE from HREPL_Changes;
			INSERT INTO HREPL_Changes VALUES(0);

			-- For each published table, determine the number of change entries in the
			-- article log that belong to the current poll interval.  
			FOR id_ind IN 1 .. IDCount
			
			LOOP
			
				LogTable := REPLACE( REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(TableIDs(id_ind))),
																 MatchStringY, TO_CHAR(InstanceIDs(id_ind)));
				
				SelectCmd :=
				'UPDATE HREPL_Changes SET ChangeCount = (SELECT COUNT(*) FROM ' || LogTable || ' l ' ||
				' WHERE NOT EXISTS ( SELECT p.Poll_POLLID FROM HREPL_POLL p WHERE CHARTOROWID(l.ROWID) = p.POLL_ROWID ))';
				HREPL_ExecuteCommand(SelectCmd);
	
				SELECT ChangeCount INTO ChangeCnt FROM HREPL_Changes;
		
				-- Accumulate changes in total
				ChangeTotal := ChangeTotal + ChangeCnt;
				
				-- Stop counting changes when the threshold has been met
				EXIT WHEN ChangeTotal > Threshold;

			END LOOP;
			
		END IF;
	
		-- Determine the number of defined XactSets that are pending
		SELECT COUNT(DISTINCT Poll_PollID) INTO PendingCnt FROM HREPL_POLL;
	
		-- If the number of XactSets exceeds 3, set LRIsActive in HREPL_XactSetJob
		-- to 0.  Either the log reader is not running and XactSets are accumulating,
		-- or the log reader is not keeping up.  In either case, we can fall back to
		-- the larger Interval and Threshold values used when the log reader is not
		-- actively processing XactSets.
		IF PendingCnt > 3 THEN
			UPDATE HREPL_XactSetJob
			SET XactSetJob_LRIsActive = 0;
			XactSetJobLRIsActive := 0;
		END IF;
		
		-- Set Interval based upon parity of LRIsActive
		IF XactSetJobLRIsActive = 1 THEN
			Interval := XactSetJobLRInterval/1440;	
			Threshold := XactSetJobLRThreshold;
		ELSE
			Interval := XactSetJobInterval/1440;	
			Threshold := XactSetJobThreshold;
		END IF;	
	
		-- If the total change count for the current interval exceeds the threshold value
		-- create a new XactSet and set inactivity count = 0. If not, increment the inactivity count.
		IF (ChangeTotal > Threshold)  THEN
			BEGIN
				-- Populate the poll table with new XactSet
				HREPL.PopulatePollTable;
		
			EXCEPTION
				WHEN OTHERS THEN NULL;	
			END;

			UPDATE HREPL_XactSetJob
			SET XactSetJob_InactivityCount = 0;
		
		ELSE
			XactSetJobInactivityCount := XactSetJobInactivityCount + 1;
		
			-- If the inactivity count > 3, the change volume is not large enough to support
			-- aggressive scheduling of the XactSet job.  Insure that less aggressive
			-- scheduling is being used.
			IF XactSetJobInactivityCount > 3 THEN 
		
				UPDATE HREPL_XactSetJob
				SET XactSetJob_InactivityCount = 0,
					XactSetJob_LRIsActive = 0;
			    
				Interval := XactSetJobInterval/1440;	 
			    
			ELSE
		
				UPDATE HREPL_XactSetJob
				SET XactSetJob_InactivityCount = XactSetJobInactivityCount;
			
			END IF;
		END IF;	
	END;	
	END IF;
		
	-- Get the Job number of the job from the job queue
	BEGIN
		SELECT	JOB INTO Jobno
		FROM	USER_JOBS 
		WHERE	LOG_USER = USER
		AND	WHAT = 'HREPL.XactSetJob;';
	EXCEPTION
		WHEN NO_DATA_FOUND THEN NULL;	
		WHEN OTHERS THEN RAISE;
	END;
	
	-- Update job interval to reflect current interval
	DBMS_JOB.INTERVAL(
		Jobno,
		'SYSDATE + ' || TO_CHAR(Interval) 
	);
	COMMIT;

EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
	
END XactSetJob;
-----------------------------------------------------------------------------------
--
--  Name:    PollEnd
--  Purpose: PollEnd request signifies that the change entries identified with the current 
--           interval have been successfully entered into the store and forward database
--           and can be deleted from the article log tables.
--  Input:
--           argLSN       	IN RAW(10)      LSN from distributor that was associated
--                              	        with this poll interval   	
--  Output:
--  Notes:   This request causes those entries of the article log tables represented in the
--           Poll Table and having the current pollid to be deleted from both their article log
--           tables and from the Poll Table. The last request value is updated to reflect a
--           PollEnd request.   
--
-----------------------------------------------------------------------------------
PROCEDURE PollEnd
(
	argLSN      IN RAW
)
AS
	SQLCommand		VARCHAR2(500);
	LogTable		VARCHAR2(255);
	CurrentPollID	NUMBER;
	TableIDs 		number_tab;
	InstanceIDs		number_tab;
	IDCount 		BINARY_INTEGER;
	PublisherLSN 	RAW(10);

BEGIN
	-- Put the published tableIDs in a PL/SQL table of IDs
	HREPL.GetTableIDs(TableIDs, InstanceIDs);

	-- Get the current Poll ID
	SELECT Publisher_CurrentPollid INTO CurrentPollID FROM HREPL_Publisher;
	
	IDCount := TableIDs.COUNT;
	-- For each table represented in the ID list  
	FOR id_ind IN 1 .. IDCount
   	LOOP
   	
   		LogTable := REPLACE( REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(TableIDs(id_ind))),
   														 MatchStringY, TO_CHAR(InstanceIDs(id_ind)));
   	
		BEGIN
			-- Generate command to delete from the article log those entries appearing in the
			-- Poll Table with the current PollID 
			SQLCommand := 'DELETE FROM ' || LogTable || ' l ' ||
		                      'WHERE EXISTS (SELECT p.POLL_POLLID FROM HREPL_POLL p ' ||
		                      '              WHERE CHARTOROWID(l.ROWID) = p.Poll_ROWID '  ||
 		                      '              AND p.Poll_PollID = :Pollid)';

			HREPL.ExecuteCommandForPollID(SQLCommand, CurrentPollID);
				
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;
	END LOOP;
	
	FOR POLLID IN (SELECT CurrentPollid FROM DUAL)
	LOOP
		-- Delete from HREPL_Event those entries appearing in the Poll Table 
		-- with the current PollID.
		DELETE FROM HREPL_Event e
		WHERE EXISTS (SELECT p.POLL_POLLID FROM HREPL_POLL p
		              WHERE CHARTOROWID(e.ROWID) = p.Poll_ROWID
 		              AND p.Poll_PollID = POLLID.CurrentPollID);
		
		-- Delete entries from the Poll Table having the current Pollid
		DELETE FROM HREPL_Poll
		WHERE Poll_PollID = POLLID.CurrentPollID;
	END LOOP;	
	
	-- Drop all views associated with articles that are marked as UnPublishPending.
	-- Note:  We cannot perform these drops in UnPublish table, since UnPublish
	--        table can execute concurrently with PollBegin and the querying 
	--        of published tables by the log reader.  PollEnd, however, executes
	--        synchronously with respect to these activities, so can be used
	--        to cleanup log tables and views that are no longer needed.
	HREPL.CleanupLogsandViews;
	
	-- Mark the last request as PollEnd, and update the Publisher LSN
	-- to reflect the LSN committed at the publisher.  
	UPDATE	HREPL_Publisher
	SET	Publisher_PollInProcess = NoPollInProcess,
	    Publisher_LSN = argLSN;

	-- Commit transaction
	COMMIT;

EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;
	
END PollEnd;
-----------------------------------------------------------------------------------
--
--  Name:    CleanupLogsandViews
--  Purpose: To drop all log views and log tables that have a drop pending 
--  Input:
--           none 	
--  Output:
----------------------------------------------------------------------------------
PROCEDURE CleanupLogsandViews
AS
	SQLCommand	VARCHAR2(500);
	LogView		VARCHAR2(30);
	LogTable	VARCHAR2(30);
	FuncName	VARCHAR2(30);

	CURSOR		view_cur
	IS
		SELECT  Published_ArticleID,
				Published_TableID,
				Published_ArticleInstance	
		FROM HREPL_PublishedTables
		WHERE Published_ArticleDropPending = 1;
		
	CURSOR		log_cur
	IS
		SELECT  Published_ArticleID,
				Published_TableID,
				Published_LogInstance
		FROM HREPL_PublishedTables
		WHERE Published_LogDropPending = 1;
	
BEGIN
	FOR view_rec IN view_cur

	LOOP
		-- Generate the log view for the article
		LogView     :=	REPLACE(LogViewTemplate, MatchString, TO_CHAR(view_rec.Published_ArticleID));
		LogView     :=	REPLACE(LogView, MatchStringY, TO_CHAR(view_rec.Published_TableID));
		LogView     :=	REPLACE(LogView, MatchStringZ, TO_CHAR(view_rec.Published_ArticleInstance)); 
	
		-- Delete the log view for the unpublished article 
		BEGIN
			SQLCommand := 'DROP VIEW ' || LogView;
			HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			-- Ignore errors
			WHEN OTHERS THEN NULL;	
		END;
		
		-- Generate the function to obtain long length for the article
		FuncName     :=	REPLACE(ArticleFuncLongLen, MatchString, TO_CHAR(view_rec.Published_ArticleID));
		FuncName     :=	REPLACE(FuncName, MatchStringY, TO_CHAR(view_rec.Published_TableID));
		FuncName     :=	REPLACE(FuncName, MatchStringZ, TO_CHAR(view_rec.Published_ArticleInstance)); 
	
		-- Delete the function for the unpublished article 
		BEGIN
			SQLCommand := 'DROP FUNCTION ' || FuncName;
			HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			-- Ignore errors
			WHEN OTHERS THEN NULL;	
		END;
		
	END LOOP;
	
	FOR log_rec IN log_cur

	LOOP
		-- Generate the log table name for the article
		LogTable    :=	REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(log_rec.Published_TableID));
		LogTable    :=	REPLACE(LogTable, MatchStringY, TO_CHAR(log_rec.Published_LogInstance)); 
	
		-- Delete the log table for the dropped article 
		BEGIN
			SQLCommand := 'DROP TABLE ' || LogTable;
			HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			-- Ignore errors
			WHEN OTHERS THEN NULL;	
		END;
	END LOOP;
		
	-- Delete all entries from HREPL_PublishedTables with pending drops
	BEGIN
		DELETE FROM HREPL_PublishedTables
		WHERE Published_LogDropPending = 1
		OR	  Published_ArticleDropPending = 1;	
	EXCEPTION
		-- Ignore errors
		WHEN OTHERS THEN NULL;	
	END;
		
	  
END CleanupLogsandViews;
-----------------------------------------------------------------------------------
--
--  Name:    SnapshotBegin
--
--  Purpose: Deposit an article SyncInit entry in HREPL_Event.
--
--  Input:
--		 argTableOwner			IN VARCHAR2		Table owner	
--	     argTableName			IN VARCHAR2		Table name
--	  	 argPublicationID		IN NUMBER		Publication ID
--		 argArticleID			IN NUMBER		Article ID
--	     argDirectory			IN VARCHAR2		Location of BCP and Schema files
--		 argScriptSch			IN VARCHAR2		Name of .sch file
--		 argScriptIdx			IN VARCHAR2		Name of index script
--	     argSyncCommand			IN VARCHAR2		Synchronization command
--	     argPreScript			IN VARCHAR2		Name of pre command script
--	     argPostScript			IN VARCHAR2		Name of post command script
--	     argCreationScriptPath	IN VARCHAR2		Name of creation script path
--	     argFtpAddress			IN VARCHAR2		FTP address
--	     argFtpPort				IN VARCHAR2		FTP port
--	     argFtpSubdirectory		IN VARCHAR2		FTP subdirectory
--	     argFtpLogin			IN VARCHAR2		FTP login
--	     argFtpPassword			IN VARCHAR2		FTP password
--	     argAlternateSnapshotFolder	IN VARCHAR2	Alternate snapshot folder
--	     argCompressSnapshot	IN VARCHAR2	Snapshot folder with compressed snapshot
--		
--  Output:
--  
--  Notes:   The SnapshotBegin request is issued by the snapshotAgent just before it begins to
--	     gather snapshot data for an article.  A SyncInit entry is added to the HREPL_Event
--	     table that will be used to identify an interval as a reconciliation interval for the
--	     article.  Entries from HREPL_Event are marked in HREPL_Poll just as entries
--	     from the article log tables are marked, when a PollBegin request is made.  This allows
--	     the SyncInit entry to be associated with a particular polling interval. 
-----------------------------------------------------------------------------------
PROCEDURE SnapshotBegin
(
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argPublicationID	IN NUMBER,
	argArticleID		IN NUMBER,
	argDirectory		IN VARCHAR2,
	argScriptSch		IN VARCHAR2,
	argScriptIdx		IN VARCHAR2,
	argSyncCommand		IN VARCHAR2,
	argPreScript		IN VARCHAR2,
	argPostScript		IN VARCHAR2,
	argCreationScriptPath	IN VARCHAR2,
	argFtpAddress			IN VARCHAR2,
	argFtpPort				IN VARCHAR2,
	argFtpSubdirectory		IN VARCHAR2,
	argFtpLogin				IN VARCHAR2,
	argFtpPassword			IN VARCHAR2,
	argAlternateSnapshotFolder	IN VARCHAR2,
	argCompressSnapshot	IN VARCHAR2
)
AS
	SnapshotSeq NUMBER := 0;
	TableID NUMBER := 0;
	EntryTime NUMBER := round(to_number((SYSDATE - BASETIME) * SecondsInaDay));

BEGIN
	-- Pull sequence value from HREPL_SEQ
	SELECT HREPL_SEQ.nextval INTO SnapshotSeq from dual;
	
	-- Determine the table ID
	SELECT DISTINCT Published_TableID INTO TableID FROM HREPL_PublishedTables
	WHERE Published_Owner = argTableOwner 
	AND   Published_Table = argTableName
	AND   Published_ArticleID = argArticleID;
	
	-- Delete any other synchronizing commands from HREPL_Event for this article
	-- that have not as yet been assigned to an xactset.
	DELETE FROM HREPL_Event e
	WHERE Event_Article_ID = argArticleID
	AND   Event_Table_ID   = TableID
	AND   Event_Operation  IN (SYNCINIT, SYNCDONE, INRECONCILIATION)
	AND   NOT EXISTS (SELECT p.POLL_POLLID FROM HREPL_POLL p
		          WHERE CHARTOROWID(e.ROWID) = p.Poll_ROWID);
	
	-- Make SyncInit entry in HREPL_Event
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, TableID, SYNCINIT, SnapshotSeq, NULL, NULL, EntryTime,
		argDirectory, argScriptSch, argScriptIdx, argSyncCommand, argPreScript, 
		argPostScript, argCreationScriptPath, argFtpAddress, argFtpPort, argFtpSubdirectory, 
		argFtpLogin, argFtpPassword, argAlternateSnapshotFolder, argCompressSnapshot);
		
	-- Make InReconciliation entry in HREPL_Event
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, TableID, INRECONCILIATION, SnapshotSeq, NULL,
		NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
		NULL);

  	-- Commit transaction
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;
	
END SnapshotBegin;
-----------------------------------------------------------------------------------
--
--  Name:    SnapshotEnd
--
--  Purpose: The SnapshotEnd request deposits a SYNCDONE entry in HREPL_Event.
--  Input:
--		 argTableOwner	IN VARCHAR2		Table owner	
--	     argTableName	IN VARCHAR2		Table name
--	  	 argPublicationID IN NUMBER		Publication ID
--		 argArticleID	IN NUMBER		Article ID
--  Output:
--
--  Notes:   This request is issued by the Snapshot Agent when it has finished
--	     gathering the snapshot for the article. A SyncDone entry is added to the HREPL_Event
--	     table that will be used to indicate that the reconciliation period has concluded.
--	     Entries from HREPL_Event are marked in HREPL_Poll just as entries from the
--	     article log tables are marked, when a PollBegin request is made.  This allows
--	     the SyncDone entry to be associated with a particular polling interval.     
--
-----------------------------------------------------------------------------------
PROCEDURE SnapshotEnd
(
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argPublicationID	IN NUMBER,
	argArticleID		IN NUMBER
)
AS
	SnapshotSeq NUMBER := 0;
	TableID NUMBER := 0;
	EntryTime NUMBER := round(to_number((SYSDATE - BASETIME) * SecondsInaDay));

BEGIN
	-- Pull sequence value from HREPL_SEQ
	SELECT HREPL_SEQ.nextval INTO SnapshotSeq from dual;
	
	-- Determine the table ID
	SELECT DISTINCT Published_TableID INTO TableID FROM HREPL_PublishedTables
	WHERE Published_Owner = argTableOwner 
	AND   Published_Table = argTableName
	AND   Published_ArticleID = argArticleID;
	
	-- Make SyncDone entry in HREPL_Event
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, TableID,	SYNCDONE, SnapshotSeq,
		NULL, NULL, EntryTime, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
		NULL, NULL, NULL, NULL);

  	-- Commit transaction
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;
	
END SnapshotEnd;
-----------------------------------------------------------------------------------
--
--  Name:    PublishTable
--  Purpose: Publish an Oracle table to SQL Server by:
--
--           (1)  The article view is created for both snapshot and transactional
--                publications.
--           
--           (2)  If this is a transactional publication, the log view for the
--                article is also created.
--
--           (3)  If this is a transactional publication and an ORACLE publisher,
--                and this is the first transactional article associated with a table, or if this
--                is a transactional publication and an ORACLE GATEWAY publisher,
--                the article log table and triggers for the table are also created.
--
--           (4)  If this is a transactinal publication, and entry for the article
--                is added to the HREPL_PublishedTables table.  NOTE:  No entry is
--                made in this table for tables published in snapshot publications.
--
--           (5)  PublishTable is also called to update the views, triggers and log tables
--                of existing published tables.  For ORACLE GATEWAY publishers, views, triggers
--                and log tables are recreated.  For ORACLE publishers, only the article view
--                is recreated.
--   
--  Input:
--		 argTableOwner		IN VARCHAR2	Table owner
--	     argTableName		IN VARCHAR2	Table name
--		 argTableID			IN NUMBER	TableID
--	     argTriggerStyle	IN NUMBER	Trigger style
--										    0 = SUCCESS
--											NON-ZERO = Error code
--       argRecreateTriggers  IN NUMBER   Flag indicating if triggers and article log table are to
--                                      be created for a transactional publication.  
--                                      1 = create triggers and log table, even if they exits
--                                      0 = only create triggers and log table if they don't exist  
--		 argArticleView		IN VARCHAR2 Name of article view
--       argReplFreq        IN NUMBER   Snapshot frequency -- if 0, transactional publication
--       argTimestamp		IN VARCHAR2 Tick count obtained at the distributor prior to the call
--		 argInstance		IN NUMBER	Instance ID
--       argColumnMask      IN RAW      Column Mask for article
--       argTriggerMask     IN RAW      Column Mask used to specify the columns to include in the change tracking trigger
--       argFilterClause    IN LONG     Filter clause for views 
--  Output:
--           
--  Notes:   This procedure is used to publish an Oracle table to SQL Server.
--	     Once the procedure successsfully executes, change capturing will begin
--	     for the table.   
--
-----------------------------------------------------------------------------------
PROCEDURE PublishTable
(
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argTableID			IN NUMBER,
	argTriggerStyle		IN NUMBER,
	argRecreateTriggers	IN NUMBER,
	argArticleView		IN VARCHAR2,
	argReplFreq         IN NUMBER,
	argTimestamp		IN VARCHAR2,
	argInstance			IN NUMBER,
	argColumnMask       IN RAW,
	argTriggerMask		IN RAW,	
	argFilterClause     IN LONG 
)
AS
	TableIsPublished NUMBER(10);
	TableIDInUse	 NUMBER(10);
	ColCount	 NUMBER;
	PKCount		 NUMBER := 0;
	EntryCount	 NUMBER := 0;
	EntryTableID	 NUMBER := NULL;
	ColName string_tab;
	ColType string_tab;
	ColMask number_tab;
	TriggerMask number_tab;
	DotLoc		INTEGER;
	ArticleLog	VARCHAR2(255);
	LogView		VARCHAR2(255);
	AdminUser	VARCHAR2(255) := USER;
	ViewDelimiter 	CHAR := '_';
	PosID		NUMBER := 15;
	PosDelimiter	NUMBER;
	ArticleID	NUMBER;
	LogInstance	NUMBER := 0;
	MaxLogInstance NUMBER := 0;
	FuncName	VARCHAR2(30);
	
BEGIN
	-- Set time of meta data update in HREPL_Publisher
	UPDATE HREPL_Publisher
	SET Publisher_Timestamp = argTimestamp;
	
	-- Create PL/SQL tables containing the column names and column types
	-- for the published table
	HREPL.PopulateColumnTables (argTableOwner, argTableName, ColCount, ColName, ColType);
	
	-- Create PL/SQL table containing the table columns to be included in the article
	HREPL.SetColumnsIncluded (argColumnMask, ColMask);
	
	-- Cleanup article view from any previous attempt to create it
	HREPL.DropView(argArticleView);
	
	-- Always create the article view
	HREPL.CreateView (argTableName, argTableOwner, argArticleView, ColCount, ColName, ColType, ColMask, argFilterClause);

	-- If this is a snapshot publication, only the article view is needed.  COMMIT and return success.
	IF argReplFreq <> 0 THEN
		COMMIT;
		RETURN;
	END IF;
	
	-- Obtain the articleID from the aticle view name
	PosDelimiter := INSTR(argArticleView, ViewDelimiter, PosID);
	ArticleID := TO_NUMBER(SUBSTR(argArticleView, PosID, PosDelimiter - PosID));
	
	-- Get current MAX log table instance for any existing log tables for the table
	BEGIN
		SELECT MAX(DISTINCT Published_LogInstance)
		INTO MaxLogInstance
		FROM HREPL_PublishedTables
		WHERE Published_TableID = argTableID;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	IF MaxLogInstance IS NULL THEN
		MaxLogInstance := 0;
	END IF;	
	
	-- Get current valid log table instance for an existing log table with no drop pending
	BEGIN
		SELECT DISTINCT Published_LogInstance
		INTO LogInstance
		FROM HREPL_PublishedTables
		WHERE Published_TableID = argTableID
		AND Published_Table = argTableName
		AND Published_Owner = argTableOwner
		AND Published_LogDropPending = 0;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	IF LogInstance IS NULL THEN
		LogInstance := 1;
	END IF;	

	-- If there are any entries for the article in HREPL_PublishedTables, mark them as 'Pending drop'.  This
	-- can occur if there was a previously unsuccessful attempt to create the article, or if an existing
	-- article is being modified.
	BEGIN  
		UPDATE HREPL_PublishedTables
		SET Published_ArticleDropPending = 1
		WHERE Published_TableID = argTableID
		AND Published_Table = argTableName
		AND Published_Owner = argTableOwner
		AND Published_ArticleID = ArticleID;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	-- Generate the name of the log view. Always use the instance ID passed in the call when
	-- creating the log view.  This is needed to identify log views of published articles that
	-- have changed.
	SELECT REPLACE(argArticleView, 'ARTICLE', 'LOG') INTO LogView from dual;
	LogView := LogView || '_' || TO_CHAR(argInstance);
	
	-- Construct the base name for the log table.  The instance identifier will be added later
	-- based upon whether a new log table needs to be created are not.
	SELECT REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(argTableID)) INTO ArticleLog from dual;

	-- Cleanup log view from any previous attempt to create it.
	-- NOTE:  This will only delete views created in previous failed attempts, or views that exist
	--        because the distributor or publisher has been restored and the two are not synchronized.
	--        This will not delete published views that are being updated to reflect more recent
	--        changes.
	HREPL.DropView(LogView);
	
	-- If we aren't forcing a recreate for the triggers, and valid triggers and an article log already
	-- exists and the log table does not have an associated pending drop, create the log view, COMMIT, and return success.
	IF argRecreateTriggers = 0 AND (HREPL.HasValidTriggers(argTableName, argTableOwner, argTableID, LogInstance) > 0) THEN

		SELECT REPLACE(ArticleLog, MatchStringY, TO_CHAR(LogInstance)) INTO ArticleLog from dual;
	
		-- Create the log view for the log table 
		HREPL.CreateView (ArticleLog, AdminUser, LogView, ColCount, ColName, ColType, ColMask, argFilterClause);

		-- Create function to return the length of long columns
		HREPL.CreateGetLongLenFunction(ArticleID, argTableID, argInstance, argTableOwner, argTableName, ColCount,
			ColName, ColType, ColMask);

		-- Add entry to HREPL_PublishedTables for this instance of the article
		INSERT INTO HREPL_PublishedTables
		VALUES(argTableOwner, argTableName, argTableID, ArticleID, LogInstance, argInstance, 0, 0);

		COMMIT;
		RETURN;
	
	END IF;
	
	-- Triggers if they exist are being dropped. In HREPL_PublishedTables,
	-- mark the log table as having an associated pending drop.  The actual
	-- drop of the log table will be done from the log reader during PollEnd
	-- processing.
	BEGIN
		UPDATE HREPL_PublishedTables
		SET    Published_LogDropPending = 1,
			   Published_ArticleDropPending = 1
		WHERE Published_TableID = argTableID;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	-- Increment the max log instance to differentiate it from all other log tables for
	-- the published table that may exist
	MaxLogInstance := MaxLogInstance + 1;
	
	-- Generate the new table name for the log
	SELECT REPLACE(ArticleLog, MatchStringY, TO_CHAR(MaxLogInstance)) INTO ArticleLog from dual;
	
	-- Cleanup from any previous attempts to create the triggers
	HREPL.TableCleanup( argTableOwner, argTableName, argTableID);
	
	-- Create PL/SQL table containing the table columns to be included in the trigger
	HREPL.SetColumnsIncluded (argTriggerMask, TriggerMask);

	-- Cleanup log from any previous attempt to create it.
	-- NOTE:  This will only delete logs created in previous failed attempts, or logs that exist
	--        because the distributor or publisher has been restored and the two are not synchronized.
	--        This will not delete published logs that are being updated to reflect more recent
	--        changes.
	HREPL.DropLog(ArticleLog);

	-- Create an article log table for the table
	HREPL.CreateTableLog (ArticleLog, argTriggerStyle, ColCount, ColName, ColType, TriggerMask);

	-- Create an article log table index
	HREPL.CreateTableIndex (ArticleLog);

	-- Create function to return the length of long columns
	HREPL.CreateGetLongLenFunction(ArticleID, argTableID, argInstance, argTableOwner, argTableName, ColCount,
		ColName, ColType, ColMask);

	-- Create the log view for the log table 
	HREPL.CreateView (ArticleLog, AdminUser, LogView, ColCount, ColName, ColType, ColMask, argFilterClause);

	-- Create triggers of the appropriate style for the table
	HREPL.CreateTableTriggers (argTableOwner, argTableName, argTableID, ArticleLog, argTriggerStyle, ColCount, ColName, ColType, TriggerMask);
	
	-- Add entry to HREPL_PublishedTables for this instance of the article
	INSERT INTO HREPL_PublishedTables
	VALUES(argTableOwner, argTableName, argTableID, ArticleID, MaxLogInstance, argInstance, 0, 0);

	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
	
		-- If this is a snapshot publication, only the article view, if created, needs to be dropped.
		IF argReplFreq <> 0 THEN
			ROLLBACK;
			HREPL.DropView(argArticleView);
			RAISE;
			RETURN;
		END IF;

		-- If this is a transactional publication, and the table associated with the article was previously published,
		-- just drop the article and log views if they were created.
		IF argRecreateTriggers = 0 AND (HREPL.HasValidTriggers(argTableName, argTableOwner, argTableID, LogInstance) > 0) THEN
			ROLLBACK;
			HREPL.DropView(argArticleView);
			HREPL.DropView(LogView);
			RAISE;
			RETURN;
		END IF;
		
		-- Generate the function declaration 
		FuncName     :=	REPLACE(ArticleFuncLongLen, MatchString, TO_CHAR(ArticleID));
		FuncName     :=	REPLACE(FuncName, MatchStringY, TO_CHAR(argTableID));
		FuncName     :=	REPLACE(FuncName, MatchStringZ, TO_CHAR(argInstance));
		
		-- If this is a transactional publication, and the table associated with the article was previously published,
		-- just drop the article and log views and function if they were created.
		IF argRecreateTriggers = 0 AND (HREPL.HasValidTriggers(argTableName, argTableOwner, argTableID, LogInstance) > 0) THEN
			ROLLBACK;
			HREPL.DropView(argArticleView);
			HREPL.DropView(LogView);
			HREPL.DropFunction(FuncName);
			RAISE;
			RETURN;
		END IF;

		-- Otherwise, drop everything that may have been created.
		ROLLBACK;
		HREPL.DropView(argArticleView);
		HREPL.DropView(LogView);
		HREPL.DropLog(ArticleLog);
		HREPL.DropFunction(FuncName);
		HREPL.TableCleanup( argTableOwner, argTableName, argTableID);
		RAISE;
		
END PublishTable;
-----------------------------------------------------------------------------------
--
--  Name:    ValidateRowFilter
--  Purpose: Pre-validate a user supplied row filter 
--
--           (1)  Create a temporary article view identifying those columns
--                that will appear in the article, using the passed filter
--				  clause as the where clause.
--
--           (2)  Execute a select from the view that will never return any rows.
--
--			 (3)  Return success if the select succeeds.  Otherwise, raise error.
--                NOTE:  A special PRAGMA is used to force an error to be raised
--				         for error -932, invalid datatypes.  MSDAORA won't throw this error.
--    
--  Input:
--		 argTableOwner		IN VARCHAR2	Table owner
--	     argTableName		IN VARCHAR2	Table name
--       argColumnMask      IN RAW      Column Mask for article
--       argFilterClause    IN LONG     Filter clause to be validated
--  Output:
--           
--  Notes:   This procedure is used to verify a proposed article row filter.
--
-----------------------------------------------------------------------------------
PROCEDURE ValidateRowFilter
(
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argColumnMask		IN RAW,	
	argFilterClause     IN LONG 
)
AS
	ColCount	NUMBER;
	ViewID		NUMBER;
	ColName		string_tab;
	ColType		string_tab;
	ColMask		number_tab;
	ViewName	VARCHAR2(30);
	SQLCommand 	DBMS_SQL.VARCHAR2S;
	EInconsistentDatatype EXCEPTION;
	PRAGMA EXCEPTION_INIT (EInconsistentDatatype, -00932);
	
BEGIN
	-- Get a sequence number to make temporary view name unique
	SELECT HREPL_Stmt.nextval INTO ViewID from dual;
	ViewName := REPLACE(ArticleTempView, MatchString, TO_CHAR(ViewID));
	
	-- Create PL/SQL tables containing the column names and column types
	-- for the table
	HREPL.PopulateColumnTables (argTableOwner, argTableName, ColCount, ColName, ColType);
	
	-- Create PL/SQL table containing the table columns to be included in the article
	HREPL.SetColumnsIncluded (argColumnMask, ColMask);
	
	-- Create the temporary view
	HREPL.CreateView (argTableName, argTableOwner, ViewName, ColCount, ColName, ColType, ColMask, argFilterClause);

	-- Select from the temporary view.  Some errors are not discovered until
	-- a select against the view is executed.  Add the where clause so the
	-- query doesn't return any rows.
	HREPL_ExecuteCommand('SELECT 1 FROM ' || ViewName || ' WHERE 0 = 1');

	-- Drop the temporary view
	HREPL_ExecuteCommand('DROP VIEW ' || ViewName);
	
EXCEPTION
	WHEN EInconsistentDatatype THEN
		RAISE_APPLICATION_ERROR(EInconsistentDatatypes,StrInconsistentDatatypes);
	WHEN OTHERS THEN RAISE;	
		
END ValidateRowFilter;
-----------------------------------------------------------------------------------
--
--  Name:    UnPublishTable
--  Purpose: UnPublish an Oracle table to SQL Server by    
--           (1) Deleting replication triggers for the table
--           (2) Deleting article entries from HREPL_EVENT and HREPL_POLL
--	         (3) Deleting the entries and dropping the article log table for the table
--           (4) Removing the entry from the table identifying published tables  	
--  Input:
--		 argTableOwner	IN VARCHAR2 Table owner	
--	     argTableName	IN VARCHAR2	Table name
--	     argTableID		IN NUMBER	Table ID
--										0 = SUCCESS
--										NON-ZERO = Error code
--       argArticleView	IN VARCHAR2 View name
--       argDropTriggers IN NUMBER  Flag to drop triggers 1=YES, 0=NO
--		 argTimestamp	IN VARCHAR2 Publisher timestamp
--
--  Output:
--  Notes:   This procedure is used to unpublish an Oracle table to SQL Server.
--	     Once the procedure successsfully executes, change capturing for the
--	     table will stop. The routine will mark the article as having an unpublish
--       pending in HREPL_PublishedTables, but will not drop the views or log table.
--       To prevent problems with ongoing change processing, these drops, if required,
--       will be done during log reader pollend processing, when we can guarantee
--       that the tables and views are not being accessed by the log reader.
--
--	     The table id is used to generate the name of the article log table to drop.
--
--       When UnPublishTable is called for an article in a snapshot publication,
--       the only action that has an effect is dropping the article view.   
--
-----------------------------------------------------------------------------------
PROCEDURE UnPublishTable
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER,
	argArticleView	IN VARCHAR2,
	argDropTriggers IN NUMBER,
	argTimestamp	IN VARCHAR2
)
AS
	ViewDelimiter 	CHAR := '_';
	PosID		NUMBER := 15;
	PosDelimiter	NUMBER;
	ArticleID	NUMBER;
	PubArtID	NUMBER := NULL;
	SQLCommand	VARCHAR2(500); 
BEGIN
	-- Set time of meta data update in HREPL_Publisher
	UPDATE HREPL_Publisher
	SET Publisher_Timestamp = argTimestamp;
	
	-- Obtain the articleID from the aticle view name
	PosDelimiter := INSTR(argArticleView, ViewDelimiter, PosID);
	ArticleID := TO_NUMBER(SUBSTR(argArticleView, PosID, PosDelimiter - PosID));
	
	-- Always drop the article view
	BEGIN
		SQLCommand := 'DROP VIEW ' || argArticleView;
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		-- Ignore errors
		WHEN OTHERS THEN NULL;	
	END;
	
	-- If the article is not in HREPL_PublishedTables, the article publication
	-- is a snapshot publication, and only the view needs to be dropped.
	SELECT DISTINCT Published_ArticleID 
	INTO PubArtID
	FROM HREPL_PublishedTables
	WHERE Published_ArticleID = ArticleID;
	
	IF PubArtID IS NULL THEN
		RETURN;
	END IF;
	
	-- In HREPL_PublishedTables, mark the transactional article as having 
	-- an associated pending drop.  The actual drop of the view will be done 
	-- from the log reader during PollEnd processing.
	BEGIN
		UPDATE HREPL_PublishedTables
		SET    Published_ArticleDropPending = 1
		WHERE Published_TableID = argTableID
		AND Published_Table = argTableName
		AND Published_Owner = argTableOwner
		AND Published_ArticleID = ArticleID;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
	
	-- If the triggers are being dropped as well, in HREPL_PublishedTables
	-- mark the log table as having an associated pending drop.  The actual
	-- drop of the log table will be done from the log reader during PollEnd
	-- processing.
	IF argDropTriggers = 1 THEN
		BEGIN
			UPDATE HREPL_PublishedTables
			SET    Published_LogDropPending = 1
			WHERE Published_TableID = argTableID
			AND Published_Table = argTableName
			AND Published_Owner = argTableOwner;
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;
	END IF;			

	-- Delete entries in HREPL_EVENT that are associated with this article
	BEGIN
		DELETE FROM HREPL_Event
		WHERE EVENT_ARTICLE_ID = ArticleID;
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;		

	-- If flag set, drop triggers as well
	BEGIN 
		IF argDropTriggers = 1 THEN
			HREPL.TableCleanup( argTableOwner, argTableName, argTableID);
		END IF;
	EXCEPTION	
		WHEN OTHERS THEN NULL;
	END;	
		
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN COMMIT;

END UnPublishTable;
-----------------------------------------------------------------------------------
--
--  Name:    GetTableIDs
--  Input:
--	     argTableIDs	IN OUT DMS_SQL.VARCHAR2S
--		 argInstanceIDs	IN OUT DMS_SQL.VARCHAR2S
--  Output:
--  Purpose: Populate Table ID Table with table and instance IDs of published tables
--           
--  Input:
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE GetTableIDs
(
	argTableIDs IN OUT number_tab,
	argInstanceIDs IN OUT number_tab
)
AS
	IDCnt NUMBER := 0;
	CURSOR		ID_cur
	IS
		SELECT DISTINCT Published_TableID,
						Published_LogInstance
		FROM HREPL_PublishedTables
		WHERE Published_LogDropPending = 0;
	 
BEGIN
	FOR ID_rec IN ID_cur

	-- Put into an index-by table the table IDs to be polled 
	LOOP
		IDCnt := IDCnt + 1;
		argTableIDs(IDCnt) := ID_rec.Published_TableID;
		argInstanceIDs(IDCnt) := ID_rec.Published_LogInstance;
	END LOOP;

END GetTableIDs;
-----------------------------------------------------------------------------------
--
--  Name:    SetColumnsIncluded
--  Input:
--       argColumnMask      IN     RAW 		 
--	     argColumnsIncluded	IN OUT number_tab
--  Output:
--  Purpose: Populate argColumnsIncluded Table with column information.  The
--           index of the table represents the column ordinal of the table.
--           A value of 1 indicates that the column is included in the associated 
--           article, and a value of 0 indicates that it is not included.  This
--           table is used when generating article views as well as the triggers
--           and article log. If the column mask is null, it is assumed that all
--           bits are set.
--           
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE SetColumnsIncluded
(
	argColumnMask       IN RAW,
	argColumnsIncluded	IN OUT number_tab 
)
AS
	ColumnMask VARCHAR(256);
	ColVal NUMBER(10,0);
	ColLength NUMBER;
	ColIdx NUMBER;
	ColCnt NUMBER := 1;
	ColChar CHAR;
BEGIN
	IF argColumnMask IS NULL THEN
		SELECT RPAD('F',256,'F') INTO ColumnMask from dual;
	ELSE	
		SELECT RAWTOHEX(argColumnMask) INTO ColumnMask from dual;
	END IF;
		
	ColLength := LENGTH(ColumnMask);
	ColIdx := (ColLength-1)*4 + 1;
	
	LOOP
		ColChar := SUBSTR(ColumnMask, ColCnt, 1);
		ColVal := ToNumFromHex(ColChar);

		FOR BitCnt IN 1..4
		LOOP
			argColumnsIncluded(ColIdx) := 1;
			IF ((FLOOR(ColVal/2))*2 = ColVal) THEN
				argColumnsIncluded(ColIdx) := 0;
			END IF;
			ColVal := FLOOR(ColVal / 2);
			ColIdx := ColIdx + 1;				  
		END LOOP;

		ColCnt := ColCnt + 1;
		ColIdx := (ColLength-ColCnt)*4 +1;
		EXIT WHEN ColCnt > ColLength;
	END LOOP;
END SetColumnsIncluded;
-----------------------------------------------------------------------------------
--
--  Name:    PopulatePollTable
--  Purpose: This procedure populates the Poll Table with entries identifying entries
--	     in article log tables and the event table.
--           
--  Input:
--	     
--  Output:
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
PROCEDURE PopulatePollTable
AS
	TableIDs	number_tab;
	InstanceIDs	number_tab;
	IDCount 	BINARY_INTEGER;
	SQLCommand 	DBMS_SQL.VARCHAR2S;
	SelectCmd 	VARCHAR2(1000);
	LogTable	VARCHAR2(255);
	CurrentPollid	NUMBER;

	CURSOR	table_cur

	IS
		SELECT e.Event_Table_ID, e.Event_Article_ID, e.ROWID
		FROM HREPL_Event e
		WHERE e.Event_Operation = TABLEROWCNT
		AND NOT EXISTS (SELECT * FROM HREPL_POLL t WHERE t.POLL_ROWID = CHARTOROWID(e.ROWID));
 
BEGIN

	-- Lock table HREPL_MUTEX to insure that this code is treated as a critical section.
	LOCK TABLE HREPL_MUTEX IN EXCLUSIVE MODE;
		
	-- Pull the next value from the HREPL_POLLID sequence
	SELECT HREPL_POLLID.nextval INTO CurrentPollid FROM dual;
	
	-- Get the Table IDs of the published tables
	HREPL.GetTableIDs(TableIDs, InstanceIDs);
	IDCount := TableIDs.COUNT;
	
	-- Generate command to obtain consistent set of changes from all of the article log
	-- tables as well as the HREPL_EVENT table, excluding any subscription markers in
	-- HREPL_Event that are pending (Event_Operation = 12).
	SelectCmd :=
				'INSERT INTO HREPL_POLL ( SELECT e.ROWID, :Pollid, ' || 
				'e.Event_Operation, 0, 0 ' ||
				'FROM HREPL_Event e ' ||
				'WHERE e.Event_Operation <> 12 and e.Event_Operation <> 10 and ' ||
				'NOT EXISTS (SELECT * FROM HREPL_POLL t WHERE t.POLL_ROWID = CHARTOROWID(e.ROWID)) ';
				
	HREPL.AddToSQLCommand(SelectCmd, SQLCommand);

	FOR id_ind IN 1 .. IDCount
	LOOP
	
		LogTable := REPLACE( REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(TableIDs(id_ind))),
														 MatchStringY, TO_CHAR(InstanceIDs(id_ind)));
	
		SelectCmd :=
				' UNION ALL SELECT a.ROWID, :Pollid, ' || 
				' 0, 0, ' || TO_CHAR(TableIDs(id_ind)) || 
				' FROM ' || LogTable ||
				' a WHERE NOT EXISTS (SELECT * FROM HREPL_POLL t WHERE t.POLL_ROWID = CHARTOROWID(a.ROWID)) ';
	
		HREPL.AddToSQLCommand(SelectCmd, SQLCommand);
		
	END LOOP;
	
	-- Generate row count for row count requests
	FOR	table_rec
	IN	table_cur

	LOOP
		-- Deposit the row count event as well as row count into the poll table.
		-- Use the article view in the request, so that the count is accurate
		-- for articles having row filters as well.
		
		SelectCmd :=
				' UNION ALL SELECT CHARTOROWID(''' || table_rec.ROWID || '''), :Pollid, ' || 
				' 10, COUNT(*), 0 ' ||
				' FROM HREPL_ARTICLE_' ||  TO_CHAR(table_rec.Event_Article_ID) || '_' || TO_CHAR(table_rec.Event_Table_ID);

		HREPL.AddToSQLCommand(SelectCmd, SQLCommand);

	END LOOP;
	HREPL.AddToSQLCommand(')', SQLCommand);
	
	-- Populate HREPL_POLL with a consistent set of change commands from the article logs
	-- and events from the event table.  Note that for row count events, the counts as well 
	-- are determined as part of the consistent set, so that they are accurate based upon 
	-- the current set of committed changes.
	HREPL.ExecuteCommandTableForPollID(SQLCommand, CurrentPollid);
	
	-- If the SyncDone for an InReconciliation entry in this xactset, is not also in
	-- the xactset, duplicate the InReconciliation command in HREPL_Event, so that
	-- it can be picked up in the next xactset as well.
	FOR PollID IN (SELECT CurrentPollid FROM DUAL)
	LOOP
		INSERT INTO HREPL_EVENT 
		(   SELECT 0, e.Event_Publication_ID, e.Event_Article_ID, e.Event_Table_ID, e.Event_Operation, e.Event_Seq,
			   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
			   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
			FROM HREPL_EVENT e, HREPL_POLL p
			WHERE e.Event_Operation = 11
			AND p.POLL_ROWID = CHARTOROWID(e.ROWID) 
			AND p.POLL_Pollid = PollID.CurrentPollid
			AND   (e.Event_Publication_ID, e.Event_Article_ID, e.Event_Table_ID) NOT IN
			(     SELECT  v.Event_Publication_ID, v.Event_Article_ID, v.Event_Table_ID 
				  FROM HREPL_EVENT v, HREPL_POLL x
				  WHERE v.Event_Operation = 6
				  AND   x.POLL_Pollid = PollID.CurrentPollid
				  AND   x.POLL_ROWID = CHARTOROWID(v.ROWID)
			)
		);
	END LOOP;           
	
	-- NOTE:  This procedure must be treated as a 'critical section'.  The lock on HREPL_MUTEX is used
	--        to enforce the critical section.  Since the lock is released when either a COMMIT or
	--        ROLLBACK executes, no COMMIT or ROLLBACK should appear within the procedure.
	
	-- Commit transaction and exit critical section
	COMMIT;
	
EXCEPTION
		WHEN OTHERS THEN
			ROLLBACK;
			RAISE;	
	
END PopulatePollTable;
-----------------------------------------------------------------------------------
--
--  Name:    SeqFixupForUniqueColumnUpdates
--
--  Purpose: This procedure modifies the article log entries associated with the
--	     update of unique columns, making the associated HREPL_SEQ value of all
--		 equal to the largest HREPL_SEQ value associated with the update statement.
--           
--  Input:
--	     
--  Output:
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
PROCEDURE SeqFixupForUniqueColumnUpdates
AS
	TableIDs	number_tab;
	InstanceIDs	number_tab;
	IDCount 	BINARY_INTEGER;
	SelectCmd	VARCHAR2(500);
	LogTable	VARCHAR2(255);
BEGIN
	-- Get the Table IDs of the published tables
	HREPL.GetTableIDs(TableIDs, InstanceIDs);
	IDCount := TableIDs.COUNT;
  
	FOR id_ind IN 1 .. IDCount
	LOOP
	
		LogTable := REPLACE( REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(TableIDs(id_ind))),
														 MatchStringY, TO_CHAR(InstanceIDs(id_ind)));
	
		SelectCmd :=
		'UPDATE ' || LogTable ||
		' a SET a.HREPL_SEQ = (SELECT max(b.HREPL_SEQ) ' ||
		' FROM ' || LogTable  ||
		' b WHERE a.HREPL_STMT = b.HREPL_STMT) WHERE a.HREPL_STMT > 0';
   	
		HREPL_ExecuteCommand(SelectCmd);
	END LOOP;
	
END SeqFixupForUniqueColumnUpdates;
-----------------------------------------------------------------------------------
--
--  Name:    CreateTableTriggers
--  Purpose: Creating replication triggers for a table
--	     
--  Input:
--		 argTableOwner	IN VARCHAR2 Table owner
--	     argTableName	IN VARCHAR2	Table name
--		 argTableID		IN NUMBER   Table ID
--	     argLogTable	IN VARCHAR2	Log table name
--	     argTriggerStyle	IN NUMBER	Trigger style
--	     argColumnCount	IN NUMBER	Table column count
--	     argColNames	IN string_tab	Column names
--	     argColTypes	IN string_tab	Column types
--	     argColMask		IN number_tab	Column mask
--  Output:
--  Notes:   This procedure is used to create replication triggers for a table.
--
-----------------------------------------------------------------------------------
PROCEDURE CreateTableTriggers
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER,
	argLogTable		IN VARCHAR2,
	argTriggerStyle	IN NUMBER,
	argColumnCount	IN NUMBER,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argColMask		IN number_tab
)
AS
BEGIN
	-- Create a row trigger of the appropriate style for the table
	HREPL.CreateRowTrigger (argTableOwner, argTableName, argTableID, argLogTable, argColumnCount, argColNames,
		argColTypes, argTriggerStyle, argColMask);
	
	-- Create statement level update trigger
	HREPL.CreateStmtTrigger(argTableOwner, argTableName, argTableID);
	
END CreateTableTriggers;
-----------------------------------------------------------------------------------
--
--  Name:    CreateRowTrigger
--  Purpose: Generate an appropriate row level trigger based upon the passed trigger style.
--
--  Input:
--		 argTableOwner	IN VARCHAR2 Table owner
--	     argTableName	IN VARCHAR2	Table name
--		 argTableID		IN NUMBER	Table ID
--	     argLogTable	IN VARCHAR2	Log table name
--	     argColumnCount	IN NUMBER	Column count of published table
--	     argColNames	IN string_tab	Column names
--	     argColTypes	IN string_tab	Column types 
--	     argTriggerStyle	IN NUMBER	Trigger style
--	     argColMask		IN number_tab	Column mask
--  Output:
--  Notes:   This procedure is used to create the supported table trigger.  The SQL
--	     command to create the trigger is accumulated into an index-by table with type
--	     DBMS_SQL.VARCHAR2S so that it may exceed 32767 bytes.  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateRowTrigger
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER,
	argLogTable		IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argTriggerStyle IN NUMBER,
	argColMask		IN number_tab
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
BEGIN
	-- Generate row trigger command table
	HREPL.GenerateRowTrigger(SQLCommand, argTableOwner, argTableName, argTableID, argLogTable, argColumnCount, argColNames,
		argColTypes, argTriggerStyle, argColMask);
		
	-- Execute command table
	HREPL.ExecuteCommandTable(SQLCommand);

	-- Check for create trigger for compilation errors
	HREPL.CheckCompilationErrors(REPLACE(ArticleTriggerRowTemplate, MatchString, TO_CHAR(argTableID)), 'TRIGGER');

END CreateRowTrigger;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateRowTrigger
--  Purpose: To create row trigger based upon the pased trigger style
--	     
--  Input:
--	     argCommandTable	IN OUT DBMS_SQL.VARCHAR2S Command table
--		 argTableOwner	IN VARCHAR2 Table owner 
--	     argTableName	IN VARCHAR2	Table name
--	     argTableID		IN NUMBER	Table ID
--		 argLogTable	IN VARCHAR2 Log table name
--	     argColumnCount	IN NUMBER	Column count of published table
--	     argColNames	IN string_tab	Column names
--	     argColTypes	IN string_tab	Column types
--	     argTriggerStyle	IN NUMBER	Trigger style
--	     argColMask		IN number_tab	Column mask
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateRowTrigger
(
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S,
	argTableOwner	IN VARCHAR2, 
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER,
	argLogTable		IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argColNames	IN string_tab,
	argColTypes	IN string_tab,
	argTriggerStyle IN NUMBER,
	argColMask		IN number_tab
)
AS
	Trigger		VARCHAR2(4000);
	KeyList		string_tab;
	KeyValue	string_tab;
	GATEWAY BOOLEAN := argTriggerStyle IN (1, 2);
	FirstColumn BOOLEAN := TRUE;
	
BEGIN
	Trigger :=
 
	'CREATE OR REPLACE TRIGGER ' || REPLACE(ArticleTriggerRowTemplate, MatchString, TO_CHAR(argTableID)) ||
	' AFTER DELETE OR INSERT OR UPDATE OF ';
	HREPL.AddToSQLCommand(Trigger, argCommandTable);

    FOR col_ind IN 1 .. argColumnCount
   	LOOP
   	    IF argColMask(col_ind) = 1 THEN
   	        IF NOT FirstColumn = TRUE THEN
   	   	        HREPL.AddToSQLCommand(', "' || argColNames(col_ind) || '"', argCommandTable);
   	   	    ELSE
   	   	        FirstColumn := FALSE;
   	   	        HREPL.AddToSQLCommand('  "' || argColNames(col_ind) || '"', argCommandTable);
   	   	    END IF;
   	   	END IF;        
	END LOOP;

	Trigger := ' ON "' || argTableOwner || '"."' || argTableName || '" ' ||
	'FOR EACH ROW ';
	HREPL.AddToSQLCommand(Trigger, argCommandTable);
	
	Trigger :=
	
	' DECLARE ' ||
	   'Seq NUMBER := 0; ' ||
	   'Stmt NUMBER; ' ||
	   'Op1  NUMBER := 0; ' ||
	   'Op2  NUMBER := 0; ' ||
	   'EntryTime  NUMBER := round(to_number((SYSDATE - HREPL.BaseTimeT) * 86400)); ' ||
	'BEGIN IF HREPL.SQLORIGINATOR = FALSE THEN BEGIN ';

	HREPL.AddToSQLCommand(Trigger, argCommandTable);
	
    Trigger := 
	   'SELECT HREPL_SEQ.nextval INTO Seq from dual; IF UPDATING AND (';
	HREPL.AddToSQLCommand(Trigger, argCommandTable);

	-- Insert primary key list into SQL command
	HREPL.GeneratePKClause (argCommandTable, argTableOwner, argTableName);

	Trigger :=                    ') THEN ' ||

	'SELECT HREPL_STMT.CURRVAL INTO Stmt from dual; ' ||
	'Op1 := ''' || DeleteUnqOp || '''; ' ||
	'OP2 := ''' || InsertUnqOp || '''; ' ||	

   	'ELSE ';
	HREPL.AddToSQLCommand(Trigger, argCommandTable);

	Trigger :=
	   	'IF INSERTING THEN ' ||
	      	    'Op2 := ''' || InsertOp || '''; ' ||
	   	'ELSIF DELETING THEN ' ||
	      	    'Op1 := ''' || DeleteOp || '''; ' ||
	   	'ELSE ' ||
	      	    'Op1 := ''' || UpdateOldOp || '''; ' ||
	      	    'Op2 := ''' || UpdateNewOp || '''; ' ||
	   	'END IF;';
	HREPL.AddToSQLCommand(Trigger, argCommandTable);
	
    HREPL.AddToSQLCommand('END IF; ', argCommandTable);
    
	-- Generate insert command for delete and old values from updates, if needed 
	HREPL.GenerateValueClause (argCommandTable, 'old', argColumnCount, argColNames, argColTypes, argTriggerStyle,
		UpdateAndDeleteCommand, argTableID, argLogTable, argTableOwner, argTableName, argColMask);
		
	-- Generate insert command for inserts and new values from updates 
	HREPL.GenerateValueClause (argCommandTable, 'new', argColumnCount, argColNames, argColTypes, argTriggerStyle,
		NewCommand, argTableID, argLogTable, argTableOwner, argTableName, argColMask);

	-- Terminate the SQL command
	HREPL.AddToSQLCommand(' END; END IF; END;', argCommandTable);

 	
END GenerateRowTrigger;
-----------------------------------------------------------------------------------
--
--  Name:    CreateStmtTrigger
--  Purpose: To create statement trigger for the support of primary key update
--
--  Input:
--		 argTableOwner	IN VARCHAR2 Table owner
--	     argTableName	IN VARCHAR2	Table name
--	     argTableID		IN NUMBER	Table ID
--  Output:
--  Notes:   This procedure is used to create the supported table trigger.  The SQL
--	     command to create the trigger is accumulated into an index-by table with type
--	     DBMS_SQL.VARCHAR2S so that it may exceed 32767 bytes.  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateStmtTrigger
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
BEGIN
	-- Generate stmt trigger command table
	HREPL.GenerateStmtTrigger(SQLCommand, argTableOwner, argTableName, argTableID);
	
	-- Execute command table
	HREPL.ExecuteCommandTable(SQLCommand);

	-- Check for create trigger for compilation errors 
	HREPL.CheckCompilationErrors(REPLACE(ArticleTriggerStmtTemplate, MatchString, TO_CHAR(argTableID)), 'TRIGGER');
 
END CreateStmtTrigger;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateStmtTrigger
--  Purpose: To create statement trigger for the support of primary key update
--	     	     
--  Input:
--  	 argCommandTable	IN OUT 		DBMS_SQL.VARCHAR2S,
--		 argTableOwner	IN VARCHAR2 Table owner 
--	     argTableName	IN VARCHAR2	Table name
--	     argTableID		IN NUMBER	Table ID
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateStmtTrigger
(
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S,
	argTableOwner	IN VARCHAR2, 	 
	argTableName	IN VARCHAR2,
	argTableID	IN NUMBER
)
AS
	SQLCommand	VARCHAR2(500);
			
BEGIN
	SQLCommand :=
 		'CREATE OR REPLACE TRIGGER ' || REPLACE(ArticleTriggerStmtTemplate, MatchString, TO_CHAR(argTableID)) ||
		' BEFORE UPDATE OF ';

	HREPL.AddToSQLCommand(SQLCommand, argCommandTable);

	-- Insert primary key list into SQL command
	HREPL.GeneratePKList (argCommandTable, argTableOwner, argTableName);

	SQLCommand := ' ON "' || argTableOwner || '"."' || argTableName || '" ' ||
		'DECLARE Stmt number; ' ||
		'BEGIN ' ||
		'IF HREPL.SQLORIGINATOR = FALSE THEN ' ||
			'SELECT HREPL_STMT.nextval INTO Stmt FROM dual; ' ||
		'END IF; ' ||
		'END;';

	HREPL.AddToSQLCommand(SQLCommand, argCommandTable);
 
END GenerateStmtTrigger;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateValueClause
--  Purpose: Add value clause to SQL command table
--	     
--  Input:
--	     argCommandTable	IN OUT DBMS_SQL.VARCHAR2S	SQL command table
--	     argType		IN VARCHAR2		'old', 'new'
--	     argColumnCount	IN NUMBER		Column count of table
--	     argColNames	IN string_tab	Columns names table
--	     argColTypes	IN string_tab	Column types table	
--	     argTriggerStyle	IN NUMBER	Trigger style
--	     argCommand		IN INTEGER		Command type
--	     argTableID		IN NUMBER		Table ID
--		 argLogTable	IN VARCHAR2		Log table name
--		 argTableOwner	IN VARCHAR2		Table owmer
--	     argTableName   IN VARCHAR2		Table name
--	     argColMask     IN number_tab	Column mask
--  Output:
--  Notes:   This procedure is used to add the table specific portion of the
--	     value clause to the statement level create trigger command
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateValueClause
(
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S,
	argType			IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argTriggerStyle IN NUMBER,
	argCommand		IN INTEGER,
	argTableID		IN NUMBER,
	argLogTable		IN	VARCHAR2,
	argTableOwner	IN VARCHAR2,
	argTableName    IN VARCHAR2,
	argColMask		IN number_tab
)
AS
	UPKONLY		BOOLEAN := argTriggerStyle = 1;
	DPKONLY		BOOLEAN := argTriggerStyle = 1;
	GATEWAY		BOOLEAN := argTriggerStyle IN (1, 2);
	GATEWAYXCALL BOOLEAN := argTriggerStyle IN (2);
	ORACLE	    BOOLEAN := argTriggerStyle = 0;
	ColumnMatch 	NUMBER;
	ValueClause   	VARCHAR2(20000);
	InsertCommand 	VARCHAR2(20000);
	DotLoc		INTEGER;
		
BEGIN
	-- If Update and Delete command, or Delete command, and primary keys on delete or
	-- Update command and primary keys on update, only retrieve key values	
	IF (((argCommand = UpdateAndDeleteCommand) AND DPKONLY) OR
	    ((argCommand = DeleteCommand)          AND DPKONLY) OR
	    ((argCommand = UpdateCommand)          AND UPKONLY)) THEN
		
		IF (argCommand = UpdateAndDeleteCommand) THEN
			InsertCommand := 'IF ((UPDATING AND (Stmt IS NOT NULL)) OR DELETING) ';
		ELSIF (argCommand = DeleteCommand) THEN
	 		InsertCommand := 'IF DELETING ';
		ELSE
			InsertCommand := 'IF UPDATING ';
		END IF;
		HREPL.AddToSQLCommand(InsertCommand, argCommandTable);

		InsertCommand := ' THEN INSERT INTO ' ||argLogTable ||
			' ( HREPL_SEQ, HREPL_STMT, HREPL_OPERATION, HREPL_POLLID, HREPL_ENTRYTIME ';
		HREPL.AddToSQLCommand(InsertCommand, argCommandTable);

		ValueClause := ' VALUES( Seq, Stmt, Op1, 0, EntryTime ';
			
		InsertCommand := ' ';
		FOR col_ind IN 1 .. argColumnCount
   		LOOP
			-- Determine whether the column is a primary key 
			SELECT COUNT(*) INTO ColumnMatch
			FROM all_cons_columns c, all_constraints s
			WHERE
				c.owner = s.owner AND
				c.constraint_name = s.constraint_name AND
				c.table_name = s.table_name AND
				s.table_name = argTableName AND
				s.owner = argTableOwner AND
				c.column_name = argColNames(col_ind) AND
				s.constraint_type = 'P';
		
			IF ColumnMatch = 1 THEN
				InsertCommand  := InsertCommand  || ', "' || argColNames(col_ind) || '"';		
				ValueClause := ValueClause || ', :' || argType || '."' || argColNames(col_ind) || '"';
			END IF;
		
		END LOOP;
		InsertCommand := InsertCommand || ')' || ValueClause || '); END IF;';
		HREPL.AddToSQLCommand (InsertCommand, argCommandTable);

	-- Otherwise generate insert command using the entire list of columns	
	ELSE
		IF (argCommand = UpdateAndDeleteCommand) THEN
			InsertCommand := 'IF UPDATING OR DELETING ' ;
		ELSIF (argCommand = DeleteCommand) THEN
	 		InsertCommand := 'IF DELETING ';
		ELSIF (argCommand = UpdateCommand) THEN
			InsertCommand := 'IF UPDATING ';
		ELSE
			InsertCommand :=  ' IF UPDATING OR INSERTING ';
		END IF;	
		HREPL.AddToSQLCommand(InsertCommand, argCommandTable);
						
		IF (argCommand = UpdateAndDeleteCommand) THEN
			InsertCommand := ' THEN INSERT INTO ' ||
			argLogTable || ' VALUES ( Seq, Stmt, Op1, 0, EntryTime ';
		ELSIF (argCommand = DeleteCommand) THEN
	 		InsertCommand := ' THEN INSERT INTO ' || argLogTable ||
			' VALUES ( Seq, Stmt, Op1, 0, EntryTime ';
		ELSIF (argCommand = UpdateCommand) THEN
			InsertCommand := ' THEN INSERT INTO ' || argLogTable ||
			' VALUES ( Seq, Stmt, Op1, 0, EntryTime ';
		ELSE
			InsertCommand :=  ' THEN INSERT INTO ' ||
			argLogTable || ' VALUES ( Seq, Stmt, Op2, 0, EntryTime ';
		END IF;	 
		HREPL.AddToSQLCommand(InsertCommand, argCommandTable);

		FOR col_ind IN 1 .. argColumnCount
   		LOOP
			-- If the trigger style is one that supports the non-transactional
			-- treatment of LOB data, then the value stored in the article
			-- log table for the column is the ROWID value rather than the
			-- column value.
			IF (argColMask(col_ind) = 1) THEN
				IF argColTypes(col_ind) IN ('LONG', 'LONG RAW', 'CLOB', 'NCLOB', 'BLOB', 'BFILE') THEN
					InsertCommand := ', :' || argType || '.ROWID';
				ELSE
					InsertCommand := ', :' || argType || '."' || argColNames(col_ind) || '"';
				END IF;
				HREPL.AddToSQLCommand (InsertCommand, argCommandTable);
			END IF;	
		
		END LOOP;
		HREPL.AddToSQLCommand('); END IF;', argCommandTable);

	END IF;
			 
END GenerateValueClause;
-----------------------------------------------------------------------------------
--
--  Name:    GeneratePKClause
--  Purpose: Add list of primary Key columns to SQL command
--	     
--  Input:
--	     argCommandTable	IN OUT DBMS_SQL.VARCHAR2S	SQL command table
--		 argTableOwner	IN	VARCHAR2		Name of table owner
--	     argTableName	IN  VARCHAR2		Name of published table
--  Output:
--  Notes:   This procedure is used to insert a list of primary key columns into
--	     a SQL command
--
-----------------------------------------------------------------------------------
PROCEDURE GeneratePKClause
(
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S,
	argTableOwner	IN VARCHAR2,	
	argTableName	IN VARCHAR2
)
AS
	PKClause	VARCHAR2(100);
	DotLoc		INTEGER;
	FirstTime	BOOLEAN;

	CURSOR		col_cur
		(OwnerName	IN VARCHAR2,
		 TableName	IN VARCHAR2)
	IS
	    SELECT DISTINCT column_name FROM (
		SELECT c.column_name
		FROM all_cons_columns c, all_constraints s
		WHERE
			c.owner = s.owner AND
			c.constraint_name = s.constraint_name AND
			c.table_name = s.table_name AND
			s.table_name = TableName AND
			s.owner = OwnerName AND
			((s.constraint_type = 'P') OR (s.constraint_type = 'U'))
		UNION
		SELECT c.column_name
		FROM all_ind_columns c, all_indexes s
		WHERE
			c.table_owner = s.table_owner AND
			c.table_name = s.table_name AND
			c.index_name = s.index_name AND
			c.index_owner = s.owner AND
			s.table_name = TableName AND
			s.table_owner = OwnerName AND
			s.uniqueness = 'UNIQUE' AND
			s.INDEX_TYPE = 'NORMAL');
	
BEGIN
	FirstTime := TRUE;
	
	-- Extract primary key column information from the data dictionary
	FOR col_rec IN
		col_cur (argTableOwner, argTableName)
	LOOP
		-- Generate list of primary keys
		IF FirstTime THEN
			PKClause := ':old."' || col_rec.column_name || '" != :new."' || col_rec.column_name || '"';
			FirstTime := false;
		ELSE
			PKClause := ' OR :old."' || col_rec.column_name || '" != :new."' || col_rec.column_name || '"';
		END IF;

		HREPL.AddToSQLCommand (PKClause, argCommandTable);	

	END LOOP;
	
END GeneratePKClause;
-----------------------------------------------------------------------------------
--
--  Name:    GeneratePKList
--  Purpose: Add list of primary Key columns to STMT trigger
--	     
--  Input:
--	     argCommandTable	IN OUT DBMS_SQL.VARCHAR2S	SQL command table
--		 argTableOwner	IN	VARCHAR2		Name of table owner
--	     argTableName	IN  VARCHAR2		Name of published table
--  Output:
--  Notes:   This procedure is used to insert a list of primary key columns into
--	     a the STMT trigger
--
-----------------------------------------------------------------------------------
PROCEDURE GeneratePKList
(
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S,
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2
)
AS
	PKList		VARCHAR2(50);
	DotLoc		INTEGER;
	FirstTime	BOOLEAN;

	CURSOR		col_cur
		(OwnerName	IN VARCHAR2,
		 TableName	IN VARCHAR2)
	IS
	    SELECT DISTINCT column_name FROM (
		SELECT c.column_name
		FROM all_cons_columns c, all_constraints s
		WHERE
			c.owner = s.owner AND
			c.constraint_name = s.constraint_name AND
			c.table_name = s.table_name AND
			s.table_name = TableName AND
			s.owner = OwnerName AND
			((s.constraint_type = 'P') OR (s.constraint_type = 'U'))
		UNION
		SELECT c.column_name
		FROM all_ind_columns c, all_indexes s
		WHERE
			c.table_owner = s.table_owner AND
			c.table_name = s.table_name AND
			c.index_name = s.index_name AND
			c.index_owner = s.owner AND
			s.table_name = TableName AND
			s.table_owner = OwnerName AND
			s.uniqueness = 'UNIQUE' AND
			s.INDEX_TYPE = 'NORMAL');
	
BEGIN
	FirstTime := TRUE;
	
	-- Extract primary key column information from the data dictionary
	FOR col_rec IN
		col_cur (argTableOwner, argTableName)
	LOOP
		-- Generate list of primary keys
		IF FirstTime THEN
			PKList := '"' || col_rec.column_name || '"';
			FirstTime := false;
		ELSE
			PKList := ', "' || col_rec.column_name || '"';
		END IF;

		HREPL.AddToSQLCommand (PKList, argCommandTable);	

	END LOOP;
	
END GeneratePKList;
-----------------------------------------------------------------------------------
--
--  Name:    CreateTableLog
--  Purpose: Creating replication article log table for a published table
--	     
--  Input:
--	     argLogTable	IN VARCHAR2		Log table name
--	     argTriggerStyle	IN NUMBER(10)	Trigger style
--	     argColCount	IN NUMBER	Column count
--	     argColNames	IN string_tab	Column names table
--	     argColTypes	IN string_tab	Column types table
--	     argColMask  	IN number_tab	Column mask			
--  Output:
--  Notes:   	  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateTableLog
(
	argLogTable		IN VARCHAR2,
	argTriggerStyle		IN NUMBER,
	argColCount		IN NUMBER,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argColMask	    IN number_tab
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
BEGIN
	-- Generate the command to create the article log table
	HREPL.GenerateCreateCommand (argLogTable, argColCount, SQLCommand, argColNames, argColTypes, argTriggerStyle, argColMask);

	-- Execute the command table
	HREPL.ExecuteCommandTable(SQLCommand);

END CreateTableLog;
-----------------------------------------------------------------------------------
--
--  Name:    CreateTableIndex
--  Purpose: Creating replication article log table index
--	     
--  Input:
--	     argLogTable	IN VARCHAR2		Log table name
--  Output:
--  Notes:   	  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateTableIndex
(
	argLogTable		IN VARCHAR2
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
BEGIN
	-- Generate the command to create the article log table index on HREPL_STMT
	HREPL.GenerateIndexCommand (argLogTable, SQLCommand);

	-- Execute the command table
	HREPL.ExecuteCommandTable(SQLCommand);

END CreateTableIndex;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateCreateCommand
--  Purpose: Creating replication article log table for a published table
--	     
--  Input:
--	     argLogTable	IN VARCHAR2			Log table name
--	     argColumnCount	IN NUMBER			Column count of published table
--	     argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S	SQL command table for creating article log
--	     argColNames	IN string_tab			Column names table
--	     argColTypes	IN string_tab			Column types table
--	     argTriggerStyle	IN NUMBER			Trigger stype
--	     argColMask  	IN number_tab			Column mask		
--  Output:
--  Notes:   This procedure is used to create the article log table.
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateCreateCommand
(
	argLogTable		IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argTriggerStyle	IN NUMBER,
	argColMask	    IN number_tab
)
AS
	GATEWAY BOOLEAN := argTriggerStyle IN (1, 2);
	ORACLE BOOLEAN := argTriggerStyle = 0;
	GATEWAYXCALL BOOLEAN := argTriggerStyle IN (2);
	ColumnDescription	VARCHAR2(250);	
BEGIN
	-- Generate the command to create the article log table 
	ColumnDescription := 

		'CREATE TABLE "' || argLogTable ||
		      '" (HREPL_SEQ NUMBER NULL, '            			||
			'HREPL_STMT NUMBER NULL, '		  					||
			'HREPL_OPERATION NUMBER NOT NULL, '					||
			'HREPL_POLLID NUMBER NULL, '						||
			'HREPL_ENTRYTIME NUMBER NULL';                                          

	HREPL.AddToSQLCommand(ColumnDescription, argSQLCommand);
	
	-- Generate columns specific to published table
	-- Use column name and type information from published table  
	FOR col_ind IN 1 .. argColumnCount
   	LOOP
		-- If the trigger style is one which supports the non-transactional
		-- treatment of LOB data, the column type for the article log Column must
		-- be ROWID rather than the corresponding LOB type from the published
		-- table.
		IF (argColMask(col_ind) = 1) THEN
			IF (argColTypes(col_ind) IN ('LONG', 'LONG RAW', 'CLOB', 'NCLOB', 'BLOB', 'BFILE')) THEN
				ColumnDescription := ', "' || argColNames(col_ind) ||
				'"   ' || 'ROWID'  || ' NULL';
			ELSE
				ColumnDescription := ', "' || argColNames(col_ind) ||
				'"   ' || argColTypes(col_ind)  || ' NULL';
			END IF;
		
			-- Add column description to SQL command
			HREPL.AddToSQLCommand(ColumnDescription, argSQLCommand);
		END IF;	

	END LOOP;

	-- Terminate SQL command
	HREPL.AddToSQLCommand (' ) LOGGING ', argSQLCommand);

END GenerateCreateCommand;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateIndexCommand
--  Purpose: Creating replication article log table index 
--
--  Input:
--	     argLogTable	IN VARCHAR2			Log table name
--	     argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S	SQL command table for creating article log
--  Output:
--  Notes:   This procedure is used to create the article log table index on HREPL_STMT
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateIndexCommand
(
	argLogTable		IN VARCHAR2,
	argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S
)
AS
	IndexDescription	VARCHAR2(250);
BEGIN
	-- Generate the command to create the article log table index on HREPL_STMT 
	IndexDescription := 
		'CREATE INDEX "' || argLogTable || 'X" ON "' || argLogTable || '"(HREPL_STMT) ';  
	HREPL.AddToSQLCommand(IndexDescription, argSQLCommand);

END GenerateIndexCommand;
-----------------------------------------------------------------------------------
--
--  Name:    CreateGetLongLenFunction
--  Purpose: Creating HREPL_GETLONGLEN function for an article
--	     
--  Input:
--	     argArticleID		IN NUMBER		Article ID
--	     argTableID			IN NUMBER		Table ID
--	 	 argArticleInstance IN NUMBER		Article Instance
--		 argTableOwner		IN VARCHAR2		Table owner
--		 argTableName		IN VARCHAR2		Table name
--	     argColCount		IN NUMBER		Column count
--	     argColNames		IN string_tab	Column names table
--	     argColTypes		IN string_tab	Column types table
--	     argColMask  		IN number_tab	Column mask			
--  Output:
--  Notes:   	  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateGetLongLenFunction
(
	argArticleID		IN NUMBER,
	argTableID  		IN NUMBER,
	argArticleInstance	IN NUMBER,
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argColumnCount		IN NUMBER,
	argColNames			IN string_tab,
	argColTypes			IN string_tab,
	argColMask			IN number_tab
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
	FuncName	VARCHAR2(30);
BEGIN
	-- Generate the function declaration 
	FuncName     :=	REPLACE(ArticleFuncLongLen, MatchString, TO_CHAR(argArticleID));
	FuncName     :=	REPLACE(FuncName, MatchStringY, TO_CHAR(argTableID));
	FuncName     :=	REPLACE(FuncName, MatchStringZ, TO_CHAR(argArticleInstance));
	
	-- Locate the LONG or LONG RAW column, if present in the article  
	FOR col_ind IN 1 .. argColumnCount
   	LOOP
		IF (argColMask(col_ind) = 1) AND
		   ((argColTypes(col_ind) = 'LONG') OR (argColTypes(col_ind) = 'LONG RAW'))
		THEN
			-- Drop function, ignore error
			HREPL.DropFunction(FuncName);
	
			-- Generate the command to create the article log table
			HREPL.GenerateFunctionGetLongLen (FuncName, argTableOwner, argTableName,
				col_ind, SQLCommand, argColNames, argColTypes, argColMask);

			-- Execute the command table
			HREPL.ExecuteCommandTable(SQLCommand);
			
		END IF;
	END LOOP;		

END CreateGetLongLenFunction;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateFunctionGetLongLen
--  Purpose: Creating function to query for length of long
--	     
--  Input:
--	 	 argFuncName		IN NUMBER			Function name
--		 argTableOwner		IN VARCHAR2			Table owner
--		 argTableName		IN VARCHAR2			Table name
--	     argColInd			IN NUMBER			Column index of long column
--	     argSQLCommand		IN OUT DBMS_SQL.VARCHAR2S	SQL command table for creating function
--	     argColNames		IN string_tab		Column names table
--	     argColTypes		IN string_tab		Column types table
--	     argColMask  		IN number_tab		Column mask		
--  Output:
--  Notes:   This procedure is used to create the article log table.
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateFunctionGetLongLen
(
	argFuncName			IN VARCHAR2,
	argTableOwner		IN VARCHAR2,
	argTableName		IN VARCHAR2,
	argColInd			IN NUMBER,
	argSQLCommand		IN OUT DBMS_SQL.VARCHAR2S,
	argColNames			IN string_tab,
	argColTypes			IN string_tab,
	argColMask			IN number_tab
)
AS
	FuncBody	VARCHAR2(500);	
BEGIN
	FuncBody := 
		'CREATE FUNCTION ' || argFuncName || '(ROW ROWID)'			||
		'RETURN NUMBER '                                            ||
		'AS '                                                       ||
		'BEGIN ';
	HREPL.AddToSQLCommand(FuncBody, argSQLCommand);
			
	IF (argColTypes(argColInd) = 'LONG') THEN
		FuncBody := 'DECLARE LONG_VAR LONG; ';
	ELSE
		FuncBody := 'DECLARE LONG_VAR LONG RAW; ';
	END IF;
	HREPL.AddToSQLCommand(FuncBody, argSQLCommand);
			
	FuncBody :=	
		'BEGIN '                                                             ||
			'SELECT "' || argColNames(argColInd) || '" INTO LONG_VAR '       ||
			'FROM "' || argTableOwner || '"."' || argTableName || '" '       ||
			'WHERE "' || argTableOwner || '"."' || argTableName ||
			'".ROWID = row; ';
	HREPL.AddToSQLCommand(FuncBody, argSQLCommand);
			
	IF (argColTypes(argColInd) = 'LONG') THEN
		FuncBody := 
			'RETURN LENGTH(LONG_VAR); '                                     ||
			'END; '                                                         ||
			'END; ';
	ELSE
		FuncBody := 
			'RETURN LENGTH(LONG_VAR)/2; '                                   ||
			'END; '                                                         ||
			'END; ';
	END IF;
	HREPL.AddToSQLCommand(FuncBody, argSQLCommand);

END GenerateFunctionGetLongLen;
-----------------------------------------------------------------------------------
--
--  Name:    AlterTableLog
--  Purpose: Modify article log tablespace
--	     
--  Input:
--	     argTableID		IN NUMBER	Table ID
--       argTablespace	IN VARCHAR2	Tablespace name
--
--  Output:
--  Notes:   	  
--
-----------------------------------------------------------------------------------
PROCEDURE AlterTableLog
(
	argTableID		IN NUMBER,
	argTableSpace	IN VARCHAR2
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
	ArticleLog	VARCHAR2(255); 
	LogInstance	NUMBER;
BEGIN
	SELECT DISTINCT Published_LogInstance
	INTO LogInstance
	FROM HREPL_PublishedTables
	WHERE Published_TableID = argTableID
	AND Published_LogDropPending = 0;
	
	ArticleLog := REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(argTableID));
	ArticleLog := REPLACE(ArticleLog, MatchStringY, TO_CHAR(LogInstance));

	-- Generate the command to create the article log table
	HREPL.AddToSQLCommand('ALTER TABLE ' || ArticleLog ||
							' MOVE TABLESPACE ' || argTableSpace, SQLCommand);
	
	-- Execute the command table
	HREPL.ExecuteCommandTable(SQLCommand);

END AlterTableLog;
-----------------------------------------------------------------------------------
--
--  Name:    CreateView
--  Purpose: Creating replication article view for a published table
--	     
--  Input:
--	     argTableName	IN VARCHAR2		Table name
--	     argTableOwner	IN VARCHAR2		Table owner
--	     argViewName	IN VARCHAR2		View name
--	     argColCount	IN NUMBER	Column count
--	     argColNames	IN string_tab	Column names table
--	     argColTypes	IN string_tab	Column types table
--	     argColMask  	IN number_tab	Column mask
--	     argFilterClause IN LONG		Row filter			
--  Output:
--  Notes:   	  
--
-----------------------------------------------------------------------------------
PROCEDURE CreateView
(
	argTableName	IN VARCHAR2,
	argTableOwner	IN VARCHAR2,
	argViewName		IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argColMask	    IN number_tab,
	argFilterClause IN LONG
)
AS
	SQLCommand	DBMS_SQL.VARCHAR2S;
BEGIN
	-- Generate the command to create a view
	HREPL.GenerateView (argTableName, argTableOwner, argViewName, argColumnCount, SQLCommand, argColNames, argColTypes, argColMask, argFilterClause);

	-- Execute the command table
	HREPL.ExecuteCommandTable(SQLCommand);

END CreateView;
-----------------------------------------------------------------------------------
--
--  Name:    GenerateView
--  Purpose: Creating a view for a published table
--	     
--  Input:
--	     argTableName	IN VARCHAR2				Table name
--	     argTableOwner	IN VARCHAR2				Table owner
--	     argViewName	IN VARCHAR2				View name
--	     argColumnCount	IN NUMBER			Column count of published table
--	     argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S	SQL command table for creating article log
--	     argColNames	IN string_tab			Column names table
--	     argColTypes	IN string_tab			Column types table
--	     argColMask  	IN number_tab			Column mask	
--	     argFilterClause IN LONG				Row filter		
--  Output:
--  Notes:   This procedure is used to create a view for the table.
--
-----------------------------------------------------------------------------------
PROCEDURE GenerateView
(
	argTableName	IN VARCHAR2,
	argTableOwner	IN VARCHAR2,
	argViewName		IN VARCHAR2,
	argColumnCount	IN NUMBER,
	argSQLCommand	IN OUT DBMS_SQL.VARCHAR2S,
	argColNames		IN string_tab,
	argColTypes		IN string_tab,
	argColMask	    IN number_tab,
	argFilterClause IN LONG
)
AS
	LOGVIEW BOOLEAN := argViewName LIKE 'HREPL_LOG%';
	FirstColumn BOOLEAN := TRUE;
	ColumnDescription	VARCHAR2(250);
	
BEGIN
	-- Generate the command to create the article view
	ColumnDescription := 'CREATE VIEW ' || argViewName || ' AS SELECT ';
	HREPL.AddToSQLCommand(ColumnDescription, argSQLCommand);
	
	-- Generate columns specific to published table
	-- Use column name and type information from published table  
	FOR col_ind IN 1 .. argColumnCount
   	LOOP
		IF (argColMask(col_ind) = 1) THEN
			IF NOT FirstColumn = TRUE THEN
				ColumnDescription := ', l."' || argColNames(col_ind) || '"';
			ELSE
				FirstColumn := FALSE;
				-- If generating the log view, include additional row entries for the log in the view
				IF LOGVIEW = TRUE THEN
					ColumnDescription :=  ' l."HREPL_SEQ", l."HREPL_STMT", l."HREPL_OPERATION", l."HREPL_POLLID", l."HREPL_ENTRYTIME", "' || argColNames(col_ind) || '"'; 
				ELSE
					ColumnDescription := 'l."' || argColNames(col_ind) || '"';
				END IF;	
			END IF;	
			-- Add column description to SQL command
			HREPL.AddToSQLCommand(ColumnDescription, argSQLCommand);
		END IF;	

	END LOOP;
	
	-- Add from clause to SQL command
	HREPL.AddToSQLCommand(' FROM "' || argTableOwner || '"."' || argTableName || '" l ', argSQLCommand);

	-- Incorporate the filter clause into the views.
	IF argFilterClause IS NOT NULL THEN
		HREPL.AddToSQLCommand(' WHERE ' || argFilterClause, argSQLCommand);
	END IF;	

END GenerateView;
-----------------------------------------------------------------------------------
--
--  Name:    AddToSQLCommand
--  Purpose: Transfer string to SQLCommand table
--	     
--  Input:
--	     argString		IN VARCHAR2			String to add to command table
--	     argCommandTable	IN OUT DBMS_SQL.VARCHAR2S	command table
--  Output:
--  Notes:   This procedure is used to assemble a SQL command into a command table
--
-----------------------------------------------------------------------------------
PROCEDURE AddToSQLCommand
(
	argString	IN VARCHAR2,
	argCommandTable	IN OUT DBMS_SQL.VARCHAR2S
)
AS
	StringLength	BINARY_INTEGER;
	StartPosition	BINARY_INTEGER := 1;	
BEGIN
	IF argString IS NOT NULL THEN
		StringLength := LENGTH(argString);
	
		LOOP
			argCommandTable(NVL(argCommandTable.LAST, 0) + 1) :=
				NextRow(argString, StartPosition, StringLength);
			EXIT WHEN StartPosition > StringLength;
		END LOOP;

	END IF;

END AddToSQLCommand;
-----------------------------------------------------------------------------------
--
--  Name:    NextRow
--  Purpose: Extract up to the next MAXLEN characters
--	     
--  Input:
--	     argStringIn 	IN VARCHAR2,
--	     argStartInOut 	IN OUT BINARY_INTEGER,
--	     argLenIn		IN BINARY_INTEGER
--  Output:
--
-----------------------------------------------------------------------------------
FUNCTION NextRow
(
	argStringIn 	IN VARCHAR2,
	argStartInOut	IN OUT BINARY_INTEGER,
	argLenIn	IN BINARY_INTEGER
) 
RETURN VARCHAR2 

AS
	StartPosition	BINARY_INTEGER := argStartInOut;	
BEGIN
	argStartInOut := LEAST(argLenIn + 1, argStartInOut + MAXLEN);
	RETURN SUBSTR(argStringIn, StartPosition, MAXLEN);
	
END NextRow;
-----------------------------------------------------------------------------------
--
--  Name:    PopulateColumnTables
--  Purpose: Populate the column tables containing the column names and
--	     types of the published table. 
--	     
--  Input:
--		 argTableOwner	IN VARCHAR2		Table owner
--	     argTableName	IN VARCHAR2		Table name
--	     argColCount	OUT NUMBER		Column count of published table
--	     argColNames	IN OUT string_tab	Column names
--	     argColTypes	IN OUT string_tab	column type strings		
--  Output:
--  Notes:   This procedure is used to create the article log table.
--
-----------------------------------------------------------------------------------
PROCEDURE PopulateColumnTables
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argColCount	OUT NUMBER,
	argColNames	IN OUT string_tab,
	argColTypes	IN OUT string_tab
)
AS
	TypeNM		VARCHAR2(128);
	DotLoc		INTEGER;
	ColCount	NUMBER;

	CURSOR		col_cur
		(OwnerName	IN VARCHAR2,
		 TableName	IN VARCHAR2)
	IS
		SELECT	Column_name,
				data_type,
				DECODE(CHAR_COL_DECL_LENGTH,NULL,DATA_LENGTH,CHAR_COL_DECL_LENGTH) as data_length,
				data_precision,
				data_scale
		FROM	all_tab_columns
		WHERE	owner = OwnerName
		  AND	table_name = TableName
		ORDER BY column_id;
	
BEGIN
	-- Extract column information from the data dictionary
	CoLCount := 0;

	FOR col_rec IN
		col_cur (argTableOwner, argTableName)

	LOOP
		-- Save column name and type for table create
		ColCount := ColCount + 1;
		argColNames (ColCOunt) := col_rec.column_name;

		-- Get basic type
		TypeNM := (col_rec.data_type);

		-- Add qualifiers to basic type as needed		
		IF is_string (TypeNM) OR is_raw(TypeNM) THEN
			TypeNM := TypeNM || '(' || TO_CHAR(col_rec.data_length) || ')';
	
		ELSIF is_number (TypeNM) THEN
			BEGIN
				IF (col_rec.data_scale <> 0) AND (col_rec.data_scale IS NOT NULL) THEN
					TypeNM := TypeNM || '(' || TO_CHAR(col_rec.data_precision) ||
					', ' || TO_CHAR(col_rec.data_scale) || ')';
				ELSIF (col_rec.data_precision <> 0) AND (col_rec.data_precision IS NOT NULL) THEN
					TypeNM := TypeNM || '(' || TO_CHAR(col_rec.data_precision) || ')';
				END IF;
			END;
		END IF;
		
		-- Save qualified string type for create table
		argColTypes (ColCount) := TypeNM;

	END LOOP;
  
	argColCount := ColCount;

END PopulateColumnTables;
-----------------------------------------------------------------------------------
--
--  Name:    TableCleanup
--  Purpose: Delete any triggers associated with a previous attempt to publish the table.
--	     
--  Input:
--		 argTableOwner	IN VARCHAR2		Table owner
--	     argTableName	IN VARCHAR2		Table name
--	     argTableID		IN NUMBER		Table ID
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE TableCleanup
(
	argTableOwner	IN VARCHAR2,
	argTableName	IN VARCHAR2,
	argTableID		IN NUMBER
)
AS
	SQLCommand	VARCHAR2(500);
	
BEGIN
	BEGIN
		-- Drop the row level trigger for the table if it exists, ignore error
		SQLCommand := 'DROP TRIGGER '|| REPLACE(ArticleTriggerRowTemplate, MatchString, TO_CHAR(argTableID)); 
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;

	BEGIN
		-- Drop the statement level trigger if it exists, ignore error
		SQLCommand := 'DROP TRIGGER ' || REPLACE(ArticleTriggerStmtTemplate, MatchString, TO_CHAR(argTableID)); 
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
			
END TableCleanup;
-----------------------------------------------------------------------------------
--
--  Name:    DropView
--  Purpose: Drop view
--	     
--  Input:
--		 argArticleView IN VARCHAR2		Article view name
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE DropView
(
	argArticleView IN VARCHAR2
)
AS
	SQLCommand	VARCHAR2(500);
	
BEGIN
	-- Delete view, ignore error
	BEGIN
		-- Drop the view if it exists, ignore error
		SQLCommand := 'DROP VIEW ' || argArticleView;
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
		
END DropView;
-----------------------------------------------------------------------------------
--
--  Name:    DropLog
--  Purpose: Drop log
--	     
--  Input:
--		 argArticleLog IN VARCHAR2		Article log name
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE DropLog
(
	argArticleLog IN VARCHAR2
)
AS
	SQLCommand	VARCHAR2(500);
	
BEGIN
	-- Delete log, ignore error
	BEGIN
		-- Drop the log if it exists, ignore error
		SQLCommand := 'DROP TABLE ' || argArticleLog;
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
		
END DropLog;
-----------------------------------------------------------------------------------
--
--  Name:    DropFunction
--  Purpose: Drop function 
--	     
--  Input:
--		 argFunctionName IN VARCHAR2		Function name
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE DropFunction
(
	argFunctionName IN VARCHAR2
)
AS
	SQLCommand	VARCHAR2(500);
	
BEGIN
	-- Delete function, ignore error
	BEGIN
		-- Drop the function if it exists, ignore error
		SQLCommand := 'DROP FUNCTION ' || argFunctionName;
		HREPL_ExecuteCommand(SQLCommand);
	EXCEPTION
		WHEN OTHERS THEN NULL;
	END;
		
END DropFunction;
-----------------------------------------------------------------------------------
--
--  Name:    InitPublisher
--  Purpose: Clean any article tracking tables or triggers.  Used to make sure
--           startup is clean.
--
--  Input:
--	     	
--  Output:
--			argRetVal		OUT NUMBER	    Return value
--           
--  Notes:  Best effort to make sure startup is clean.  No errors are returned.   
--
-----------------------------------------------------------------------------------
PROCEDURE InitPublisher
AS
	SQLCommand VARCHAR2(500);

	CURSOR	trigger_cur
	IS
		SELECT trigger_name
		FROM all_triggers
		WHERE
		owner = USER AND
		UPPER(trigger_name) LIKE '%HREPL_ARTICLE%';

	CURSOR	table_cur
	IS
		SELECT table_name, owner
		FROM all_all_tables
		WHERE
		owner = USER AND
		UPPER(table_name) LIKE '%HREPL_ARTICLE%' AND
		nested = 'NO';
		
	CURSOR	view_cur
	IS
		SELECT view_name
		FROM all_views
		WHERE
		owner = USER AND
		(UPPER(view_name) LIKE 'HREPL_ARTICLE%' OR 
		UPPER(view_name) LIKE 'HREPL_LOG%');
		
	CURSOR	func_cur
	IS
		SELECT object_name
		FROM all_objects
		WHERE
		owner = USER AND
		(UPPER(object_name) LIKE 'HREPL_LEN%' AND 
		object_type = 'FUNCTION');	

BEGIN
	-- Drop triggers
	FOR	trigger_rec
	IN	trigger_cur

	LOOP
		-- Delete any triggers owned by the replication administrator
		-- that are prefixed with 'HREPL_Article'
		BEGIN
			-- Drop the trigger if it exists, ignore error
			SQLCommand := 'DROP TRIGGER ' || trigger_rec.trigger_name;
		HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;

	END LOOP;

	-- Drop tracking tables
	FOR	table_rec
	IN	table_cur

	LOOP
		-- Delete any tables owned by the replication administrator
		-- that are prefixed with 'HREPL_Article'
		BEGIN
			-- Drop the tracking table if it exists, ignore error
			SQLCommand := 'DROP TABLE ' 
				|| table_rec.owner || '.' || table_rec.table_name; 
		HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;

	END LOOP;
	
	-- Drop views
	FOR	view_rec
	IN	view_cur

	LOOP
		-- Delete any views owned by the replication administrator
		-- that are prefixed with 'HREPL_Article' or 'HREPL_Log'
		BEGIN
			-- Drop the view if it exists, ignore error
			SQLCommand := 'DROP VIEW ' || view_rec.view_name;
		HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;

	END LOOP;
	
	-- Drop functions
	FOR	func_rec
	IN	func_cur

	LOOP
		-- Delete functions owned by the replication administrator
		-- that are prefixed with 'HREPL_LEN' 
		BEGIN
			-- Drop the function if it exists, ignore error
			SQLCommand := 'DROP FUNCTION ' || func_rec.object_name;
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

END InitPublisher;
-----------------------------------------------------------------------------------
--
--  Name:    RowCnt
--
--  Purpose: Deposit a row count entry in HREPL_Event.
--
--  Input:
--		 argTableOwner	IN VARCHAR2 Table owner	
--	     argTableName	IN VARCHAR2	Table name
--	  	 argPublicationID IN NUMBER Publication ID
--		 argArticleID	IN NUMBER	Article ID
--		 argCommandType	IN NUMBER	Command type:  35 or 69 (SQLSERVER_ARTICLE_CMD OR SQL_SUBSCRIPTION_VALIDATION)
--		 argCommand		IN VARCHAR2	Template for row count command to be executed at subscriber
--		 argSubscriptionLevel IN NUMBER	0 if request applies to all subscriptions, 1 if request applies to those
--                                      subscriptions identified with subscription markers.		
--  Output:
--
--  Notes:   The RowCnt request is generated when sp_ORAarticle_validation is called.  A RowCnt
--	     entry is added to the HREPL_Event table that will be later inserted into the
--	     MSrepl_commands table. Entries from HREPL_Event are marked in HREPL_Poll just as entries
--	     from the article log tables are marked, when a PollBegin request is made.  This allows
--	     the RowCnt entry to be associated with a particular polling interval. Note that the actual
--	     row count value is not determined at this time.  To be completed correctly for article
--	     views with row filtering, the count must be obtained when the poll interval that the
--	     event is associated with completes, as part of the same READ ONLY transaction. If there
--	     are any pending subscription markers in the event table, for the publication and article
--	     represented in the validation request, these are either activated or deleted depending
--	     upon whether the subscription level is 1 or 0 respectively. 
-----------------------------------------------------------------------------------
PROCEDURE RowCnt
(
	argTableOwner IN VARCHAR2,
	argTableName IN VARCHAR2,
	argPublicationID IN NUMBER,
	argArticleID IN NUMBER,
	argCommandType IN NUMBER,
	argCommand IN VARCHAR2,
	argSubscriptionLevel IN NUMBER
)
AS
	RowCntSeq NUMBER := 0;	
	TableID NUMBER := 0;
	EntryTime NUMBER := round(to_number((SYSDATE - BASETIME) * SecondsInaDay));

BEGIN
	-- Pull sequence value from HREPL_SEQ
	SELECT HREPL_SEQ.nextval INTO RowCntSeq FROM dual;
	
	-- Determine the table ID
	SELECT DISTINCT Published_TableID INTO TableID FROM HREPL_PublishedTables
	WHERE Published_Owner = argTableOwner 
	AND   Published_Table = argTableName;
	
	-- Make Row Count entry in HREPL_Event
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, TableID, TABLEROWCNT, RowCntSeq,
	0, argCommandType, EntryTIme, NULL, NULL, NULL, argCommand, NULL, NULL, NULL, NULL,
	NULL, NULL, NULL, NULL, NULL, NULL);

	IF argSubscriptionLevel = 0
	THEN
		-- If subscription level is 0, delete any associated pending subscription markers.
		--  markers. The validation command will be applied to all subscription.
		BEGIN
			DELETE HREPL_Event
			WHERE Event_Publication_ID = argPublicationID
			AND   Event_Operation = PENDINGSUBSCRIPTIONMARKER;
		EXCEPTION
			WHEN NO_DATA_FOUND THEN NULL;	
			WHEN OTHERS THEN RAISE;
		END;
	ELSE
		-- If subscription level is 1, mark any associated pending subscription markers
		-- as active, so that they are eligible for inclusion in the next poll interval.
		BEGIN
			UPDATE HREPL_Event
			SET   Event_Operation = ACTIVESUBSCRIPTIONMARKER
			WHERE Event_Publication_ID = argPublicationID
			AND   Event_Operation = PENDINGSUBSCRIPTIONMARKER;
	
		EXCEPTION
			WHEN NO_DATA_FOUND THEN NULL;	
			WHEN OTHERS THEN RAISE;
		END;
	END IF;	
	
	-- Commit transaction
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;

END RowCnt;
-----------------------------------------------------------------------------------
--
--  Name:    MarkSubscription
--
--  Purpose: Deposit a subscription marker entry in HREPL_Event.
--
--  Input:
--	  	 argPublicationID IN NUMBER Publication ID
--		 argArticleID	IN NUMBER	Article ID
--		 argCommandType	IN NUMBER	Command type:  35 or 69 (SQLSERVER_ARTICLE_CMD OR SQL_SUBSCRIPTION_VALIDATION)
--		 argCommand		IN VARCHAR2	Template for row count command to be executed at subscriber
--		
--  Notes:   The MarkSubscription request is generated when sp_ORAmarksubscriptionvalidation is called.
--		 The request causes a subscription marker entry to be added to the HREPL_Event table.  When the marker 
--       is added, it is given an operation code that identifier this marker as pending.  The marker is not given 
--       active status until a validation request is encountered for the same article and publication.  Pending
--       markers are ignored when HREPL_POLL is populated during the creation of a new poll interval.  This allows markers
--       to effectively be held back from inclusion in a poll interval until their corresponding validation
--       request is encountered. This assures that they appear within the same transaction when deposited into the
--       MSrepl_commands table by the log reader, which is a requirement for proper distribution agent processing.
-----------------------------------------------------------------------------------
PROCEDURE MarkSubscription
(
	argPublicationID IN NUMBER,
	argArticleID IN NUMBER,
	argCommandType IN NUMBER,
	argCommand IN VARCHAR2
)
AS
	MarkerSeq NUMBER := 0;	
	EntryTime NUMBER := round(to_number((SYSDATE - BASETIME) * SecondsInaDay));

BEGIN
	-- Pull sequence value from HREPL_SEQ
	SELECT HREPL_SEQ.nextval INTO MarkerSeq FROM dual;

	-- Make pending subscription marker entry in HREPL_Event
	BEGIN
		DELETE HREPL_Event
		WHERE Event_Publication_ID = argPublicationID
		AND   Event_Operation = PENDINGSUBSCRIPTIONMARKER
		AND   Event_Command = argCommand
		AND   Event_CmdType = argCommandType;
	
	EXCEPTION
		WHEN NO_DATA_FOUND THEN NULL;	
		WHEN OTHERS THEN RAISE;
	END;
	
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, NULL, PENDINGSUBSCRIPTIONMARKER, MarkerSeq,
	NULL, argCommandType, EntryTime, NULL, NULL, NULL, argCommand, NULL, NULL, NULL, NULL, NULL,
	NULL, NULL, NULL, NULL, NULL);
	
	-- Commit transaction
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;

END MarkSubscription;
-----------------------------------------------------------------------------------
--
--  Name:    HasValidTriggers
--
--  Purpose: Check to see if triggers exist for the table
--
--  Input:
--	     argTableName	IN VARCHAR2	Table name
--       argTableOwner	IN VARCHAR2	Table owner
--       argTableID 	IN NUMBER	Table ID
--		 argLogInstance	IN NUMBER	Log instance ID
--		
--  Output:
--
--  Notes:   Returns 1 if valid triggers and article log exist, 0 if not
-----------------------------------------------------------------------------------
FUNCTION HasValidTriggers
(
	argTableName	IN VARCHAR2,
	argTableOwner	IN VARCHAR2,
	argTableID		IN NUMBER,
	argLogInstance	IN NUMBER
)
RETURN NUMBER
AS
	ArticleLog VARCHAR2(255) := REPLACE(REPLACE(ArticleLogTemplate, MatchString, TO_CHAR(argTableID)), MatchStringY, argLogInstance);
	RowTrigger VARCHAR2(255) := REPLACE(ArticleTriggerRowTemplate, MatchString, TO_CHAR(argTableID));
	StmtTrigger VARCHAR2(255) := REPLACE(ArticleTriggerStmtTemplate, MatchString, TO_CHAR(argTableID));
	NoEntry NUMBER;
	table_name VARCHAR2(255);
		
	CURSOR	tables_cur
	IS
		SELECT table_name FROM ALL_ALL_TABLES
		WHERE table_name = ArticleLog
		AND	owner = USER
		AND nested = 'NO';

	CURSOR	triggers_cur
	IS
		SELECT table_name FROM ALL_TRIGGERS
		WHERE trigger_name = RowTrigger
		AND table_name = argTableName
		AND table_owner = argTableOwner
		AND	owner = USER;

	CURSOR	triggersstmt_cur
	IS
		SELECT table_name FROM ALL_TRIGGERS
		WHERE trigger_name = StmtTrigger
		AND table_name = argTableName
		AND table_owner = argTableOwner
		AND	owner = USER;
		
	CURSOR	pubtables_cur
	IS
		SELECT Published_Table FROM HREPL_PublishedTables
		WHERE Published_TableID = argTableID
		AND	Published_Table = argTableName
		AND Published_Owner = argTableOwner
		AND Published_LogDropPending = 0
		AND Published_ArticleDropPending = 0;

BEGIN
	-- Determine whether the article log table exists
	OPEN tables_cur;
	FETCH tables_cur INTO table_name;

	IF tables_cur%NOTFOUND
	THEN
		NoEntry := 1;
	ELSE
		NoEntry := 0;
	END IF;
	
	CLOSE tables_cur;
	
	IF NoEntry = 1 THEN
		RETURN 0;
	END IF;	

	-- Determine whether the row trigger exists
	OPEN triggers_cur;
	FETCH triggers_cur INTO table_name;

	IF triggers_cur%NOTFOUND
	THEN
		NoEntry := 1;
	ELSE
		NoEntry := 0;
	END IF;
	
	CLOSE triggers_cur;
	
	IF NoEntry = 1 THEN
		RETURN 0;
	END IF;	

	-- Determine whether the stmt trigger exists
	OPEN triggersstmt_cur;
	FETCH triggersstmt_cur INTO table_name;

	IF triggersstmt_cur%NOTFOUND
	THEN
		NoEntry := 1;
	ELSE
		NoEntry := 0;
	END IF;
	
	CLOSE triggersstmt_cur;
	
	IF NoEntry = 1 THEN
		RETURN 0;
	END IF;	

	-- Determine whether an entry for the table exists in HREPL_PublishedTables
	OPEN pubtables_cur;
	FETCH pubtables_cur INTO table_name;

	IF pubtables_cur%NOTFOUND
	THEN
		NoEntry := 1;
	ELSE
		NoEntry := 0;
	END IF;
	
	CLOSE pubtables_cur;
	
	IF NoEntry = 1 THEN
		RETURN 0;
	END IF;	
	
	RETURN 1;
	
END HasValidTriggers;
-----------------------------------------------------------------------------------
--
--  Name:    ToNumFromHex
--
--  Purpose: Convert a HEX character to a number to work around deficiency
--           in Oracle 8.0.
--
--  Input:
--	     argChar	IN Char		Hex character
--		
--  Output:
--
--  Notes:   Returns HEX character converted to a number
-----------------------------------------------------------------------------------
FUNCTION ToNumFromHex
(
	argChar	IN CHAR
)
RETURN NUMBER
AS
BEGIN
	IF argChar = '0' THEN RETURN 0; END IF;
	IF argChar = '1' THEN RETURN 1; END IF;
	IF argChar = '2' THEN RETURN 2; END IF;
	IF argChar = '3' THEN RETURN 3; END IF;
	IF argChar = '4' THEN RETURN 4; END IF;
	IF argChar = '5' THEN RETURN 5; END IF;
	IF argChar = '6' THEN RETURN 6; END IF;
	IF argChar = '7' THEN RETURN 7; END IF;
	IF argChar = '8' THEN RETURN 8; END IF;
	IF argChar = '9' THEN RETURN 9; END IF;
	IF argChar = 'A' THEN RETURN 10; END IF;
	IF argChar = 'B' THEN RETURN 11; END IF;
	IF argChar = 'C' THEN RETURN 12; END IF;
	IF argChar = 'D' THEN RETURN 13; END IF;
	IF argChar = 'E' THEN RETURN 14; END IF;
	IF argChar = 'F' THEN RETURN 15; END IF;
	RETURN 0;

END ToNumFromHex;
-----------------------------------------------------------------------------------
--
--  Name:    ExecuteCommand
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
PROCEDURE ExecuteCommand
(
	argSQLCommand	IN VARCHAR2
)
AS
	SQLCommandTable	DBMS_SQL.VARCHAR2S;	
			
BEGIN
	HREPL.AddToSQLCommand(argSQLCommand, SQLCommandTable);
	
	-- Execute the command
	HREPL.ExecuteCommandTable(SQLCommandTable);

END ExecuteCommand;
-----------------------------------------------------------------------------------
--
--  Name:    ExecuteCommandTable
--
--  Purpose: This procedure executes a command passed as a DBMS_SLQ.VARCHAR2S
--			 command table.
--           
--  Input:
--		argSQLCommandTable 	IN	DBMS_SQL.VARCHAR2S	Command table with command to execute
--	     
--  Output:
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
PROCEDURE ExecuteCommandTable
(
	argSQLCommandTable 	IN	DBMS_SQL.VARCHAR2S
)	
AS
	CursorHandle 	INTEGER;
	ReturnValue 	INTEGER;
BEGIN
	-- Open a cursor 
	CursorHandle := DBMS_SQL.OPEN_CURSOR;
 
	-- Parse the command
	BEGIN 
		DBMS_SQL.PARSE(CursorHandle, argSQLCommandTable, argSQLCommandTable.FIRST,
			argSQLCommandTable.LAST, FALSE, Language);

	EXCEPTION
		WHEN NO_DATA_FOUND THEN NULL;	
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
	
END ExecuteCommandTable;
-----------------------------------------------------------------------------------
--
--  Name:    ExecuteCommandForPollID
--  Purpose: This procedure takes a passed command and executes it as dynamic SQL
--           using the passed Pollid as a bound variable
--	     	     
--  Input:
--  	 argSQLCommand	IN VARCHAR2
--       argPollidValue	IN NUMBER
--
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE ExecuteCommandForPollID
(
	argSQLCommand	IN VARCHAR2,
	argPollidValue	IN NUMBER
)
AS
	CursorHandle 	INTEGER;
	ReturnValue 	INTEGER;
BEGIN
	-- Open a cursor 
	CursorHandle := DBMS_SQL.OPEN_CURSOR;
 
	BEGIN
		-- Parse the command
		DBMS_SQL.PARSE(CursorHandle, argSQLCommand, DBMS_SQL.native);

		-- Bind the variable
		DBMS_SQL.BIND_VARIABLE(CursorHandle, 'Pollid', argPollidValue);
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

END ExecuteCommandForPollID;
-----------------------------------------------------------------------------------
--
--  Name:    ExecuteCommandForPollIDTableID
--  Purpose: This procedure takes a passed command and executes it as dynamic SQL
--           using the passed Pollid and TableID as bound variables.
--	     	     
--  Input:
--  	 argSQLCommand	IN VARCHAR2
--       argPollidValue	IN NUMBER
--       argTableidValue IN NUMBER
--
--  Output:
--  Notes:   
--
-----------------------------------------------------------------------------------
PROCEDURE ExecuteCommandForPollIDTableID
(
	argSQLCommand	IN VARCHAR2,
	argPollidValue	IN NUMBER,
	argTableidValue	IN NUMBER
)
AS
	CursorHandle 	INTEGER;
	ReturnValue 	INTEGER;
BEGIN
	-- Open a cursor 
	CursorHandle := DBMS_SQL.OPEN_CURSOR;
 
	BEGIN 
		-- Parse the command
		DBMS_SQL.PARSE(CursorHandle, argSQLCommand, DBMS_SQL.native);

		-- Bind the variables
		DBMS_SQL.BIND_VARIABLE(CursorHandle, 'Pollid', argPollidValue);
		DBMS_SQL.BIND_VARIABLE(CursorHandle, 'Tableid', argTableidValue);

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

END ExecuteCommandForPollIDTableID;

-----------------------------------------------------------------------------------
--
--  Name:    ExecuteCommandTableForPollID
--
--  Purpose: This procedure executes a command passed as a DBMS_SLQ.VARCHAR2S
--			 command table binding the passed pollid parameter
--           
--  Input:
--		argSQLCommandTable 	IN	DBMS_SQL.VARCHAR2S	Command table with command to execute
--      argPollidValue		IN NUMBER
--	     
--  Output:
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
PROCEDURE ExecuteCommandTableForPollID
(
	argSQLCommandTable 	IN	DBMS_SQL.VARCHAR2S,
	argPollidValue		IN	NUMBER
)	
AS
	CursorHandle 	INTEGER;
	ReturnValue 	INTEGER;
BEGIN
	-- Open a cursor 
	CursorHandle := DBMS_SQL.OPEN_CURSOR;
 
	BEGIN 
		-- Parse the command
		DBMS_SQL.PARSE(CursorHandle, argSQLCommandTable, argSQLCommandTable.FIRST,
		argSQLCommandTable.LAST, FALSE, Language);
		
		-- Bind variable
		DBMS_SQL.BIND_VARIABLE(CursorHandle, 'Pollid', argPollidValue);
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
	
END ExecuteCommandTableForPollID;
-----------------------------------------------------------------------------------
--
--  Name:    CheckCompilationErrors
--
--  Purpose: This procedure checks USER_ERRORS for compilation errors associated with a
--           specified object and object type.  If errors are found, a message
--           is constructed with the error information and ECreateError is raised.
--  Input:
--		argObjectName 	IN	VARCHAR2	Object name
--		argObjectType 	IN	VARCHAR2	Object type
--	     
--  Output:
--
--  Notes:    	        
--
-----------------------------------------------------------------------------------
PROCEDURE CheckCompilationErrors
(
	argObjectName 	IN	VARCHAR2,
	argObjectType 	IN	VARCHAR2
)	
AS
	ErrCount	INTEGER := 0;
	ErrorMessage	VARCHAR2(4000);
	CURSOR err_cur IS
		SELECT e.line, e.text, e.type, e.name, e.position
                FROM   user_errors e
		WHERE  e.type = argObjectType
		AND    e.name = NLS_UPPER(argObjectName)
		ORDER BY sequence;
BEGIN
	SELECT COUNT(*) INTO ErrCount
	FROM   user_errors e 
	WHERE  e.type = argObjectType
	AND    e.name = NLS_UPPER(argObjectName);

	-- If the count is greater than zero, return an error
	-- with the associated information from user_errors
	IF ErrCount > 0 THEN 
		FOR err IN err_cur LOOP

			ErrorMessage := ErrorMessage ||
 		
				RTRIM(INITCAP(err.type))||' '||err.name||': Line '||TO_CHAR(err.line)||
       				' : Column '||TO_CHAR(err.position)||' : error '|| err.text;
		END LOOP;
		RAISE_APPLICATION_ERROR(ECompilationError,ErrorMessage);
	END IF;
	
END CheckCompilationErrors;
-----------------------------------------------------------------------------------
--
--  Name:    SetSqlOriginator
--
--  Purpose: Set Sql Server as the source of changes associated with this session
--
--  Input:
--	     none
--		
--  Output:
--
--  Notes:   
-----------------------------------------------------------------------------------
PROCEDURE SetSqlOriginator
AS
BEGIN
	SQLORIGINATOR := TRUE;
	
	-- Commit transaction
	COMMIT;
	
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;	

END SetSqlOriginator;
-----------------------------------------------------------------------------------
--
--  Name:    Trace
--
--  Purpose: Deposit replication trace token in HREPL_Event.
--
--  Input:
--	  	 argPublicationID   IN NUMBER    Publication ID
--		 argArticleID		IN NUMBER	 Article ID
--		 argTracerCmdType	IN NUMBER	 Tracer command type
--		 argTracerStr		IN VARCHAR2	 Tracer string
--  Output:
--
--  Notes:   The Trace request is generated when sp_ORAposttracertoken is called.  A trace
--	     entry is added to the HREPL_Event table that will later be inserted into the
--	     MSrepl_commands table. Entries from HREPL_Event are marked in HREPL_Poll just as 
--	     entries from the article log tables are marked, when a PollBegin request is made.  
--	     This allows the Trace entry to be associated with a particular polling interval.
-----------------------------------------------------------------------------------
PROCEDURE Trace
(
	argPublicationID	IN NUMBER,
	argArticleID		IN NUMBER,
	argTracerCmdType	IN NUMBER,
	argTracerStr		IN VARCHAR2
)
AS
	TraceSeq NUMBER := 0;
	EntryTime NUMBER := round(to_number((SYSDATE - BASETIME) * SecondsInaDay));

BEGIN
	-- Pull sequence value from HREPL_SEQ
	SELECT HREPL_SEQ.nextval INTO TraceSeq FROM dual;
	
	-- Make Trace entry in HREPL_Event
	INSERT INTO HREPL_Event
	VALUES(0, argPublicationID, argArticleID, NULL, TRACERTOKEN, TraceSeq,
	0, argTracerCmdType, EntryTime, NULL, NULL, NULL, argTracerStr, NULL, NULL, NULL,
	NULL, NULL, NULL, NULL, NULL, NULL, NULL);
	
	-- Commit transaction
	COMMIT;
	
EXCEPTION
	WHEN OTHERS THEN
		ROLLBACK;
		RAISE;

END Trace;
-----------------------------------------------------------------------------------
--
--  Name:    CompileTriggers
--
--  Purpose: Compile all defined HREPL triggers.
--           Used on upgrade when only package code is refreshed.
--
--  Input:
--	     none
--		
--  Output:
--
--  Notes:   
-----------------------------------------------------------------------------------
PROCEDURE CompileTriggers
AS
	SQLCommand VARCHAR2(500);

	CURSOR	trigger_cur
	IS
		SELECT trigger_name
		FROM all_triggers
		WHERE
		owner = USER AND
		UPPER(trigger_name) LIKE '%HREPL_ARTICLE%';

BEGIN
	-- Compile triggers
	FOR	trigger_rec
	IN	trigger_cur

	LOOP
		-- Compile any triggers owned by the replication administrator
		-- that are prefixed with 'HREPL_Article'
		BEGIN
			-- Compile the trigger if it exists, ignore error
			SQLCommand := 'ALTER TRIGGER ' || trigger_rec.trigger_name || ' COMPILE';
		HREPL_ExecuteCommand(SQLCommand);
		EXCEPTION
			WHEN OTHERS THEN NULL;
		END;

	END LOOP;

	COMMIT;

EXCEPTION
	WHEN OTHERS THEN NULL;

END CompileTriggers;
END HREPL;
/
SHOW ERRORS PACKAGE BODY HREPL
EXIT
