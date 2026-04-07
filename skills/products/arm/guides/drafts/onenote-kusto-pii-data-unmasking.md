# How to Get Unmasked PII Data in Kusto

## Problem
Kusto databases have compliance requirements that mask sensitive user data (PII). For example, HTTP incoming requests from Front Door will have `clientIpAddress` masked (formatted like `{PII:Hxxx(<mixed_data>)}`).

## Solution

### For ARM Requests
ARM records the **source namespace** directly, which can be used in Jarvis to find unmasked data:

1. Query ARM Kusto (e.g. `HttpIncomingRequests`) — note the masked PII fields
2. Find the corresponding ARM request's source namespace
3. Use that namespace in **Jarvis (Geneva raw data)** to look up the unmasked values

### For Other Kusto Databases
For databases that have PII data but no source namespace recorded:
- Refer to the Kusto-to-Jarvis mapping guide (MCVKB 7.10) to find the correct Jarvis endpoint

## Key Points
- PII masking is a Kusto compliance requirement, not a bug
- Geneva raw data / Jarvis retains unmasked values
- The mapping between Kusto tables and Jarvis endpoints varies by service

## Source
- MCVKB 8.10 "How to get value for PII data in kusto" (Simon Xin)
