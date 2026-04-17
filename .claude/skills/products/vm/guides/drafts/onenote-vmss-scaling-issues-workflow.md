# VMSS Scaling Issues Troubleshooting Workflow

> Source: OneNote MCVKB 2.27 | Draft - pending SYNTHESIZE review

## Scoping Questions
1. Manual scale or Autoscale?
2. Has this worked before? When was last success?
3. Error message?
4. Is VMSS in AKS / Azure DevOps / Service Fabric cluster?

### Autoscale-Specific Questions
1. Expected scaling behavior? What metrics trigger scale?
2. How are autoscale rules declared (Portal/template/third-party)?
3. Does manual scale work if autoscale is disabled?
4. Evidence of misfired autoscale (Azure Monitor data)?

## Scale Operation Ownership
- **AKS cluster**: Check Scaling tab in ASC. No autoscale data = AKS cluster autoscaler. Verify via Client Application Id in Tenant Explorer. Engage AKS team.
- **Azure DevOps scale set agent**: Engage Azure DevOps Services team.
- **Service Fabric cluster**: Engage SF team on collab before mitigation (risk of quorum loss).

## Known Limitations
- `singlePlacementGroup=true`: max 100 instances
- `singlePlacementGroup=false`: Platform Image max 1000, Custom Image max 600
- **singlePlacementGroup cannot be reverted to true once set to false**
- Quota limits can block scaling
- Resource group locks can prevent operations

## Common Error Messages
| Error | Cause | Action |
|---|---|---|
| QuotaExceededWithPortalLink | vCPU quota exceeded | Request quota increase |
| AllocationFailed | Cluster out of capacity | Follow Allocation Failures TSG |
| SubnetIsFull | No available IPs in subnet | Expand subnet |
| ComputerNamePrefixTooLongForScaleOut | Name prefix too long | Shorten prefix |
| TooManyRequestsReceived | API throttling | Reduce request rate |
| InboundNatPoolFrontendPortRange... | LB NAT pool range too small | Increase port range |
| NetworkingInternalOperationError | NRP validation timeout | Retry later |
| VmssUDWalkTimeoutException | UD walk timeout (often SF) | Engage SF team |
| RetryableError | NRP concurrent resource conflict | Retry operation |

## Kusto Queries
See companion guide: `onenote-vmss-kusto-queries-reference.md`
