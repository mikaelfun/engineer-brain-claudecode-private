# ExpressRoute Correlation ID Retrieval

> Source: [Get operation correlation ID from Activity Log](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/get-correlation-id)

## Purpose

Get the unique Correlation ID from Azure Activity Log for an ExpressRoute resource (circuit, gateway, connection, or peering) to include in support tickets for cross-service troubleshooting.

## Steps

1. Sign in to [Azure Portal](https://portal.azure.com/)
2. Navigate to ExpressRoute resource → **Activity log** (left menu)
3. Apply filters: operation type, resource type, date/time range
4. Select the activity log entry of interest
5. Switch to **JSON** view
6. Use browser Find (Ctrl+F) to search for `correlationId`
7. Copy the correlation ID for the support request
