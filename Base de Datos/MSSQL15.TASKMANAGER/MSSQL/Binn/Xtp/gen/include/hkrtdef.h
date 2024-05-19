//*********************************************************************
// Copyright (c) Microsoft Corporation.
//*********************************************************************















#pragma once



#pragma warning(push)
#pragma warning(disable: 4512)  

struct HkOffsetInfo
{
	unsigned short const DataOffset;			
	unsigned short const NullOffset;			
	unsigned char const NullBitMask;			
	unsigned long const OffRowTableId;			
};

#pragma warning(pop)




struct HkSearchKeyColsInfo
{
	
	
	
	
	
	unsigned short FixedSize;

	
	
	struct HkOffsetInfo const* Offsets;

	
	
	
	
	unsigned short ColCountOffset;

	
	
	
	
	unsigned short EpsilonOffset;
};




struct HkFlatKeyColsInfo
{
	unsigned short FixedSize;					
	struct HkOffsetInfo const* Offsets;			
};



struct HkColsInfo
{
	
	
	unsigned short FixedSize;								
	struct HkOffsetInfo const* Offsets;						
	unsigned short CSRIDOffset;								
	unsigned short SizeLocationOffset;						
	struct HkSearchKeyColsInfo const* SearchKeyColsInfo;	
	struct HkFlatKeyColsInfo const* FlatKeyColsInfo;		
};



struct HkOutputMetadata
{
	int							rsId;
	unsigned long				currentLineNumber;
	unsigned short				columnCount;
	const unsigned char*		columnNameLens;
	const wchar_t* const*		columnNames;
	const unsigned char*		columnTypes;
	const unsigned char*		columnNullables;
	const unsigned char*		columnPrecisions;
	const unsigned char*		columnScales;
	const unsigned short*		columnMaxLengths;
	const unsigned long*		columnCollations;
	const unsigned char*		columnStatusBits;
	unsigned short				orderByCount;
	const unsigned short*		orderByColumns;
	const unsigned char* const*	tdsBufs;
	const unsigned short*		tdsBufLengths;
	unsigned short				clientCount;
	const unsigned char*		tdsKeyBuf;
	unsigned short				tdsKeyBufLength;
	const unsigned char*		tdsDataClassificationBuf;
	unsigned short				tdsDataClassificationBufLength;
};



enum
{
	eHkCl42 = 0,
	eHkCl6x = 1,
	eHkCl70 = 2,
	eHkCl71 = 3,
	eHkCl71_SP1 = 4,
	eHkCl72 = 5,
	eHkCl73 = 6,
	eHkCl74 = 7,
	eHkClBase = eHkCl70
};

#define CLIENTLEVEL_AND_TCEENABLED_TO_OFFSET(e, isTceSupported) (e - eHkClBase + (isTceSupported ? 1 : 0))
#define OFFSET_TO_CLIENTLEVEL(e) (e == CLIENTLEVEL_AND_TCEENABLED_TO_OFFSET(eHkCl74, true) ? eHkCl74 : (e + eHkClBase))
#define OFFSET_TO_TCEENABLED(e) (e == CLIENTLEVEL_AND_TCEENABLED_TO_OFFSET(eHkCl74, true))

struct TDSCOLLATION;

#pragma pack(push, 1)


struct HkDonePkt
{
	unsigned char donetoken;
	unsigned short donestat;
	unsigned short donecurcmd;
	unsigned long long donecount;
};
#pragma pack(pop)



struct HkTdsContext
{
	unsigned char* currentMark;				
	unsigned char* safeMark;				
	unsigned long bytesLeft;				
	unsigned long currentLineNumber;		
	bool isNetworkOptimized;				
	bool updateSafeMark;					
	bool haveUpdatedToSafeMark;				
	bool rsStarted;							
	bool isTceSupported;					
	bool isDataClassificationSupported;		

	unsigned char rsEnd;					
	unsigned char stmtEnd;					
	struct HkDonePkt donepkt;				

	unsigned short clientLevelOffset;		

	bool isRef;								
	bool isEndOfStream;						
	unsigned long inputBytesLeft;			
	unsigned char* inputCurrentBuf;			

	
	
	unsigned char* paramStart;				
	unsigned short paramReadCount;			

	unsigned short outParamReadCount;		
	unsigned char* outParam;				

	unsigned short collatedParamReadCount;	
	struct TDSCOLLATION* collations;		
};

struct HkTable;
struct HkTransaction;
struct HkTableMD;
struct IHkStatementPerf;
struct IHkStatementExecStats;
struct HkILBHandle;

#define HKVALUEBASE_MEMBERS \
	__int64				SignedIntData;	\
	unsigned __int64	UnsignedIntData;	\
	float				FloatData;			\
	double				DoubleData;



struct HkSixteenByteData
{
	unsigned char data[16];
};

struct HkPal
{
	unsigned char* Pointer;
	long Length;
};




struct HkPalWrappingLockBytesBuffer
{
	unsigned char data[32];
};

union HkValue
{
	
	
	HKVALUEBASE_MEMBERS

	
	
	struct HkSixteenByteData SixteenByteData;

	
	
	struct HkInt128 Int128Data;

	
	
	struct HkPal PalData;

	
	
	struct HkILBHandle* LockBytesData;
};

struct HkProcContext
{
	struct HkDatabase* Database;
	struct HkTransaction* Transaction;
	struct HkTransaction* TableVarTransaction;
	struct HkErrorObject* ErrorObject;
	unsigned char* DeepDataBuffer;
	struct HkTdsContext* TdsContext;
	union HkValue* HkValuesBuffer;
	unsigned char* NullsBuffer;
	unsigned char* IsOutputParamBuffer;
	unsigned long HkValuesBufferSize;
	struct HkTable** TableVars;
	struct HkTable** TableParams;
	struct IHkStatementPerf* StmtPerf;
	struct IHkStatementExecStats* StmtExecStats;
	struct HkTxDeltaTracker* DeltaTracker;
	__int64 Rowcount;
	unsigned char* UpdateBitVector;
	bool DefaultForUpdateBitVector;
	bool IsInTrigger;
	bool IsInvokedFromExecStmt;
	bool IsDllRequiredAtCommit;
};



typedef __checkReturn HRESULT
( __stdcall *ProcEntryPoint)(
	__in struct HkProcContext* context,
	__in union HkValue* valueArray,
	__in unsigned char* nullArray);

struct HkQueryStmtInfo
{
	int					Offset;
	int					OffsetEnd;
	unsigned long		LineNum;
	unsigned long		QdsDataIndex;

	
	
	
	
	
	long*				ParentQueryNodeIds;
	long*				ExecutionsInheritance;
	bool*				DidGenerateGetFirstLabel;
	bool*				WasPassedReturnRowLabel;

	
	
	unsigned long		ArrayLengths;
};





struct HkCollationType
{
	
	
	unsigned long CollationId;

	
	
	bool Unicode;

	
	
	bool Lob;
};



struct HkCollationCallback
{
	
	
	void* CompareString;

	
	
	void* HashString;
};

struct HkProcInfo
{
	ProcEntryPoint			ProcFn;
	ProcEntryPoint			TdsParseProcFn;
	ProcEntryPoint			TdsReturnProcFn;
	unsigned long			BufferSpaceNeeded;
	unsigned short			MaxNestedExecScalarParams;
	unsigned short			MaxNestedExecTableParams;
	unsigned short			MaxOutputColumns;
	unsigned short			MaxOrderByColumns;
	unsigned short			MaxStvfOutputColumns;
	unsigned long			TableVarsCount;
	unsigned long			TableParamsCount;
	unsigned long const*	TableVarsMDOffsets;
	unsigned long			TableTypeCount;
	unsigned int*			TableTypeIds;
	unsigned char*			InternalTablesNeededForType;
	struct HkTableMD const**	TableTypeMDs;
	bool					SortBufferNeeded;
	bool					TopSortBufferNeeded;
	bool					BlobHandleFactoryNeeded;
	unsigned char			ProcIsolationLevel;
	bool					DelayedDurability;
	unsigned short			MinClientForOutputTDSOptimization;
	unsigned int			CountTablesStabilize;
	struct HkRootTableRowBase** TableRowsStabilize;
	unsigned long			ProcQueryStmtCount;
	struct HkQueryStmtInfo*	ProcQueryStmtInfo;
	unsigned int			CountTables;
	HkTableId*				TableIds;
	HkTableId*				DRTableIds;
	unsigned int*			HostTableIds;

	
	
	
	
	
	
	
	
	
	
	
	
	__int64					MaxRefTablesCreationTs;
	unsigned long			MaxRefTablesCreationTsHostTableId;
};










static unsigned __int64 const InvalidCSRID = (unsigned __int64) -1;








#define MAKE_CSRID(rgid, rid) ((unsigned __int64) (rgid) << 32) + (unsigned __int64) (rid)
#define RGID_FROM_CSRID(csrid) (unsigned int) ((unsigned __int64) (csrid) >> 32)
#define RID_FROM_CSRID(csrid) (unsigned int) ((unsigned __int64) (csrid) & ULONG_MAX)














struct DeletedRowsTableRow
{
	unsigned int			RowGroupId;
	unsigned int 			BeginRID;
	unsigned int			EndRID;
};






struct DeletedRowsTableKey
{
	unsigned int			RowGroupId;
	unsigned int 			BeginRID;
};





struct HkMaskFunctionArgument
{
	int XvtType;	
	union
	{
		__int64 IntegerValue;
		double DoubleValue;
		struct HkInt128 Int128Value;
		struct HkPal PalValue;
	} Value;
};





struct HkMaskingParameters
{
	int MaskingFunction;						
	struct HkMaskFunctionArgument Arguments[3];	
	short MaskingEnabled;
};



struct HkStmtExecStatsData
{
	
	
	__int64* ActualRows;
	__int64* ActualEndOfScans;
	__int64* ActualExecutions;
	__int64* ActualTicks;
	__int64* ActualCpuTicks;
};

typedef void
(*CountCharactersFn)(
	__in_bcount(bufferSize) const unsigned char* buffer,
	__in unsigned long bufferSize,
	__in unsigned long numberOfCharactersToRead,
	__out unsigned long* bytesRead,
	__out unsigned long* charactersRead);

typedef unsigned short
(*TruncLenFn)(
	__in_bcount(bufferSize) unsigned char* buffer,
	__in long bufferSize);

struct HkStringUtils
{
	unsigned char BaseCharacterSize;
	CountCharactersFn CountCharacters;
	TruncLenFn TruncBufferLength;
};

#if !defined(HKRAPI)
	#if defined(HKRUNTIME_BUILD)
		#define HKRAPI extern "C" __declspec(dllexport)
	#else
		#if defined(__cplusplus)
			#define HKRAPI extern "C" __declspec(dllimport)
		#else
			#define HKRAPI __declspec(dllimport)
		#endif
	#endif
#endif





#if !defined(HKAPICC)
	#if defined(_X86_)
		#define HKAPICC __cdecl
	#else
		#define HKAPICC
	#endif
#endif

HKRAPI __checkReturn HRESULT HKAPICC
HkRtWaitForDependencies(__in struct HkProcContext *hkcontext, unsigned long currentLineNo, HRESULT hrCurrent);

HKRAPI __checkReturn HRESULT HKAPICC
HkRtWaitForDependenciesEx(__in struct HkProcContext *hkcontext, unsigned long currentLineNo, HRESULT hrCurrent);

