//*********************************************************************
// Copyright (c) Microsoft Corporation.
//*********************************************************************
















#pragma once




#include "hkengdef.h"

#define ALTER_TABLE_DATASIZE_UNKNOWN	USHRT_MAX	




#define INDEX_CHNG_MAP_NO_CHANGES ((unsigned char*)(-1))

struct HkTable;
struct HkTransaction;
struct HkDatabase;
struct HkSequenceObj;



typedef unsigned long HkHash;














typedef void
(*KeyIncrementFn)(
	__in const struct HkFlatKey* source,
	__out struct HkSearchKey* target);









typedef __checkReturn __int64
(*CompareSKeyToFKeyFn)(
	__in const struct HkSearchKey* left,
	__in const struct HkFlatKey* right);









typedef __checkReturn __int64
(*CompareFKeyToFKeyFn)(
	__in const struct HkFlatKey* left,
	__in const struct HkFlatKey* right);














typedef __checkReturn __int64
(*CompareSKeyToRowFn)(
	__in const struct HkSearchKey* key,
	__in const struct HkRow* row);














typedef __checkReturn __int64
(*CompareRowToRowFn)(
	__in const struct HkRow* left,
	__in const struct HkRow* right);








typedef __checkReturn HkHash
(*ComputeSKeyHashFn)(
	__in const struct HkSearchKey* key);








typedef __checkReturn HkHash
(*ComputeFKeyHashFn)(
	__in const struct HkFlatKey* key);













typedef __checkReturn HkHash
(*ComputeRowHashFn)(
	__in const struct HkRow* row);
















typedef __checkReturn HRESULT
(*ExtractFlatKeyFn)(
	__in const struct HkRow* row,
	__out_bcount_part(bufferSize, *keySize) struct HkFlatKey* key,
	__in unsigned short bufferSize,
	__out unsigned short* keySize);



typedef enum
{
	
	
	HkHashIndexType = 0,

	
	
	HkRangeIndexType = 1,

	
	
	HkHeapIndexType = 2,
} HkIndexType;



enum HkIndexFlags
{
	HkIdxFlags_None = 0x0000,

	
	
	HkIdxFlags_IsUnique = 0x0001,

	
	
	
	
	
	HkIdxFlags_FixedSizeKeys = 0x0002,

	
	
	
	HkIdxFlags_NormalizedKeys = 0x0004,
};



struct HkHashIndexMD
{
	
	
	
	unsigned long MdIndexId;	

	
	
	unsigned short IndexFlags;

	
	
	unsigned int NumberOfBuckets;

	
	
	
	
	
	
	CompareSKeyToRowFn		CompareSKeyToRow;
	CompareRowToRowFn		CompareRowToRow;
	ComputeSKeyHashFn		ComputeSKeyHash;
	ComputeRowHashFn		ComputeRowHash;
};



struct HkRangeIndexMD
{	
	
	
	
	unsigned long MdIndexId;	

	
	
	unsigned short IndexFlags;

	
	
	
	unsigned short FlatKeySize;

	
	
	
	
	
	unsigned short SearchKeySize;

	
	
	struct HkFlatKey const* InfinityKey;

	
	
	unsigned short InfinityKeySize;

	
	
	
	
	
	
	CompareSKeyToFKeyFn		CompareSKeyToFKey;
	CompareFKeyToFKeyFn		CompareFKeyToFKey;
	CompareSKeyToRowFn		CompareSKeyToRow;
	CompareRowToRowFn		CompareRowToRow;
	ComputeFKeyHashFn		ComputeFKeyHash;
	ExtractFlatKeyFn		ExtractFlatKey;
	KeyIncrementFn			KeyIncrement;
};












typedef void
(*FreeRowResourcesFn)(
	__in struct HkDatabase* db,
	__in struct HkRow* row);












typedef __checkReturn unsigned long
(*GetSerializeSizeFn)(
	__in const struct HkRow* row);












typedef __checkReturn HRESULT
(*SerializeFn)(
	__in const struct HkRow* row,
	__out_bcount_part(bufferSize, *copySize) unsigned char* buffer,
	__in unsigned short bufferSize,
	__out unsigned short* copySize);






































typedef __checkReturn HRESULT
(*DeserializeFn)(
	__in struct HkCallbackContext* hkContext,
	__in struct HkTable* table,
	__in_bcount(dataSize) const unsigned char* data,
	__in unsigned short dataSize,
	__in unsigned long hkTableId,
	__in bool calledFromCkptLoad,
	__out struct HkRow** row);






















typedef void
(*LargeDataSerializeFn)(
	__in const struct HkRow* row,
	__in unsigned long largeDataOffset,
	__out_bcount_part(bufferSize, *copySize) unsigned char* buffer,
	__in unsigned short bufferSize,
	__out unsigned short* copySize);




























typedef __checkReturn HRESULT
(*LargeDataDeserializeFn)(
	__in struct HkDatabase* db,
	__in const struct HkTable* table,
	__inout struct HkRow* row,
	__in unsigned long largeDataOffset,
	__in_bcount(dataSize) const unsigned char* data,
	__in unsigned short dataSize);














typedef __checkReturn unsigned short
(*GetSerializeRecKeySizeFn)(
	__in const struct HkRow* row);















typedef __checkReturn HRESULT
(*SerializeRecKeyFn)(
	__in const struct HkRow* row,
	__out_bcount_part(bufferSize, *copySize) unsigned char* buffer,
	__in unsigned short bufferSize,
	__out unsigned short* copySize);













typedef __checkReturn HRESULT
(*DeserializeRecKeyFn)(
	__in_bcount(dataSize) const unsigned char* data,
	__in unsigned short dataSize,
	__out_bcount(bufferSize) struct HkSearchKey* key,
	__in unsigned short bufferSize);




































typedef __checkReturn HRESULT
(*DeserializeRecKeyToRowFn)(
	__in_bcount(keyBufferSize) const unsigned char* keyBuffer,
	__in unsigned short keyBufferSize,
	__out_bcount(rowBufferSize) struct HkRow* rowBuffer,
	__in unsigned short rowBufferSize,
	__out unsigned short* rowSize);

























typedef __checkReturn HRESULT
(*ProcessCustomLogRecFn)(
	__in struct HkDatabase* db,
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in_bcount(dataSize) unsigned char const* data,
	__in unsigned short dataSize);
























typedef __checkReturn HRESULT
(*PostCheckpointLoadFn)(
	__in struct HkDatabase* db,
	__in struct HkTable* table,
	__in struct HkTransaction* tx);

















typedef void
(*PostCommitProcessingFn)(
	__in struct HkTable* table,
	__in_opt struct HkRow const* oldRow,
	__in_opt struct HkRow const* newRow);








enum HkTableFlags
{
	
	
	HkTableFlags_None = 0x0000,

	
	
	HkTableFlags_IsNonDurable = 0x0001,

	
	
	
	HkTableFlags_AllowsBackgroundInsertsAndDeletes = 0x0002,

	
	
	
	HkTableFlags_StoresLobData = 0x0004,

	
	
	
	
	HkTableFlags_CkptLoadIntoPKIndexOnly = 0x0008,

	
	
	HkTableFlags_Default = HkTableFlags_None
};



struct HkTableMD
{
	
	
	
	size_t MinRowSize;
	
	
	
	
	size_t MaxRowSize;

	
	
	unsigned int CountHeaps;

	
	
	unsigned int CountHashIndices;

	
	
	struct HkHashIndexMD* HashIndexMD;

	
	
	unsigned int CountRangeIndices;

	
	
	struct HkRangeIndexMD* RangeIndexMD;

	
	
	
	
	
	
	
	
	
	unsigned int RecoveryIndex;

	
	
	void const* OpaqueData;

	
	
	
	
	
	
	
	unsigned int HostTableId;

	
	
	enum HkTableFlags TableFlags;

	
	
	
	unsigned int MaxBufferNeededForAlter;

	
	
	FreeRowResourcesFn			FreeRowResources;
	GetSerializeSizeFn			GetSerializeSize;
	SerializeFn					Serialize;
	DeserializeFn				Deserialize;
	LargeDataSerializeFn		LargeDataSerialize;
	LargeDataDeserializeFn		LargeDataDeserialize;
	GetSerializeRecKeySizeFn	GetSerializeRecKeySize;
	SerializeRecKeyFn			SerializeRecKey;
	DeserializeRecKeyFn			DeserializeRecKey;
	DeserializeRecKeyToRowFn	DeserializeRecKeyToRow;
	ProcessCustomLogRecFn		ProcessCustomLogRec;
	PostCheckpointLoadFn		PostCheckpointLoad;
	PostCommitProcessingFn		PostCommitProcessing;
};




struct HkCallbackContext
{
	
	
	struct HkErrorObject* ErrorObject;

	
	
	unsigned char* DeepDataBuffer;

	
	
	struct HkTransaction* Transaction;
};

HKEAPI void HKAPICC
HkTableReleaseRow(
	__in struct HkTable* table,
	__in struct HkRow* row);

HKEAPI void HKAPICC
HkTableAddRefRow(
	__in struct HkTable* table,
	__inout struct HkRow* row);

HKEAPI void HKAPICC
HkTableReleaseRows(
	__in struct HkTable* table,
	__in_ecount(rowCount) struct HkRow** rows,
	__in unsigned long rowCount);

HKEAPI void HKAPICC
HkTableReleaseLinkedRows(
	__in struct HkTable* table,
	__in struct HkRow* rows);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableInsert(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in struct HkRow* row,
	__in bool isInvisibleToSelf);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableInsertLinkedRows(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in struct HkRow* row);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableUpdate(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in struct HkRow* rowToUpdate,
	__in struct HkRow* newRow,
	__in const unsigned char* indexChangeMap,
	__in bool allowInvisibleRow,
	__out_opt struct HkRow** updatedRow);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableDelete(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in struct HkRow* row,
	__out_opt struct HkRow** updatedRow);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableRefreshInternalTableMapping(
	__in struct HkTable* table,
	__in struct HkTransaction* tx);

HKEAPI void HKAPICC
HkTableDropTempTable(
	__in struct HkTable* table);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableGetNextLobId(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__out HkLobId* lobId);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableCreateNewLob(
	__in struct HkTable* table,
	__in unsigned long columnId,
	__in_opt struct HkErrorObject* errorObject,
	__out struct HkLockBytes** hkLockBytes);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableCreateNewOffRowDeepData(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in unsigned __int64 dataLength,
	__out unsigned char** data);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableInsertLob(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in HkLobId lobId,
	__in struct HkLockBytes* hkLockBytes);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableInsertOffRowDeepData(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in HkLobId lobId,
	__in unsigned __int64 length,
	__in unsigned char* data);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableDeleteLob(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in HkLobId lobId);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableGetLobFromId(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in HkLobId lobId,
	__out struct HkLockBytes** hkLockBytes);

HKEAPI __checkReturn HRESULT HKAPICC
HkTableGetOffRowDeepFromId(
	__in struct HkTable* table,
	__in struct HkTransaction* tx,
	__in unsigned long columnId,
	__in HkLobId lobId,
	__out unsigned char** data,
	__out unsigned long* length);

HKEAPI void HKAPICC
HkOffRowDataFree(
	__in struct HkTable* table,
	__in unsigned long columnId,
	__in unsigned char* data);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionAllocMemory(
	__in struct HkTransaction* tx,
	__in unsigned long size,
	__deref_out_bcount(size) unsigned char** txMemory);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionCreateSavePoint(
	__in struct HkTransaction* tx,
	__out HkTxSavePointId* id);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionCreateHkTempDbSavePoint(
	__in struct HkTransaction* tx,
	__out HkTxSavePointId* id);

HKEAPI void HKAPICC
HkTransactionRefreshSavePoint(
	__in struct HkTransaction* tx,
	__in HkTxSavePointId id);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionRollbackToSavePoint(
	__in struct HkTransaction* tx,
	__in HkTxSavePointId id);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionRollbackToLastHkTempDbSavePoint(
	__in struct HkTransaction* tx);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionWaitForDependencies(
	__in struct HkTransaction* tx,
	__in struct HkWait* wait);

HKEAPI __checkReturn HRESULT HKAPICC
HkRefreshStatementId(
	__in struct HkTransaction* tx);

HKEAPI __checkReturn HRESULT HKAPICC
HkTransactionDeltaTrackerAlloc(
	__in struct HkTransaction* tx,
	__deref_out struct HkTxDeltaTracker** tracker);

HKEAPI void HKAPICC
HkTransactionDeltaTrackerFree(
	__in struct HkTxDeltaTracker* tracker);

HKEAPI __checkReturn HRESULT HKAPICC
HkRowAlloc(
	__in struct HkTransaction* transaction,
	__in struct HkTable* table,
	__in unsigned int heapId,
	__in unsigned long rowSize,
	__in bool storageBeginField,
	__in unsigned long long tag,
	__out struct HkRow** row,
	__in_opt const struct HkRow* prevRow);

HKEAPI __checkReturn HRESULT HKAPICC
HkCursorHashAlloc(
	__in struct HkTable* table,
	__in unsigned int indexId,
	__in FilterFn filterFunction,
	__in unsigned int bufferRequiredForFilter,
	__out_opt struct HkErrorObject* error, 
	__out struct HkCursorHash** cursorHash,
	__in_opt char const* tag);

HKEAPI void HKAPICC
HkCursorHashFree(
	__in struct HkCursorHash* cursor);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorHashGetFirst(
	__in struct HkCursorHash* cursor,
	__in struct HkTransaction* tx,
	__in struct HkSearchKey const* key,
	__in_opt struct HkParam const* params,
	__in TxIsoLevel isoLevel,
	__in bool isScanForFKValidation,
	__out struct HkRow const** row);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorHashGetNext(
	__in struct HkCursorHash*  cursor,
	__out_opt struct HkErrorObject* error,
	__out struct HkRow const** row);

HKEAPI __checkReturn HRESULT HKAPICC
HkCursorRangeAlloc(
	__in struct HkTable* table,
	__in unsigned int indexId,
	__in FilterFn filterFunction,
	__in unsigned int bufferRequiredForFilter,
	__out_opt struct HkErrorObject* error, 
	__out struct HkCursorRange** cursorRange,
	__in_opt char const* tag);

HKEAPI void HKAPICC
HkCursorRangeFree(
	__in struct HkCursorRange* cursor);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorRangeGetFirst(
	__in struct HkCursorRange* cursor,
	__in struct HkTransaction* tx,
	__in struct HkSearchKey const* startKey,
	__in struct HkSearchKey const* endKey,
	__in_opt struct HkParam const* params,
	__in TxIsoLevel isoLevel,
	__in bool isScanForFKValidation,
	__out struct HkRow const** row);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorRangeGetNext(
	__in struct HkCursorRange* cursor,
	__out_opt struct HkErrorObject* error,
	__out struct HkRow const** row);

HKEAPI __checkReturn HRESULT HKAPICC
HkCursorHeapAlloc(
	__in struct HkTable* table,
	__in unsigned int heapId,
	__in FilterFn filterFunction,
	__in unsigned int bufferRequiredForFilter,
	__out_opt struct HkErrorObject* error, 
	__out struct HkCursorHeap** cursorHeap,
	__in_opt char const* tag);

HKEAPI void HKAPICC
HkCursorHeapFree(
	__in struct HkCursorHeap* cursor);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorHeapGetFirst(
	__in struct HkCursorHeap* cursor,
	__in struct HkTransaction* tx,
	__in_opt struct HkParam const* params,
	__in TxIsoLevel isoLevel,
	__in unsigned long sampleRate,
	__in bool isScanForFKValidation,
	__out struct HkRow const** row);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorHeapGetNext(
	__in struct HkCursorHeap* cursor,
	__out_opt struct HkErrorObject* error,
	__out struct HkRow const** row);

HKEAPI __checkReturn HRESULT HKAPICC
HkCursorDeltaTrackerAlloc(
	__out_opt struct HkErrorObject* error,
	__deref_out struct HkCursorDeltaTracker** cursor);

HKEAPI void HKAPICC
HkCursorDeltaTrackerFree(
	__in struct HkCursorDeltaTracker* cursor);

HKEAPI __checkReturn HRESULT HKAPICC
HkCursorDeltaTrackerGetFirst(
	__in struct HkCursorDeltaTracker* cursor,
	__in struct HkTxDeltaTracker const* tracker,
	__in struct HkTable const* table,
	__in bool inserted,
	__deref_out struct HkRow const** row);

HKEAPI __checkReturn __success(return == S_OK) HRESULT HKAPICC
HkCursorDeltaTrackerGetNext(
	__in struct HkCursorDeltaTracker* cursor,
	__out_opt struct HkErrorObject* error,
	__deref_out struct HkRow const** row);

HKEAPI __checkReturn HRESULT HKAPICC
HkSequenceObjGetNext64(
	__in struct HkTransaction* tx,
	__in struct HkSequenceObj* seqObj,
	__out __int64* value64);

HKEAPI __checkReturn HRESULT HKAPICC
HkSequenceObjGetNext128(
	__in struct HkTransaction* tx,
	__in struct HkSequenceObj* seqObj,
	__out struct HkInt128* value128);

HKEAPI void HKAPICC
HkTransactionUpdateTemporalTs(
	__in struct HkTransaction* tx,
	__in __int64 newTs);
