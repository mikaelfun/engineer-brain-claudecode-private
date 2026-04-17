# ExpressRoute Gateway Migration Troubleshooting

> Source: [Azure ExpressRoute gateway migration - Troubleshooting errors and best practices](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/gateway-migration-error-messaging)

## Best Practices

- Maintain all resources in **Succeeded** state throughout migration
- Don't update FastPath, route weight, or traffic toggles during migration
- Migrate gateways on same circuit **sequentially** (no parallel)
- Don't manually create/delete/update/reset gateways or connections with admin state enabled
- Check for maintenance before creating connections

## Migration Stages and Common Issues

| Stage | Issue | Resolution |
|-------|-------|------------|
| Validate | Resources not in succeeded state | GET + SET on affected resources |
| Prepare | New resource creation fails | Retry; if still fails, delete new resources and retry |
| Migrate | Both gateways remain enabled after failure | Redirect traffic to old gateway, retry migration |
| Commit | Old gateway stays enabled, commit fails | Retry migration step, then delete old gateway |
| Abort | Resource cleanup fails | Redirect traffic to new gateway, retry abort |

## Resolvable Error Scenarios

| Error | Resolution |
|-------|------------|
| Insufficient GatewaySubnet size | Delete and recreate GatewaySubnet as /27 or shorter (/26, /25) |
| Legacy connection mode (pre-2017) | Delete and recreate all connections before migration |
| Dedicated HSM connected to VNet | Deallocate the dedicated HSM |
| Resources in failed state | Ensure all resources are Succeeded before starting |
| Default gateway SKU | Upgrade to Standard SKU before migration |
| FastPath config change during migration | Keep FastPath in original configuration |
| Route weight change during migration | Revert route weight to original value |

## Unsupported Scenarios (No Resolution)

| Error | Cause |
|-------|-------|
| Max gateway count in VNet reached | VNet can't have >2 ExpressRoute gateways |
| Connection limit exceeded | Can't migrate to gateway with lower connection limit |
| FastPath restriction | FastPath connections only migrate to UltraPerf/ERGW3AZ |
| Revoked circuit authorization | Can't migrate with revoked authorizations |
