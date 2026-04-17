# Using Jarvis to Trace Hung Deployment Tasks

## CRP Jarvis Dashboard
- **URL**: https://jarvis-west.dc.ad.msft.net/517C8C55
- **Activity ID** = Operation ID (find it in ASC)

## Steps
1. Get the Service Request ID from ASC (this is the Activity ID)
2. Open the Jarvis dashboard link above
3. Enter the Activity ID to view operation trace
4. Analyze the trace timeline to identify where the deployment is stuck

## When to Use
- VM deployment appears hung (no progress for extended period)
- Need to identify which step in the deployment pipeline is blocking
- ASC shows operation in progress but no error
