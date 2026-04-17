---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Check for Network Issues for SCC Service"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/Check%20for%20Network%20Issues%20for%20SCC%20Service"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Check for Network Issues for SCC Service

Determine if the issue is in the SCC or Babylon Space

## Limitations of using this script
- XML Policy will contain company private information. Need permission to share that info to the ticket or PG.
- Does not provide scoping information.
- User needs to have access to some labels.
- Labels will be user specific
- Not compatible with multifactor authentication

## Requirements
- Python 3.0
- Pip install Urllib3
- scc_pinger.py - Download and unzip the Python script from the wiki attachment

## Options when Running Script
- username //required will return labels relative to that user
- password //required
- maxFailures //before script will stop
- delay //between execution
- useFiddlerProxy //Can also start fiddler
- email

## Running the script

### Example 1: Is SCC working?
Regional failure may cause SCC to be down, or tenant specific issues or policy.

```
python scc_pinger.py --username customer@company.com --password xxxxxx
```

Expected Results: Successfully getting xml policy from SCC. Connect to global endpoint then redirect to internal regional (will have regional prefix) point for policy xml.

Unsuccessful results are usually connectivity problems. Connectivity problems discuss with SCC.

### Example 2: What are the stats?
Failure count, response time, failure rate.

```
python scc_pinger.py --username customer@company.com --password xxxxxx --iterations
```

### Example 3: Get script policy xml (also requires fiddler)

```
python scc_pinger.py --username customer@company.com --password xxxxxx -useFiddlerProxy
```

Unsuccessful results: May have invalid policy credentials and need to discuss with SCC.
