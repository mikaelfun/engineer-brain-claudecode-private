# HTTP Response Code Analysis for AKS Applications

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/get-and-analyze-http-response-codes

## Methods to Get HTTP Response Codes

### curl
```bash
curl -Iv http://<load-balancer-service-ip>:80/
```

### Browser DevTools
F12 / Ctrl+Shift+I > Network tab

### Other Tools
- Postman, wget, PowerShell `Invoke-WebRequest`

## Response Code Interpretation
| Code Range | Meaning |
|-----------|---------|
| 4xx | Client-side issue: page not found, permission denied, or network blocker (NSG/firewall) between client and server |
| 5xx | Server-side issue: application down, gateway failure |

## AKS-Specific Troubleshooting
- Get service IP: `kubectl get svc`
- Test from inside cluster: `curl -Iv http://<cluster-ip>:<port>/`
- Check pod health: `kubectl top pods`, `kubectl get pods`
- Check pod logs: `kubectl logs <pod> -c <container>`
