//*********************************************************************
// Copyright (c) Microsoft Corporation.
//*********************************************************************















#pragma once

#define FAILED(hr) (((HRESULT)(hr)) < 0)
#define SUCCEEDED(hr) (((HRESULT)(hr)) >= 0)
#define HRESULT_FACILITY(hr) (((hr) >> 16) & 0x1fff)



#define ROWTAG(id) (((UINT64)(id) << 32) | __LINE__)

#if defined(__cplusplus)
	
	
	#define HKGAPI extern "C" extern
#else
	#define HKGAPI
#endif







#define HKNOALIAS_USEWITHCAUTION __declspec(noalias)

struct IHkStatementPerf;
struct HkSearchKey;



struct HkILBHandle;



struct HkStringUtils;





HKGAPI const wchar_t* jsonWstr;
HKGAPI const wchar_t* jsonValueWstr;
HKGAPI const wchar_t* jsonQueryWstr;
HKGAPI const wchar_t* jsonModifyWstr;
HKGAPI const wchar_t* stringEscapeWstr;
HKGAPI const wchar_t* nullWstr;

#ifdef HKCODEGEN
	
	
	HKGAPI void
	hkassert_fail(
		unsigned int, 
		const char* exp, 
		const char* file, 
		int line, 
		const char* fmt, ...);

	
	
	
	#define utassert_fail hkassert_fail

	
	
	
	#ifndef DBG_ASSERT
		#ifdef DEBUG
			#define DBG_ASSERT(exp) ((exp) ? 0 : hkassert_fail(0 , #exp, __FILE__, __LINE__, 0))
		#else
			#define DBG_ASSERT(exp)
		#endif
	#endif

	#ifndef RTL_ASSERT
		#define RTL_ASSERT(exp) ((exp) ? 0 : hkassert_fail(1 , #exp, __FILE__, __LINE__, 0))
	#endif
#endif



#define IVS_HIGH_SURROGATE          0xDB40
#define IVS_LOW_SURROGATE_START     0xDD00
#define IVS_LOW_SURROGATE_END       0xDDEF





#define IS_SINGLE_UNIT_VS(wch) (((wch) >= 0xFE00 && (wch) <=  0xFE0F) || ((wch) >= 0x180B && (wch) <= 0x180D))



#define IS_IVS_HIGH_SURROGATE(wch) ((wch) == IVS_HIGH_SURROGATE)



#define IS_IVS_LOW_SURROGATE(wch)  (((wch) >= IVS_LOW_SURROGATE_START) && ((wch) <= IVS_LOW_SURROGATE_END))

#ifndef IS_SURROGATE
	#define IS_SURROGATE(wch) (wch >= HIGH_SURROGATE_START && wch <= LOW_SURROGATE_END)
#endif

HKGAPI __forceinline __checkReturn __int64
Min(__int64 a, __int64 b)
{
	return (a < b) ? a : b;
}

HKGAPI __forceinline __checkReturn __int64
Max(__int64 a, __int64 b)
{
	return (a > b) ? a : b;
}

HKGAPI __forceinline __checkReturn long
ConvertCompareKeysResult(__int64 result64);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeNullHash( __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_int64(
	__int64 key,
	 __inout unsigned long* hashState);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_int128(
	struct HkInt128 key,
	 __inout unsigned long* hashState);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_int(
	int key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline __checkReturn __int64
Compare64And64(
	__int64 key1,
	__int64 key2);
HKGAPI __forceinline __checkReturn __int64
Compare64And64Fast(
	__int64 key1,
	__int64 key2);
HKGAPI __forceinline __checkReturn __int64
Compare128And128(
	struct HkInt128 key1,
	struct HkInt128 key2);
HKGAPI __forceinline __checkReturn __int64
Compare128And128Fast(
	struct HkInt128 key1,
	struct HkInt128 key2);
HKGAPI __forceinline __checkReturn __int64
Compare256And256(
	struct HkInt256 key1,
	struct HkInt256 key2);
HKGAPI __forceinline __checkReturn __int64
Compare256And256Fast(
	struct HkInt256 key1,
	struct HkInt256 key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare16And16(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare32And32(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare64And64(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare128And128(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare256And256(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
SKeyCompare320And320(
	struct HkSearchKey const* key1,
	struct HkSearchKey const* key2);

HKGAPI __forceinline __checkReturn __int64
CompareKeys_int(
	int key1,
	int key2);
HKGAPI __forceinline __checkReturn __int64
CompareKeys_short(
	short key1,
	short key2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_short(
	short key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline __checkReturn __int64
CompareKeys_uchar(
	unsigned char key1,
	unsigned char key2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_uchar(
	unsigned char key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline __checkReturn __int64
CompareKeys_double(
	double key1,
	double key2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_double(
	double key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
IncrementKey_double(
	double source,
	__out double* target);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
DecrementKey_double(
	double source,
	__out double* target);

HKGAPI __forceinline __checkReturn __int64
CompareKeys_float(
	float key1,
	float key2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_float(
	float key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
IncrementKey_float(
	float source,
	__out float* target);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
DecrementKey_float(
	float source,
	__out float* target);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareKeys_Strings(
	unsigned char const* key1,
	long key1Len,
	unsigned char const* key2,
	long key2Len);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareKeys_Bin(
	__in_bcount(key1Len) unsigned char const* key1,
	long key1Len,
	__in_bcount(key2Len) unsigned char const* key2,
	long key2Len);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareKeys_WideStrings(
	__in_bcount(key1Len) unsigned char const* key1,
	long key1Len,
	__in_bcount(key2Len) unsigned char const* key2,
	long key2Len);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareLobs_Bin(
	__in struct HkILBHandle* lob1,
	__in struct HkILBHandle* lob2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareLobs_Strings(
	__in struct HkILBHandle* lob1,
	__in struct HkILBHandle* lob2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn __int64
CompareLobs_WideStrings(
	__in struct HkILBHandle* lob1,
	__in struct HkILBHandle* lob2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_Strings(
	unsigned char const* key,
	long keyLen,
	 __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_WideStrings(
	__in_bcount(keyLen) unsigned char const* key,
	long keyLen,
	 __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_Bin(
	__in_bcount(keyLen) unsigned char const* key,
	long keyLen,
	 __inout unsigned long* hashState);

HKGAPI __forceinline __checkReturn __int64
CompareKeys_guid(
	struct HkSixteenByteData key1,
	struct HkSixteenByteData key2);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn  unsigned long
ComputeHash_guid(
	struct HkSixteenByteData key,
	 __inout unsigned long* hashState);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
IncrementKey_guid(
	struct HkSixteenByteData source,
	__out struct HkSixteenByteData* target);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
DecrementKey_guid(
	struct HkSixteenByteData source,
	__out struct HkSixteenByteData* target);

HKGAPI __forceinline __checkReturn HRESULT
RowSerialize(
	__in_bcount(serializeSize) struct HkRow const* row,
	__in unsigned long serializeSize,
	__out_bcount_part(bufferSize, serializeSize) unsigned char* buffer,
	__in unsigned short bufferSize,
	__in unsigned short* copySize);

HKGAPI __forceinline __checkReturn HRESULT
RowDeserialize(
	__in struct HkTransaction* tx, 
	__in struct HkTable* table, 
	__in_bcount(datasize) unsigned char const* data, 
	__in unsigned short datasize, 
	__in unsigned short minRowSize,
	__in unsigned short maxRowSize,
	__in unsigned int heapId,
	__out struct HkRow** row);

HKGAPI __forceinline void
SetFloatingPointControl();
HKGAPI __forceinline void
SetFloatingPointControlTruncate();
HKGAPI __forceinline void
SetFloatingPointControlExact();

HKGAPI __checkReturn int
ExceptionFilter(unsigned int code, __out HRESULT* hr);
HKGAPI __checkReturn int
ExceptionFilterExactFloat(unsigned int code, double val, __out float* dest, __out HRESULT* hr);
HKGAPI __checkReturn int
ExceptionFilterExactFloatToInt(unsigned int code, double val, __out __int64* dest, __out HRESULT* hr);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned char
Fits128Into64(struct HkInt128 const* value);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned char
Fits256Into64(struct HkInt256 const* value);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned char
Fits256Into128(struct HkInt256 const* value);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned char
Fits320Into256(struct HkInt320 const* value);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128To64(struct HkInt128 const* value, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert256To64(struct HkInt256 const* value, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert256To128(struct HkInt256 const* value, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert64To128(__int64 value, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert320To256(struct HkInt320 const* value, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert256To320(struct HkInt256 const* value, __out struct HkInt320* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128To256(struct HkInt128 const* value, __out struct HkInt256* res);

HKGAPI  __inline HKNOALIAS_USEWITHCAUTION void
Convert128ToDouble(struct HkInt128 const* value, __out double* res);
HKGAPI  __inline HKNOALIAS_USEWITHCAUTION void
Convert128ToFloat(struct HkInt128 const* value, __out float* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert64ToDoubleWithScale64(__int64 value, unsigned __int64 scale, double scaleRecip, __out double* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128ToDoubleWithScale64(struct HkInt128 const* value, unsigned __int64 scale, double scaleRecip, __out double* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128ToDoubleWithScale128(struct HkInt128 const* value, struct HkInt128 const* scale, double scaleRecip, __out double* res);
HKGAPI  __forceinline HKNOALIAS_USEWITHCAUTION void
Convert64ToFloatWithScale64(__int64 value, unsigned __int64 scale, double scaleRecip, __out float* res);
HKGAPI  __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128ToFloatWithScale64(struct HkInt128 const* value, unsigned __int64 scale, double scaleRecip, __out float* res);
HKGAPI  __forceinline HKNOALIAS_USEWITHCAUTION void
Convert128ToFloatWithScale128(struct HkInt128 const* value, struct HkInt128 const* scale, double scaleRecip, __out float* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ConvertDoubleTo64(double value, __out __int64* res);
HKGAPI __inline HKNOALIAS_USEWITHCAUTION void
ConvertDoubleTo128(double value, __out struct HkInt128* res);
HKGAPI __inline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvertDoubleTo64WithScale64(double value, __int64 scale, __out __int64* res);
HKGAPI __inline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvertDoubleTo128WithScale64(double value, __int64 scale, __out struct HkInt128* res);
HKGAPI __inline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvertDoubleTo128WithScale128(double value, struct HkInt128 const* scale, __out struct HkInt128* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftRight128To64Unsafe(struct HkInt128 const* value, unsigned char shift, __out __int64* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftRight256To64Unsafe(struct HkInt256 const* value, unsigned char shift, __out __int64* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftRight128To128(struct HkInt128 const* value, unsigned char shift, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftRight256To128Unsafe(struct HkInt256 const* value, unsigned char shift, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftRight256To256(struct HkInt256 const* value, unsigned char shift, __out struct HkInt256* result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft64To128Unsafe(__int64 value, unsigned char shift, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft64To256Unsafe(__int64 value, unsigned char shift, __out struct HkInt256* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft64To320Unsafe(__int64 value, unsigned char shift, __out struct HkInt320* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft128To320Unsafe(struct HkInt128* input, unsigned char shift, __out struct HkInt320* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft128To128Unsafe(struct HkInt128 const* input, unsigned char shift, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft128To256Unsafe(struct HkInt128 const* input, unsigned char shift, __out struct HkInt256* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft256To256Unsafe(struct HkInt256 const* input, unsigned char shift, __out struct HkInt256* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShiftLeft320To320Unsafe(struct HkInt320 const* input, unsigned char shift, __out struct HkInt320* result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
Equal128And256(struct HkInt128 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
NotEqual128And256(struct HkInt128 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan128And256(struct HkInt128 const* a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThan256And256(struct HkInt256 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan128And256(struct HkInt128 const* a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThan256And256(struct HkInt256 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
LessThanOrEqualTo128And256(struct HkInt128 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo128And64(struct HkInt128 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo64And128(__int64 a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo128And128(struct HkInt128 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo256And64(struct HkInt256 const* a, __int64 b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo64And256(__int64 a, struct HkInt256 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo256And128(struct HkInt256 const* a, struct HkInt128 const* b);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
GreaterThanOrEqualTo128And256(struct HkInt128 const* a, struct HkInt256 const* b);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsNeg128(struct HkInt128 const* a);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsZero128(struct HkInt128 const* a);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsNeg256(struct HkInt256 const* a);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Negate64(__int64 input, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Negate128Unsafe(struct HkInt128 const* input, __out struct HkInt128* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
BitFlip128(struct HkInt128 const* input, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
BitFlip256(struct HkInt256 const* input, __out struct HkInt256* result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or128And64(__in struct HkInt128 const* input1, __in __int64 input2, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or128And128(__in struct HkInt128 const* input1, __in struct HkInt128 const* input2, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or256And128(__in struct HkInt256 const* input1, __in struct HkInt128 const* input2, __out struct HkInt256* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or256And256(__in struct HkInt256 const* input1, __in struct HkInt256 const* input2, __out struct HkInt256* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or320And256(__in struct HkInt320 const* input1, __in struct HkInt256 const* input2, __out struct HkInt320* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Or320And320(__in struct HkInt320 const* input1, __in struct HkInt320 const* input2, __out struct HkInt320* result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
And128And64(__in struct HkInt128 const* input1, __in __int64 input2, __out __int64* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
And128And128(__in struct HkInt128 const* input1, __in struct HkInt128 const* input2, __out struct HkInt128* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
And256And64(__in struct HkInt256 const* input1, __in __int64 input2, __out __int64* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
And256And128(__in struct HkInt256 const* input1, __in struct HkInt128 const* input2, __out struct HkInt128* result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Add64And64(__int64 a, __int64 b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Add128And64(struct HkInt128 const* a, __int64 b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Add64And128(__int64 a, struct HkInt128 const* b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Add128And128(struct HkInt128 const* a, struct HkInt128 const* b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add128And256Unsafe(struct HkInt128 const* a, struct HkInt256 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add256And64Unsafe(struct HkInt256 const* a, __int64 b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add256And128Unsafe(struct HkInt256 const* a, struct HkInt128 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add256And192Unsafe(struct HkInt256 const* a, struct HkInt192 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add256And256Unsafe(struct HkInt256 const* a, struct HkInt256 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Add256And256(struct HkInt256 const* a, struct HkInt256 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add320And64Unsafe(struct HkInt320 const* a, __int64 b, __out struct HkInt320* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add320And128Unsafe(struct HkInt320 const* a, struct HkInt128 const* b, __out struct HkInt320* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void 
Add320And320Unsafe(struct HkInt320 const* a, struct HkInt320 const* b, __out struct HkInt320* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Subtract64And64(__int64 a, __int64 b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Subtract128And64(struct HkInt128 const* a, __int64 b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Subtract64And128(__int64 a, struct HkInt128 const* b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Subtract128And128(struct HkInt128 const* a, struct HkInt128 const* b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Subtract256And64(struct HkInt256 const* a, __int64 b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Subtract256And128(struct HkInt256 const* a, struct HkInt128 const* b, __out struct HkInt256* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Multiply64By64Res64(__int64 a, __int64 b, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Multiply64By64(__int64 a, __int64 b, struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Multiply128By64(struct HkInt128 const* a, __int64 b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Multiply64By128(__int64 a, struct HkInt128 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Multiply128By128(struct HkInt128 const* a, struct HkInt128 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Multiply128By192(struct HkInt128 const* a, struct HkInt192 const* b, __out struct HkInt256* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Multiply64By192(__int64 a, struct HkInt192 const* b, __out struct HkInt256* res);


HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide64By64(__int64 a, __int64 b, __out __int64* result);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64Unsafe(struct HkInt128 const* a, __int64 b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By128Unsafe(struct HkInt128 const* a, struct HkInt128 const* b, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide256By64(struct HkInt256 const* a, __int64 b, __out struct HkInt128* res);
HKGAPI __checkReturn HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide256By128(struct HkInt256 const* a, struct HkInt128 const* b, __out struct HkInt128* res);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Modulo64By64(__int64 a, __int64 b, __out __int64* res, __out __int64* rem);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Modulo64By128Unsafe(__int64 a, struct HkInt128 const* b, __out __int64* rem);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Modulo128By64Unsafe(struct HkInt128 const* a, __int64 b, __out __int64* rem);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Modulo128By128Unsafe(struct HkInt128 const* a, struct HkInt128 const* b, __out struct HkInt128* rem);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide64By64Rec(__int64 a, unsigned __int64 b, unsigned __int64 x, __out __int64* res, enum DivRecExactness exact);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide64By64RecTruncDown(__int64 a, unsigned __int64 b, unsigned __int64 x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64RecUnsafeTruncDown(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64RecTruncDown(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By128RecUnsafeTruncDown(struct HkInt128 const* a, struct HkInt128 const* b, unsigned __int64 x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide64By64RecTruncUp(__int64 a, unsigned __int64 b, unsigned __int64 x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64RecUnsafeTruncUp(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64RecTruncUp(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out struct HkInt128* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By128RecUnsafeTruncUp(struct HkInt128 const* a, struct HkInt128 const* b, unsigned __int64 x, __out __int64* res);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide64By64RecTruncDownRem(__int64 a, unsigned __int64 b, unsigned __int64 x, __out __int64* res, __out __int64* rem);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
Divide128By64RecUnsafeTruncDownRem(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out __int64* res, __out __int64* rem);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide128By64RecUnsafe(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out __int64* res, enum DivRecExactness exact);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide128By64Rec(struct HkInt128 const* a, unsigned __int64 b, struct HkInt128 const* x, __out struct HkInt128* res, enum DivRecExactness exact);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide128By128RecUnsafe(struct HkInt128 const* a, struct HkInt128 const* b, unsigned __int64 x, __out __int64* res, enum DivRecExactness exact);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide256By64Rec(struct HkInt256 const* a, unsigned __int64 b, struct HkInt192 const* x, __out struct HkInt128* res, enum DivRecExactness exact);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
Divide256By128Rec(struct HkInt256 const* a, struct HkInt128 const* b, struct HkInt192 const* x, __out struct HkInt128* res, enum DivRecExactness exact);

HKGAPI __forceinline __checkReturn double
Atn2(double x, double y);
HKGAPI __forceinline __checkReturn double
Degrees(double x);
HKGAPI __forceinline __checkReturn double
Radians(double x);
HKGAPI __forceinline __checkReturn double
Square(double x);

HKGAPI __forceinline __checkReturn HRESULT
YieldCheck(__in struct HkProcContext* hkcontext, unsigned int yc, unsigned long lineNo);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
RTrimBinary(__in_ecount(length) const unsigned char* value, long length);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
RTrimChar(__in_ecount(length) const unsigned char* value, long length);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
RTrimWChar(__in_ecount(length) const unsigned char* value, long length);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LTrimChar(__in_ecount(length) const unsigned char* value, long length);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LTrimWChar(__in_ecount(length) const unsigned char* value, long length);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
LTrimVarcharLob(__in struct HkProcContext* hkcontext, __in struct HkILBHandle * ilbh, __out struct HkILBHandle ** handle);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
LTrimNVarcharLob(__in struct HkProcContext* hkcontext, __in struct HkILBHandle * ilbh, __out struct HkILBHandle ** handle);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
RTrimVarcharLob(__in struct HkProcContext* hkcontext, __in struct HkILBHandle * ilbh, __out struct HkILBHandle ** handle);
HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
RTrimNVarcharLob(__in struct HkProcContext* hkcontext, __in struct HkILBHandle * ilbh, __out struct HkILBHandle ** handle);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
TrimOneArgStr(__in_bcount(length) unsigned char* stringToTrim, unsigned long length, __inout struct HkPal* result);
HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
TrimOneArgWstr(__in_bcount(length) unsigned char* stringToTrim, unsigned long length, __inout struct HkPal* result);
HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
TrimOneArgStrLob(__in struct HkProcContext* hkContext, __in struct HkILBHandle * stringToTrim, __out struct HkILBHandle ** result);
HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
TrimOneArgWstrLob(__in struct HkProcContext* hkContext, __in struct HkILBHandle * stringToTrim, __out struct HkILBHandle ** result);

HKGAPI HKNOALIAS_USEWITHCAUTION void
ConcatWsStr(
	__in_ecount(size) unsigned char** stringsToConcat,
	__in_ecount(size) unsigned long* length,
	__in_ecount(size) bool* isNull,
	unsigned long size,
	__inout struct HkPal* result);

HKGAPI HKNOALIAS_USEWITHCAUTION void
ConcatWsWstr(
	__in_ecount(size) unsigned char** stringsToConcat,
	__in_ecount(size) unsigned long* length,
	__in_ecount(size) bool* isNull,
	unsigned long size,
	__inout struct HkPal* result);

HKGAPI HKNOALIAS_USEWITHCAUTION HRESULT
ConcatWsLob(
	__in struct HkProcContext* context,
	__in_ecount(size) struct HkILBHandle** stringsToConcat,
	__in_ecount(size) bool* isNull,
	unsigned long size,
	__inout struct HkILBHandle ** result);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsDBCSLeadChar_CP932(const unsigned char* character);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsDBCSLeadChar_CPOther(const unsigned char* character);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn bool
IsHighSurrogateWChar(const unsigned char* value);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LenCharDBCS_CP932(
	__in_ecount(length) const unsigned char* value, long length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LenCharDBCS_CPOther(
	__in_ecount(length) const unsigned char* value, long length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_String(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_WideString(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_WCharUTF16(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_WCharUTF16VSA(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_CharDBCS_CP932(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned long
GetLobLen_CharDBCS_CPOther(struct HkILBHandle* lob);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_String(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_WideString(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_WCharUTF16(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_WCharUTF16VSA(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_CharDBCS_CP932(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
GetLobSubstring_CharDBCS_CPOther(__in struct HkProcContext* hkcontext, __in struct HkILBHandle* ilbh, __int64 charOffset, __int64 charLength, __out struct HkILBHandle** handle);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LenWChar(__in_ecount(length) const unsigned char* value, long length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LenWCharUTF16(__in_ecount(length) const unsigned char* value, long length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
LenWCharUTF16VSA(__in_ecount(length) const unsigned char* value, long length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
ShrinkSubstrLenToFit(__inout __int64 *offset, __inout __int64 *length);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
GetSubstringOffsetAndLengthDBCS_CP932(
	__in_ecount(stringLength) const unsigned char* value,
	long stringLength,
	__int64 charOffset,
	__int64 charLength,
	long maxByteLength,
	__out unsigned short* byteOffset,
	__out unsigned short* byteLength);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
GetSubstringOffsetAndLengthDBCS_CPOther(
	__in_ecount(stringLength) const unsigned char* value,
	long stringLength,
	__int64 charOffset,
	__int64 charLength,
	long maxByteLength,
	__out unsigned short* byteOffset,
	__out unsigned short* byteLength);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
GetSubstringOffsetAndLengthUTF16(
	__in_ecount(stringLength) const unsigned char* value,
	long stringLength,
	__int64 charOffset,
	__int64 charLength,
	long maxByteLength,
	__out unsigned short* byteOffset,
	__out unsigned short* byteLength);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
GetSubstringOffsetAndLengthUTF16VSA(
	__in_ecount(stringLength) const unsigned char* value,
	long stringLength,
	__int64 charOffset,
	__int64 charLength,
	long maxByteLength,
	__out unsigned short* byteOffset,
	__out unsigned short* byteLength);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
GetDBCSTruncLen_CP932(unsigned char* value, long srclen);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn unsigned short
GetDBCSTruncLen_CPOther(unsigned char* value, long srclen);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn long
GetByteLengthOfTrailingHighSurrogate(
	long oldByteLength,
	__in_ecount(oldByteLength) unsigned char* value,
	long newByteLength);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION __checkReturn long
GetByteLengthOfTrailingBrokenVariationSequence(
	long oldByteLength,
	__in_ecount(oldByteLength) unsigned char* value,
	long newByteLength);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvCharToBit(
	__in_bcount(strLength) const unsigned char*	str,
	__in long									strLength,
	__out __int64*								intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvWCharToBit(
	__in_bcount(strLength) const unsigned char*	str,
	__in long									strLength,
	__out __int64*								intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvCharToInt(
	__in_bcount(strLength) const unsigned char*	str,
	__in long								strLength,
	__out __int64*								intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvWCharToInt(
	__in_bcount(strLength) const unsigned char*	str,
	__in long									strLength,
	__out __int64*								intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvCharToLargeNumeric(
	__in_bcount(strLength)const unsigned char*  str,
	__in long							strLength,
	__in unsigned short							prec,
	__in unsigned short							scale,			
	__out struct HkInt128*						intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvWCharToLargeNumeric(
	__in_bcount(strLength)const unsigned char*  str,
	__in long									strLength,
	__in unsigned short							prec,
	__in unsigned short							scale,			
	__out struct HkInt128*						intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvCharToNumeric(
	__in_bcount(strLength)const unsigned char*  str,
	__in long									strLength,
	__in unsigned short							prec,
	__in unsigned short							scale,			
	__out __int64*								intValue);

HKGAPI HKNOALIAS_USEWITHCAUTION __checkReturn HRESULT
ConvWCharToNumeric(
	__in_bcount(strLength)const unsigned char*  str,
	__in long									strLength,
	__in unsigned short							prec,
	__in unsigned short							scale,			
	__out __int64*								intValue);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
hkmemcpy_s(
	__out_bcount_part(destSize, srcSize) void* dest,
	size_t destSize,
	__in_bcount(srcSize) const void* src,
	size_t srcSize);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
hkmemcpy_s_ex(
	__deref_inout_bcount_part(*destSize, srcSize) void** dest,
	__inout size_t* destSize,
	__in_bcount(srcSize) const void* src,
	size_t srcSize);

#if defined(__cplusplus)
template <size_t _Size, typename _DstType>
__forceinline HKNOALIAS_USEWITHCAUTION void
hkmemcpy_s(_DstType (&dest)[_Size], __in_bcount(srcSize) const void* src, size_t srcSize)
{
	return hkmemcpy_s(dest, _Size * sizeof(_DstType), src, srcSize);
}
#endif

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
hkwmemset(__out_bcount(_N) void* _S, wchar_t _C, size_t _N);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
hkwmemset_s_ex(
	__deref_inout_bcount_part(*bufferLength, _N * sizeof(wchar_t)) void** bufferPtr, 
	__inout size_t* bufferLength, 
	wchar_t _C, 
	size_t _N);

HKGAPI __forceinline HKNOALIAS_USEWITHCAUTION void
hkmemset_s_ex(
	__deref_inout_bcount_part(*bufferLength, _N) void** bufferPtr, 
	__inout size_t* bufferLength, 
	char _C, 
	size_t _N);

HKGAPI __forceinline void
ReportStmtStarted(__inout_opt struct IHkStatementPerf* stmtPerf);

HKGAPI __forceinline void
ReportStmtEnded(__inout_opt struct IHkStatementPerf* stmtPerf, unsigned long qindex, HRESULT execResult);

HKGAPI __forceinline void
SetStmtRowCount(__inout_opt struct IHkStatementPerf* stmtPerf, unsigned long qindex, __int64 rowCount);

HKGAPI __forceinline void
MeasureAndAggregateElapsedTime(
	__in_opt struct IHkStatementExecStats* stmtExecStats,
	__inout_ecount(arrayLengths) __int64* actualTicks,
	__inout_ecount(arrayLengths) __int64* actualCpuTicks,
	unsigned long arrayLengths,
	long qOpNodeId,
	unsigned long qindex);

HKGAPI __forceinline __checkReturn HRESULT
GenerateStmtStatistics(
	__in_opt struct IHkStatementExecStats* stmtExecStats,
	__in_ecount(arrayLengths) __int64* actualExecs,
	__in_ecount(arrayLengths) __int64* actualRows,
	__in_ecount(arrayLengths) __int64* actualTicks,
	__in_ecount(arrayLengths) __int64* actualCpuTicks,
	unsigned long arrayLengths,
	unsigned long qindex);




HKGAPI __forceinline void*
GetSortBufElem(__in void* context, long dirPageIndex);



HKGAPI __forceinline void*
GetTopSortBufElem(__in void* context, long index);



HKGAPI __forceinline __checkReturn struct HkCompareContext*
FetchCompareContext(__in void* context);

HKGAPI __checkReturn HRESULT
SendOptimizedMetadata(
	__in struct HkProcContext*		hkcontext,
	__in struct HkOutputMetadata*	hkoutput);

HKGAPI void
EndOptimizedResultSet(__in struct HkProcContext* hkcontext);

HKGAPI __checkReturn HRESULT
StartRow(__in struct HkProcContext* hkcontext);

HKGAPI void
EndRow(__in struct HkProcContext* hkcontext);

HKGAPI __checkReturn HRESULT
SendReturnStatus(__in struct HkProcContext* hkContext, __int64 status);

HKGAPI __checkReturn HRESULT
SendReturnValueMetadata(__in struct HkProcContext* hkContext, __in const unsigned char* const* metadata, __in const unsigned short* metadataLength);

HKGAPI __checkReturn HRESULT
SendUChar(__in struct HkProcContext* hkcontext, unsigned char value);

HKGAPI __checkReturn HRESULT
SendNullableUChar(__in struct HkProcContext* hkcontext, unsigned char value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendShort(__in struct HkProcContext* hkcontext, short value);

HKGAPI __checkReturn HRESULT
SendNullableShort(__in struct HkProcContext* hkcontext, short value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendLong(__in struct HkProcContext* hkcontext, long value);

HKGAPI __checkReturn HRESULT
SendNullableLong(__in struct HkProcContext* hkcontext, long value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendFloat(__in struct HkProcContext* hkcontext, float value);

HKGAPI __checkReturn HRESULT
SendNullableFloat(__in struct HkProcContext* hkcontext, float value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendDouble(__in struct HkProcContext* hkcontext, double value);

HKGAPI __checkReturn HRESULT
SendNullableDouble(__in struct HkProcContext* hkcontext, double value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendBigInt(__in struct HkProcContext* hkcontext, __int64 value);

HKGAPI __checkReturn HRESULT
SendNullableBigInt(__in struct HkProcContext* hkcontext, __int64 value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendMoney(__in struct HkProcContext* hkcontext, __int64 value);

HKGAPI __checkReturn HRESULT
SendNullableMoney(__in struct HkProcContext* hkcontext, __int64 value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendDateTime(__in struct HkProcContext* hkcontext, __int64 value);

HKGAPI __checkReturn HRESULT
SendNullableDateTime(__in struct HkProcContext* hkcontext, __int64 value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendSmallDateTime(__in struct HkProcContext* hkcontext, long value);

HKGAPI __checkReturn HRESULT
SendNullableSmallDateTime(__in struct HkProcContext* hkcontext, long value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendNumeric(__in struct HkProcContext* hkcontext, __int64 value);

HKGAPI __checkReturn HRESULT
SendNullableNumeric(__in struct HkProcContext* hkcontext, __int64 value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendLargeNumeric(__in struct HkProcContext* hkcontext, struct HkInt128 value);

HKGAPI __checkReturn HRESULT
SendNullableLargeNumeric(__in struct HkProcContext* hkcontext, struct HkInt128 value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendDate(__in struct HkProcContext* hkcontext, long value);

HKGAPI __checkReturn HRESULT
SendNullableDate(__in struct HkProcContext* hkcontext, long value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendTime(__in struct HkProcContext* hkcontext, __int64 value, long scale);

HKGAPI __checkReturn HRESULT
SendNullableTime(__in struct HkProcContext* hkcontext, __int64 value, long scale, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendDateTime2(__in struct HkProcContext* hkcontext, __int64 value, long scale);

HKGAPI __checkReturn HRESULT
SendNullableDateTime2(__in struct HkProcContext* hkcontext, __int64 value, long scale, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendGuid(__in struct HkProcContext* hkcontext, struct HkSixteenByteData value);

HKGAPI __checkReturn HRESULT
SendNullableGuid(__in struct HkProcContext* hkcontext, struct HkSixteenByteData value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendPal(__in struct HkProcContext* hkcontext, struct HkPal value);

HKGAPI __checkReturn HRESULT
SendNullablePal(__in struct HkProcContext* hkcontext, struct HkPal value, unsigned char isNull);

HKGAPI __checkReturn HRESULT
SendLockBytes(
	__in struct HkProcContext* hkcontext, 
	__in struct HkILBHandle* value, 
	long textSize, 	
	size_t sizeOfChar,
	__in_opt bool (*isDBCSLeadChar) (const unsigned char*),
	bool isVariationSelectorAware);

HKGAPI __checkReturn HRESULT
SendNullableLockBytes(
	__in struct HkProcContext* hkcontext,
	__in struct HkILBHandle* value,
	long textSize,
	size_t sizeOfChar,
	__in_opt bool(*isDBCSLeadChar) (const unsigned char*),
	bool isVariationSelectorAware,
	unsigned char isNull);

HKGAPI __checkReturn HRESULT
SkipBytes(__in struct HkProcContext* hkcontext, unsigned long len);

HKGAPI __checkReturn HRESULT
EndTdsParse(__in struct HkProcContext* hkContext);

HKGAPI __checkReturn HRESULT
ReadHkInt(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, long defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkBigInt(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkSmallInt(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, short defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkTinyInt(__in struct HkProcContext* hkContext, __out unsigned __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, unsigned char defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkBit(__in struct HkProcContext* hkContext, __out unsigned __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, unsigned char defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkFloat(__in struct HkProcContext* hkContext, __out float* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, float defaultParam, unsigned char isDefaultNull);
 
HKGAPI __checkReturn HRESULT
ReadHkDouble(__in struct HkProcContext* hkContext, __out double* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, double defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkSmallMoney(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, long defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkMoney(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkNumeric(__in struct HkProcContext* hkContext, __out __int64* value, long prec, long scale, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkLargeNumeric(__in struct HkProcContext* hkContext, __out struct HkInt128* value, long prec, long scale, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkInt128* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkSmallDateTime(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, long defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkDateTime(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkDate(__in struct HkProcContext* hkContext, __out __int64* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, long defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkTime(__in struct HkProcContext* hkContext, __out __int64* value, long scale, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkDateTime2(__in struct HkProcContext* hkContext, __out __int64* value, long scale, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __int64 defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkGuid(__in struct HkProcContext* hkContext, __out struct HkSixteenByteData* value, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkSixteenByteData* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkChar(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkVarChar(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkWChar(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkVarWChar(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkBin(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkVarBin(__in struct HkProcContext* hkContext, __out struct HkPal* value, unsigned short maxLength, __out unsigned char* isNull, unsigned char isOutputParam, unsigned char isDefaultParam, __in struct HkPal* defaultParam, unsigned char isDefaultNull);

HKGAPI __checkReturn HRESULT
ReadHkMaxType(
	__in struct HkProcContext* hkContext, 
	__out struct HkILBHandle* value, 
	unsigned short maxLength, 
	__out unsigned char* isNull, 
	unsigned char isOutputParam, 
	unsigned char isDefaultParam, 
	__in struct HkILBHandle* defaultParam, 
	unsigned char isDefaultNull, 
	unsigned char tdsToken);

HKGAPI __checkReturn HRESULT
AllocMemory(__in struct HkProcContext* hkContext, unsigned long bufferSize, __deref_out_opt void** buffer);




HKGAPI __checkReturn int
IfUpdate(__in_opt unsigned char* bitVector, bool defaultForBitVector, int columnId);




HKGAPI __checkReturn HRESULT
PopulateLob(__in struct HkLockBytes* dest, __in struct HkILBHandle* src);




HKGAPI void
ReleaseLob(__in struct HkILBHandle* lob);




HKGAPI void 
AddRefLob(__in struct HkILBHandle* lob);





HKGAPI __checkReturn HRESULT
CopyHkILBHandleToOutputParam(
	__in struct HkProcContext* hkContext,
	 struct HkILBHandle** src,
	unsigned long lobOutParamInd,
	bool isNull);




typedef __checkReturn HRESULT
(*LobAndOffRowDeleteFn)(
	__in struct HkTransaction* tx,
	__in struct HkRow const* hkRow);




HKGAPI __checkReturn HRESULT
DeleteLobsAndOffRowColumns(
	__in struct HkTransaction* tx,
	__in struct HkTxDeltaTracker* tracker,
	__in struct HkTable* table,
	__in LobAndOffRowDeleteFn lobAndOffRowDeleteFn);




HKGAPI __checkReturn struct HkStringUtils*
GetUtf16StringUtils();





HKGAPI __checkReturn struct HkStringUtils*
GetUtf16VsaStringUtils();




HKGAPI __checkReturn struct HkStringUtils*
GetDbcsCp932StringUtils();




HKGAPI __checkReturn struct HkStringUtils*
GetDbcsOtherStringUtils();