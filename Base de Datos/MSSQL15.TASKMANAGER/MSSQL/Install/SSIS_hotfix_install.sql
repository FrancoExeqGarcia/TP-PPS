/*
**  SSIS_hotfix_install.SQL
**  Patch install script for the SSIS server catalog (SSISDB).
*/

PRINT '------------------------------------------------------'
PRINT 'Starting execution of SSIS_HOTFIX_INSTALL.SQL         '
PRINT '------------------------------------------------------'

DECLARE @run_script BIT
SET @run_script=1

DECLARE @ssis_database_name SYSNAME
SET @ssis_database_name = N'SSISDB'

-- Check whether SSISDB exists
IF(DB_ID(@ssis_database_name) IS NULL)
BEGIN
    SET @run_script=0
    PRINT 'Database SSISDB does not exist in current SQL Server instance'
END

-- Check whether SSISDB is online
IF @run_script <> 0
BEGIN
	DECLARE @state_online SYSNAME
	SET @state_online = 'ONLINE'
	SELECT @state_online = UPPER(@state_online COLLATE SQL_Latin1_General_CP1_CI_AS)

	IF NOT EXISTS (SELECT state_desc FROM master.sys.databases WHERE name = @ssis_database_name AND
										 UPPER(state_desc COLLATE SQL_Latin1_General_CP1_CI_AS) LIKE @state_online)
	BEGIN
		SET @run_script=0    
		PRINT 'WARNING! The database SSISDB is not ONLINE. SSIS_HOTFIX_INSTALL.SQL will not be applied. Please run the script manually after the upgrade.'
	END
END

-- Check SSISDB is not in always-on group
IF @run_script <> 0
BEGIN
	IF EXISTS (SELECT hadr.database_state FROM master.sys.dm_hadr_database_replica_states AS hadr 
			JOIN master.sys.databases AS dbs 
			ON hadr.database_id = dbs.database_id 
			WHERE dbs.name = @ssis_database_name)
	BEGIN
		SET @run_script=0
		PRINT 'WARNING! The database SSISDB is in alwayson group. So skipping execution of ISServer_upgrade.sql on it. Please run the script manually after the upgrade.'
	END
END

-- Check whether SSISDB is corrupted
IF @run_script <> 0
BEGIN
	IF OBJECT_ID (N'SSISDB.internal.catalog_properties', N'U') IS NULL
	BEGIN
		SET @run_script=0
		PRINT 'Database SSISDB is missing the catalog properties table. The database may be corrupted, or it is not an SSIS Catalog.'
	END
END

IF  @run_script <> 0
BEGIN
	PRINT 'Start applying SSIS_HOTFIX_INSTALL changes.'

	DECLARE @rawCmd NVARCHAR(MAX), @cmd NVARCHAR(MAX)

	DECLARE @targetVersion NVARCHAR(256)
	SELECT @targetVersion = CONVERT(NVARCHAR,SERVERPROPERTY(N'ProductVersion'))
	
    --1. drop the old SP
    
    --2. create the new SP
    
    --3. grant the permission on new one

	--4. Finally update the schema build number to server's build number
	SET @cmd = 'UPDATE [SSISDB].[internal].[catalog_properties] SET property_value = N'''+@targetVersion+''' WHERE property_name = N''SCHEMA_BUILD'''
	EXEC sp_executesql @cmd
	PRINT 'Schema build in SSISDB has been updated to ' + @targetVersion

END

PRINT '------------------------------------------------------'
PRINT 'Execution of SSIS_HOTFIX_INSTALL.SQL completed'
PRINT '------------------------------------------------------'
GO


