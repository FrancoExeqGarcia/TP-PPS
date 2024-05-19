//*********************************************************************
// Copyright (c) Microsoft Corporation.
//*********************************************************************















#pragma once

#include "hkrtdef.h"



struct HkCollationInfo
{
	
	
	unsigned int CountCollations;

	
	
	struct HkCollationType *CollationTypes;

	
	
	
	struct HkCollationCallback **CollationCallbacks;
};



struct HkTableBindings
{
	
	
	unsigned __int64 MdVersion;

	
	
	struct HkTableMD *TableMD;

	
	
	struct HkCollationInfo CollationInfo;
};



struct HkProcBindings
{
	
	
	struct HkTable **Tables;

	
	
	struct HkTable **DRTables;

	
	
	struct HkSequenceObj **SeqObjs;

	
	
	struct HkCollationInfo CollationInfo;

	
	
	long ProcId;

	
	
	struct HkProcInfo *ProcInfo;

	
	
	unsigned int *TableIdsStabilize;
};



struct HkSearchInterval
{
	struct HkSearchKey const *StartKey;
	struct HkSearchKey const *EndKey;
#if defined(__cplusplus)
	static const bool isTest = false;
#endif
};



#ifndef GOLDEN_BITS

struct HkSearchIntervalTest
{
	struct HkSearchKey const *StartKey;
	struct HkSearchKey const *EndKey;
	unsigned short NullExtendedColumnIdxStart;
	unsigned short NullExtendedColumnIdxEnd;
#if defined(__cplusplus)
	static const bool isTest = true;
#endif
};

#endif

struct HkCompareContext
{
	
	
	struct HkErrorObject *ErrorObject;

	
	
	unsigned char *DeepDataBuffer;

	
	
	struct HkTransaction *Transaction;

	
	
	struct HkTransaction *TableVarTransaction;

	
	
	struct HkTable **TableVars;

	
	
	struct HkTable **TableParams;

	
	
	const void *Params;
};

struct HkSortContextCommon
{
	
	
	
	
	struct HkCompareContext *CmpContext;
	int(__cdecl * SortCompare)(void*, const void*, const void*);
	void(__cdecl * LobRelease)(void*);
	void *SortBuffer;
	void *DeepBuffer;
	long *PqLocation;
	size_t SortBufElemSize;
	size_t DeepBufferFreePosition;
	unsigned long MaxRows;
	unsigned long CurrentRowCount;
};

struct HkSortContext
{
	
	
	struct HkSortContextCommon CommonContext;
	unsigned char DirectoryPageAllocated;
	unsigned long PagesAllocated;
	long PageIndex;
	HRESULT(__cdecl * BaseCompare)(void*, const void*, const void*, __int64*);
	HRESULT(__cdecl * PqCompare)(void*, long, long, __int64*);
};

struct HkTopSortContext
{
	
	
	struct HkSortContextCommon CommonContext;
	void *TiesBuffer;
	void *CurrentPage;
	unsigned long TopNValue;
	unsigned long CurrentRowIndex;
};



HKRAPI __checkReturn struct HkILBHandle*
	   InitializeHkPalWrappingLockBytesBuffer(
	__in_bcount(bufferLength) struct HkPalWrappingLockBytesBuffer *buffer,
	unsigned long bufferLength,
	__in_bcount(pointerLength) unsigned char *pointer,
	unsigned long pointerLength);



HKRAPI __checkReturn HRESULT
	AllocateHkPalWrappingLockBytes(
	__in struct HkProcContext *hkcontext,
	__in_bcount(pointerLength) unsigned char *pointer,
	unsigned long pointerLength,
	__out struct HkILBHandle **handle);



HKRAPI __checkReturn HRESULT
AllocateHkConcatWrappingLockBytes(
	__in struct HkProcContext *hkcontext,
	__in struct HkILBHandle	  *left,
	__in struct HkILBHandle	  *right,
	__out struct HkILBHandle  **handle);






HKRAPI __checkReturn HRESULT
SendNonOptimizedMetadata(
	__in struct HkProcContext	 *hkcontext,
	__in struct HkOutputMetadata *hkoutput);

HKRAPI __checkReturn HRESULT
SendNonOptimizedOutput(
	__in struct HkProcContext *hkcontext,
	bool					  isEndOfResultSet);

HKRAPI void
EndNonOptimizedResultForError(__in struct HkProcContext *hkcontext);

HKRAPI __checkReturn HRESULT
HkRtCreateTempTable(
	__in struct HkProcContext  *hkcontext,
	__in struct HkTableMD	   *tableMd,
	__deref_out struct HkTable **table);

HKRAPI __checkReturn HRESULT
ExecuteNestedModule(
	__in struct HkProcContext *hkcontext,
	int						  dbid,
	int						  objid,
	__in_opt union HkValue	  *valueArray,
	__in_opt unsigned char	  *nullArray,
	__in_opt struct HkTable	  **tvps);

HKRAPI __checkReturn HRESULT
HostConvert(
	__in struct HkErrorObject *errorObj,
	unsigned char			  fWarnTrunc,
	long					  style,
	unsigned char			  dateFormat,
	unsigned char			  toType,
	unsigned char			  toPrecision,
	unsigned char			  toScale,
	unsigned short			  toMaxLength,
	unsigned long			  toCollation,
	__out union HkValue		  *toValue,
	unsigned char			  fromType,
	unsigned char			  fromPrecision,
	unsigned char			  fromScale,
	unsigned short			  fromMaxLength,
	unsigned long			  fromCollation,
	union HkValue			  fromValue);

HKRAPI __checkReturn __int64
GetDateTime();

HKRAPI __checkReturn __int64
GetUTCDateTime();

HKRAPI __checkReturn HRESULT
GetDateTime2(
	__out __int64			  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn __int64
GetUTCDateTime2();

HKRAPI __checkReturn HRESULT
	GetUserId(
	__in struct HkErrorObject *errorObj,
	__in_bcount(usernameLength) unsigned char *username,
	int usernameLength,
	__out short *userid);

HKRAPI __checkReturn HRESULT
	GetUserIdEx(
	__in struct HkErrorObject *errorObj,
	__in_bcount(usernameLength) unsigned char *username,
	int usernameLength,
	__out int *userid);

HKRAPI void
GetSessionLogin(
	__out struct HkPal *loginNameBuffer);

HKRAPI void
GetContextInfo(
	__out struct HkPal *contextInfoBuffer);

HKRAPI __checkReturn HRESULT
GetUsername(
	__in struct HkErrorObject *errorObject,
	int						  id,
	__out struct HkPal		  *usernameBuffer);

HKRAPI __checkReturn HRESULT
GetSusername(
	__in struct HkErrorObject *errorObject,
	int						  id,
	__out struct HkPal		  *loginNameBuffer);

HKRAPI __checkReturn HRESULT
	GetSuserSname(
	__in struct HkErrorObject *errorObject,
	__in_bcount(sidLength) unsigned char *sidValue,
	int sidLength,
	__out struct HkPal *loginNameBuffer);

HKRAPI __checkReturn HRESULT
	GetSuserId(
	__in struct HkErrorObject *errorObject,
	__in_bcount(loginNameLength) unsigned char *loginName,
	int loginNameLength,
	__out int *suserId);

HKRAPI __checkReturn HRESULT
	GetSuserSid(
	__in struct HkErrorObject *errorObject,
	__in_bcount(loginNameLength) unsigned char *loginName,
	int loginNameLength,
	bool validateLoginName,
	__out struct HkPal *sidValue);

HKRAPI __checkReturn HRESULT
	IsMember(
	__in struct HkErrorObject *errorObj,
	__in_bcount(roleNameLength) unsigned char *roleName,
	int roleNameLength,
	__out int *isMemberResult);

HKRAPI __checkReturn HRESULT
	IsRoleMember(
	__in struct HkErrorObject *errorObj,
	__in_bcount(roleNameLength) unsigned char *roleName,
	int roleNameLength,
	__in_bcount(usernameLength) unsigned char *username,
	int usernameLength,
	__out int *isRoleMemberResult);

HKRAPI __checkReturn HRESULT
	IsSrvRoleMember(
	__in struct HkErrorObject *errorObj,
	__in_bcount(roleNameLength) unsigned char *roleName,
	int roleNameLength,
	__in_bcount(loginNameLength) unsigned char *loginName,
	int loginNameLength,
	__out int *isRoleMemberResult);

HKRAPI __checkReturn __int64
SysTranDateTime(__in struct HkTransaction *tx);

HKRAPI __checkReturn __int64
SysMaxDateTime(__in int scale);


HKRAPI __forceinline __checkReturn struct HkSixteenByteData
GetNewId();
HKRAPI __forceinline __checkReturn struct HkSixteenByteData
GetNewSequentialId();

HKRAPI __checkReturn int
DatePart(int datePart, __int64 date, int dateFirst);

HKRAPI __checkReturn HRESULT
DateAdd(
	int		  datePart,
	int		  number,
	int		  date,
	__out int *result);

HKRAPI __checkReturn int
DateDiff(
	int datePart,
	int firstDate,
	int secondDate);

HKRAPI __checkReturn int
EOMonth(int date);

HKRAPI __checkReturn HRESULT
SmallDateTimeFromParts(
	int						  year,
	int						  month,
	int						  day,
	int						  hour,
	int						  minute,
	__out int				  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
DateTimeFromParts(
	int						  year,
	int						  month,
	int						  day,
	int						  hour,
	int						  minute,
	int						  seconds,
	int						  milliseconds,
	__out __int64			  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
DateFromParts(
	int						  year,
	int						  month,
	int						  day,
	__out int				  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
TimeFromParts(
	int						  hour,
	int						  minute,
	int						  seconds,
	int						  fractions,
	int						  precision,
	__out __int64			  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
DateTime2FromParts(
	int						  year,
	int						  month,
	int						  day,
	int						  hour,
	int						  minute,
	int						  seconds,
	int						  fractions,
	int						  precision,
	__out __int64			  *result,
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn double
Rand();

HKRAPI __checkReturn double
SRand(int seed);

HKRAPI __checkReturn double
Cot(double x);

HKRAPI __checkReturn double
LogBaseN(double x, double base);

HKRAPI __checkReturn HRESULT
CreateError(
	__in struct HkErrorObject *errorObj,
	HRESULT					  hr,
	unsigned long			  paramCount,
	...);

HKRAPI void
	CreateErrorForThrow(
	__in struct HkErrorObject *errorObj,
	int errorNum,
	int state,
	unsigned long line,
	long msgLenInBytes,
	__in_ecount(msgLenInBytes) const unsigned char *msg);

HKRAPI void
SetLineNumberForError(
	__inout struct HkErrorObject *errorObj,
	unsigned long				 line);

HKRAPI __checkReturn HRESULT
CreateErrorForRethrow(
	__inout struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
SaveErrorForCatchBlock(
	__inout struct HkErrorObject *errorObj);

HKRAPI __checkReturn HRESULT
DismissErrorForCatchBlock(
	__inout struct HkErrorObject *errorObj);

HKRAPI __checkReturn long
GetErrorNumber(
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn unsigned char*
GetErrorMessage(
	__in struct HkErrorObject *errorObj,
	__out unsigned short	  *msgLen);

HKRAPI __checkReturn long
GetErrorSeverity(
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn long
GetErrorState(
	__in struct HkErrorObject *errorObj);

HKRAPI __checkReturn long
GetErrorLine(
	__in struct HkErrorObject *errorObj);



HKRAPI __checkReturn short
GetSpid();

#ifndef GOLDEN_BITS

HKRAPI void
FireXEventsForCallback(
	int						callback,
	void const				*left,
	void const				*right,
	__int64					res,
	unsigned long			dbid,
	unsigned long			objid,
	unsigned long			indid,
	unsigned long			hkIndexId,
	struct HkColsInfo const *colsInfo,
	bool					normalized);

HKRAPI void
FireXEventForHkSearchKey(
	struct HkSearchKey const *key,
	bool					 isEndKey,
	bool					 isPointLookup,
	bool					 isEndTable,
	bool					 isNormalized,
	unsigned long			 objid,
	unsigned long			 indid,
	unsigned short			 nullExtendedColumnIdx);

HKRAPI void
FireXEventForQuerySearchKey(
	unsigned long startColPos,
	unsigned long colCount,
	bool		  isStrict,
	bool		  isEndKey,
	bool		  isPointLookup,
	unsigned long objid,
	unsigned long indid,
	bool		  isDynamicOrRangePointsKey,
	...);

#endif

HKRAPI void
AssertFail(
	unsigned int						 assert_type,
	__in __nullterminated const char	 *exp,
	__in __nullterminated const char	 *filename,
	int									 line,
	__in_opt __nullterminated const char *szDesc,
	__in char							 *args);

HKRAPI __checkReturn HRESULT
YieldThread(__in struct HkProcContext *hkcontext, unsigned long lineNo);

HKRAPI void
ThrowErrorHr(HRESULT hr);

HKRAPI __checkReturn HRESULT
	SortHkRows(
	__in struct HkProcContext *hkcontext,
	__in void *context,
	__inout_bcount(countRows * sizeOfSortBufElem) void *sortBuffer,
	int(__cdecl * compare)(void*, const void*, const void*),
	long countRows,
	size_t sizeOfSortBufElem);

HKRAPI __checkReturn HRESULT
	InitPriorityQueue(
	HRESULT(__cdecl * compare)(void*, long, long, __int64*),
	__in void *context,
	__out_ecount(sizeOfPriorityQueue) long *priorityQueue,
	__int64 sizeOfPriorityQueue,
	__out long *nextEntryPoint);

HKRAPI __checkReturn HRESULT
	InsertIntoPriorityQueue(
	HRESULT(__cdecl * compare)(void*, long, long, __int64*),
	__in void *context,
	__inout_ecount(sizeOfPriorityQueue) long *priorityQueue,
	__int64 sizeOfPriorityQueue,
	__inout long *nextEntryPoint);

HKRAPI __checkReturn HRESULT
	InitTopSortContext(
	__inout struct HkCompareContext *cmpContext,
	__inout struct HkTopSortContext *topsortContext,
	const void *params,
	void(_cdecl * lobRelease)(void*),
	size_t sortBufElemSize,
	__in unsigned char *deepDataBuffer,
	__in struct HkProcContext *hkcontext,
	int(__cdecl * sortCompare)(void*, const void*, const void*));




HKRAPI __checkReturn HRESULT
	InitSortContext(
	__inout struct HkCompareContext *cmpContext,
	__inout struct HkSortContext *sortContext,
	const void *params,
	void(_cdecl * lobRelease)(void*),
	size_t sortBufElemSize,
	__in unsigned char *deepDataBuffer,
	__in struct HkProcContext *hkcontext,
	HRESULT(__cdecl * baseCompare)(void*, const void*, const void*, __int64*),
	HRESULT(__cdecl * pqCompare)(void*, long, long, __int64*),
	int(__cdecl * sortCompare)(void*, const void*, const void*));




HKRAPI __checkReturn HRESULT
GetNextSortedRow(
	__in struct HkProcContext	 *hkcontext,
	__inout struct HkSortContext *sortContext,
	__deref_out void			 **returnRow);



HKRAPI __checkReturn HRESULT
GetNextSortedRowDistinct(
	__in struct HkProcContext	 *hkcontext,
	__inout struct HkSortContext *sortContext,
	__deref_out void			 **returnRow);




HKRAPI __checkReturn HRESULT
GetFirstSortedRow(
	__in struct HkProcContext	 *hkcontext,
	__inout struct HkSortContext *sortContext,
	__deref_out void			 **returnRow);








HKRAPI __checkReturn HRESULT
GetEmptySortRowSlot(
	__in struct HkProcContext	 *hkcontext,
	__inout struct HkSortContext *sortContext,
	__deref_out void			 **returnRow);




HKRAPI __checkReturn HRESULT
AllocateSortRowDeepData(
	__in struct HkProcContext		   *hkcontext,
	__inout struct HkSortContextCommon *sortCommonContext,
	size_t							   size,
	__deref_out_opt void			   **buffer);



HKRAPI __checkReturn HRESULT
AllocateBuffer(
	__in struct HkProcContext *hkcontext,
	__deref_out void		  **returnBuffer);




HKRAPI void
DeallocateBufferForSort(
	__in struct HkProcContext	 *hkcontext,
	__inout struct HkSortContext *sortContext,
	bool						 deallocateDeepData);




HKRAPI void
DeallocateBufferForTopSort(
	__in struct HkProcContext		*hkcontext,
	__inout struct HkTopSortContext *topSortContext,
	bool							deallocateDeepData);





HKRAPI __checkReturn HRESULT
AllocateSlotForTiesList(
	__in struct HkProcContext		*hkcontext,
	__inout struct HkTopSortContext *sortCommonContext,
	__deref_out_opt void			**returnTiesList);




HKRAPI void
ResetTiesList(
	__in struct HkProcContext		*hkcontext,
	__inout struct HkTopSortContext *sortCommonContext);





HKRAPI __checkReturn HRESULT
GetFirstTopSortElement(
	__in struct HkProcContext		*hkcontext,
	__inout struct HkTopSortContext *topSortContext,
	__deref_out void				**elem);





HKRAPI __checkReturn void*
GetNextTopSortElement(
	__in struct HkProcContext		*hkcontext,
	__inout struct HkTopSortContext *topSortContext);





HKRAPI __checkReturn HRESULT
SortAndMergeHkSearchIntervals(
	__in struct HkProcContext *hkcontext,
	__int64 (*compareHkSearchKeys)(void const*, void const*),
	__inout_ecount(*intervalCount) struct HkSearchInterval *hkSearchIntervals,
	__in unsigned long *intervalCount);

#ifndef GOLDEN_BITS





HKRAPI __checkReturn HRESULT
SortAndMergeHkSearchIntervalsTest(
	__in struct HkProcContext *hkcontext,
	__int64 (*compareHkSearchKeys)(void const*, void const*),
	__inout_ecount(*intervalCount) struct HkSearchIntervalTest *hkSearchIntervals,
	__in unsigned long *intervalCount);

#endif




HKRAPI __checkReturn int
	CompareStrings(
	struct HkCollationCallback const *hcco,
	__in_bcount(leftLength) char const *leftValue,
	long leftLength,
	__in_bcount(rightLength) char const *rightValue,
	long rightLength);




HKRAPI __checkReturn int
CompareMaxStrings(
	struct HkCollationCallback const *hcco,
	__in struct HkILBHandle			 *leftValue,
	__in struct HkILBHandle			 *rightValue);




HKRAPI __checkReturn  unsigned long
	HashString(
	struct HkCollationCallback const *hcco,
	__in_bcount(length) char const *value,
	long length,
	__inout	 unsigned long *hashState);




HKRAPI __checkReturn int
TriggerNestLevel();




HKRAPI __checkReturn int
TriggerNestLevelWithId(unsigned long objid);




HKRAPI __checkReturn HRESULT
	HkCsProcessCustomLogRec(
	__in struct HkDatabase *db,
	__in struct HkTable *table,
	__in struct HkTransaction *tx,
	unsigned int dictTableId,
	unsigned int segTableId,
	unsigned int rgInfoTableId,
	__in_ecount(colCount) unsigned int const *hobtColIds,
	__in_ecount(colCount) unsigned char const *colTypes,
	__in_ecount(colCount) unsigned char const *colPrecs,
	__in_ecount(colCount) unsigned char const *colScales,
	__in_ecount(colCount) bool const *colDesc,
	unsigned short colCount,
	__in_bcount(dataSize) unsigned char const *data,
	unsigned short dataSize);




HKRAPI __checkReturn HRESULT
	HkCsPostCheckpointLoad(
	__in struct HkDatabase *db,
	__in struct HkTable *table,
	__in struct HkTransaction *tx,
	unsigned int drTableId,
	unsigned int dictTableId,
	unsigned int segTableId,
	unsigned int rgInfoTableId,
	__in_ecount(colCount) unsigned int const *hobtColIds,
	__in_ecount(colCount) unsigned char const *colTypes,
	__in_ecount(colCount) unsigned char const *colPrecs,
	__in_ecount(colCount) unsigned char const *colScales,
	__in_ecount(colCount) bool const *colDesc,
	unsigned short colCount);




HKRAPI __forceinline __checkReturn HRESULT
Round64(__int64 val, int length, int trunc, __out __int64 *result);




HKRAPI __checkReturn HRESULT
RoundDouble(double val, int length, int trunc, double *result);




HKRAPI __forceinline void
Round128(struct HkInt128 const *val, int length, int trunc, __out struct HkInt128 *res);




HKRAPI __checkReturn double
HkCeiling(double number);




HKRAPI __checkReturn __int64
MaskInt64(
	__in struct HkProcContext		*hkcontext,
	__int64							originalValue,
	__in struct HkMaskingParameters *parameters);




HKRAPI void
MaskLargeNumeric(
	__in struct HkProcContext		*hkcontext,
	__in struct HkInt128			*originalValue,
	__in struct HkMaskingParameters *parameters,
	__out struct HkInt128			*finalValue);




HKRAPI __checkReturn double
MaskDouble(
	__in struct HkProcContext		*hkcontext,
	double							originalValue,
	__in struct HkMaskingParameters *parameters);




HKRAPI __checkReturn __int64
MaskDateAndTime(
	__in struct HkProcContext		*hkcontext,
	__int64							originalValue,
	__in struct HkMaskingParameters *parameters);




HKRAPI __checkReturn unsigned long
	MaskAsciiString(
	__in struct HkProcContext *hkcontext,
	__in_bcount(originalValueLengthInBytes) unsigned char *originalValue,
	int originalValueLengthInBytes,
	__in struct HkMaskingParameters *parameters,
	__in struct HkStringUtils *stringUtils,
	__out_bcount(maskedValueLengthInBytes) unsigned char *maskedValue,
	int maskedValueLengthInBytes,
	__out unsigned char **finalValue);




HKRAPI __checkReturn HRESULT
MaskAsciiStringLob(
	__in struct HkProcContext		*hkcontext,
	__in struct HkILBHandle			*originalValue,
	__in struct HkMaskingParameters *parameters,
	__in struct HkStringUtils		*stringUtils,
	__out struct HkILBHandle		**finalResult);




HKRAPI __checkReturn unsigned long
	MaskUnicodeString(
	__in struct HkProcContext *hkcontext,
	__in_bcount(originalValueLengthInBytes) unsigned char *originalValue,
	int originalValueLengthInBytes,
	__in struct HkMaskingParameters *parameters,
	__in struct HkStringUtils *stringUtils,
	__out_bcount(maskedValueLengthInBytes) unsigned char *maskedValue,
	int maskedValueLengthInBytes,
	__out unsigned char **finalValue);




HKRAPI __checkReturn HRESULT
MaskUnicodeStringLob(
	__in struct HkProcContext		*hkcontext,
	__in struct HkILBHandle			*originalValue,
	__in struct HkMaskingParameters *parameters,
	__in struct HkStringUtils		*stringUtils,
	__out struct HkILBHandle		**finalResult);




HKRAPI __checkReturn unsigned long
	MaskBinary(
	__in struct HkProcContext *hkcontext,
	__in_bcount(originalValueLengthInBytes) unsigned char *originalValue,
	int originalValueLengthInBytes,
	__in struct HkMaskingParameters *parameters,
	__out_bcount(maskedValueLengthInBytes) unsigned char *maskedValue,
	int maskedValueLengthInBytes,
	__out unsigned char **finalValue);




HKRAPI __checkReturn HRESULT
MaskBinaryLob(
	__in struct HkProcContext		*hkcontext,
	__in struct HkILBHandle			*originalValue,
	__in struct HkMaskingParameters *parameters,
	__out struct HkILBHandle		**finalResult);




HKRAPI void
MaskGuid(
	__in struct HkProcContext		*hkcontext,
	__in struct HkSixteenByteData	*originalValue,
	__in struct HkMaskingParameters *parameters,
	__out struct HkSixteenByteData	*finalValue);




HKRAPI __checkReturn HRESULT
HostIsJsonLob(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj	  *esInfoObj,
	__in struct HkILBHandle	  *inputJson,
	__inout unsigned char	  *isJsonResult);

HKRAPI __checkReturn HRESULT
	HostJsonQueryWch(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj *esInfoObj,
	__in_bcount(inputJsonLengthInBytes) unsigned char *inputJson,
	int inputJsonLengthInBytes,
	__in_bcount(jsonPathLengthInBytes) unsigned char *jsonPath,
	int jsonPathLengthInBytes,
	__inout struct HkPal *finalResult);

HKRAPI __checkReturn HRESULT
	HostJsonQueryLob(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj *esInfoObj,
	__in struct HkILBHandle *inputJson,
	__in_bcount(jsonPathLengthInBytes) unsigned char *jsonPath,
	int jsonPathLengthInBytes,
	__inout struct HkILBHandle **finalResult);

HKRAPI __checkReturn HRESULT
	HostJsonValueWch(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj *esInfoObj,
	__in_bcount(inputJsonLengthInBytes) unsigned char *inputJson,
	int inputJsonLengthInBytes,
	__in_bcount(jsonPathLengthInBytes) unsigned char *jsonPath,
	int jsonPathLengthInBytes,
	__inout struct HkPal *finalResult);

HKRAPI __checkReturn HRESULT
	HostJsonValueLob(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj *esInfoObj,
	__in struct HkILBHandle *inputJson,
	__in_bcount(jsonPathLengthInBytes) unsigned char *jsonPath,
	int jsonPathLengthInBytes,
	__inout struct HkPal *finalResult);




HKRAPI __checkReturn HRESULT
HostStringEscapeLob(
	__in struct HkErrorObject  *errorObj,
	__in struct HkILBHandle	   *inputJson,
	unsigned char			   inputType,
	unsigned char			   inputPrecision,
	unsigned char			   inputScale,
	unsigned short			   inputMaxLength,
	unsigned long			   inputCollation,
	__inout struct HkILBHandle **result);




HKRAPI __checkReturn HRESULT
	HostJsonModifyLob(
	__in struct HkErrorObject *errorObj,
	__in struct HkEsInfoObj *esInfoObj,
	__in struct HkILBHandle *inputJson,
	__in_bcount(jsonPathLengthInBytes) unsigned char *jsonPath,
	int jsonPathLengthInBytes,
	unsigned char newValueType,
	unsigned char newValuePrecision,
	unsigned char newValueScale,
	unsigned short newValueMaxLength,
	unsigned long newValueCollation,
	const union HkValue *newValue,
	bool isNullNewValue,
	bool isNewValueValidJson,
	__inout struct HkILBHandle **result);




HKRAPI __checkReturn HRESULT
	HostTVFStreamAlloc(
	__in struct HkProcContext *context,
	unsigned long indexIntoTvfInfoArray,
	unsigned long paramCount,
	unsigned long columnCount,
	__in_ecount(columnCount) union HkValue *columns,
	__in_ecount(columnCount) bool *columnNullFlags,
	__out struct HkIteratorStvf **hkSTVFIter);

HKRAPI __checkReturn HRESULT
	HostTVFStreamGetFirst(
	__in struct HkErrorObject *errorObj,
	__in struct HkIteratorStvf *hkSTVFIter,
	unsigned long paramCount,
	__in_ecount(paramCount) union HkValue *parameters,
	__in_ecount(paramCount) bool *paramNullFlags);

HKRAPI __checkReturn HRESULT
HostTVFStreamGetNext(
	__in struct HkErrorObject  *errorObj,
	__in struct HkIteratorStvf *hkSTVFIter);

HKRAPI void
HostTVFStreamFree(
	__in struct HkErrorObject  *errorObj,
	__in struct HkIteratorStvf *hkSTVFIter);




HKRAPI __checkReturn HRESULT
HostUdeAlloc(
	__in struct HkProcContext *context,
	unsigned long			  indexIntoUdeArray,
	__out struct HkUdeHelper  **udeHelper);

HKRAPI __checkReturn HRESULT
HostUdeInit(
	__in struct HkErrorObject *errorObj,
	__in struct HkUdeHelper	  *udeHelper);

HKRAPI __checkReturn HRESULT
	HostUdeProcessRow(
	__in struct HkErrorObject *errorObj,
	__in struct HkUdeHelper *udeHelper,
	__in_ecount(paramsCount) const union HkValue *params,
	unsigned long paramsCount,
	const bool *isNull);

HKRAPI __checkReturn HRESULT
HostUdeFinalize(
	__in struct HkErrorObject	   *errorObj,
	__in struct HkUdeHelper		   *udeHelper,
	__inout_opt struct HkILBHandle **result,
	__inout_opt bool			   *isNull);

HKRAPI void
HostUdeFree(__in struct HkUdeHelper *udeHelper);

HKRAPI __checkReturn HRESULT
	HostTertiaryNorm(
	__in struct HkErrorObject *errorObj,
	unsigned long collationId,
	__in_bcount(inputStringLengthInBytes) unsigned char *inputString,
	unsigned long inputStringLengthInBytes,
	__inout struct HkPal *result);

HKRAPI __checkReturn HRESULT
HostTertiaryNormLob(
	__in struct HkProcContext  *hkContext,
	unsigned long			   collationId,
	__in struct HkILBHandle	   *inputString,
	__inout struct HkILBHandle **result);




HKRAPI __checkReturn HRESULT
	HostTrimStr(
	__in struct HkErrorObject *errorObj,
	int trimLogicIndex,
	unsigned char resultType,
	unsigned short resultMaxLength,
	unsigned long resultCollation,
	unsigned short trimType,
	__in_bcount(trimCharactersLengthInBytes) unsigned char *trimCharacters,
	unsigned long trimCharactersLengthInBytes,
	__in_bcount(stringToTrimLengthInBytes) unsigned char *stringToTrim,
	unsigned long stringToTrimLengthInBytes,
	__inout struct HkPal *result);




HKRAPI __checkReturn HRESULT
	HostTrimLob(
	__in struct HkProcContext *hkcontext,
	__in struct HkErrorObject *errorObj,
	int trimLogicIndex,
	unsigned char resultType,
	unsigned short resultMaxLength,
	unsigned long resultCollation,
	unsigned short trimType,
	__in_bcount(trimCharactersLengthInBytes) unsigned char *trimCharacters,
	unsigned long trimCharactersLengthInBytes,
	__in struct HkILBHandle *stringToTrim,
	__inout struct HkILBHandle **result);



HKRAPI __checkReturn HRESULT
HostTranslateStr(
	__in struct HkErrorObject *errorObj,
	int						  translateLogicIndex,
	unsigned char			  type,
	unsigned short			  maxLength,
	unsigned long			  collation,
	__in struct HkPal		  *translateInputString,
	__in struct HkPal		  *charactersString,
	__in struct HkPal		  *translationString,
	__inout struct HkPal	  *finalResult);



HKRAPI __checkReturn HRESULT
HostTranslateWstr(
	__in struct HkErrorObject *errorObj,
	int						  translateLogicIndex,
	unsigned char			  type,
	unsigned short			  maxLength,
	unsigned long			  collation,
	__in struct HkPal		  *translateInputString,
	__in struct HkPal		  *charactersString,
	__in struct HkPal		  *translationString,
	__inout struct HkPal	  *finalResult);



HKRAPI __checkReturn HRESULT
HostTranslateLob(
	__in struct HkProcContext  *context,
	int						   translateLogicIndex,
	unsigned char			   type,
	unsigned short			   maxLength,
	unsigned long			   collation,
	__in struct HkILBHandle	   *translateInput,
	__in struct HkPal		   *charactersString,
	__in struct HkPal		   *translationString,
	__inout struct HkILBHandle **result);

HKRAPI __checkReturn HRESULT
AllocateEsInfoObj(
	__in struct HkErrorObject  *errorObj,
	bool					   isInputLob,
	int						   builtinFunction,
	__inout struct HkEsInfoObj **esInfoObj);

HKRAPI void
DeallocateEsInfoObj(__in struct HkEsInfoObj **esInfoObj);

#if !defined(HKRUNTIME_BUILD)
HKRAPI __checkReturn double hk_acos(double x);
HKRAPI __checkReturn double hk_asin(double x);
HKRAPI __checkReturn double hk_atan(double x);
HKRAPI __checkReturn double hk_atan2(double x, double y);
HKRAPI __checkReturn double hk_cos(double x);
HKRAPI __checkReturn double hk_exp(double x);
HKRAPI __checkReturn double hk_floor(double x);
HKRAPI __checkReturn double hk_log(double x);
HKRAPI __checkReturn double hk_log10(double x);
HKRAPI __checkReturn double hk_pow(double x, double y);
HKRAPI __checkReturn double hk_sin(double x);
HKRAPI __checkReturn double hk_sqrt(double x);
HKRAPI __checkReturn double hk_tan(double x);
#endif
