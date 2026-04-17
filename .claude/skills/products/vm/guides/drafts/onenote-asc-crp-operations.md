# Using ASC for CRP Deployment Operation Troubleshooting

## Steps
1. Open ASC and select the target subscription
2. Navigate to **Operations** -> **CRP Operations**
3. Find the failed operation and expand it
4. Check the detailed error message
5. Review the "context" field (if available) for additional diagnostics

## Notes
- CRP Operations view shows all Compute Resource Provider operations for the subscription
- Failed operations include detailed error codes and messages
- Cross-reference operationId with Jarvis/Kusto for deeper investigation
