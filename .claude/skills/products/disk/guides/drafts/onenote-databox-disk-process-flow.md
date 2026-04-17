# Data Box Disk Process Flow Guide (Mooncake)

> Source: OneNote - Data Box Disk Process Test (实测记录)

## MS-Managed Shipping Timeline

| Phase | Action | Portal Status | ASC Status | Typical Duration |
|-------|--------|---------------|------------|-----------------|
| 1 | Create Job (Customer) | Ordered | DeviceOrdered | Minutes |
| 2 | Prepare Disk (Ops) | Processed | DevicePrepared | Up to 5 business days |
| 3 | Dispatch to carrier (Ops) | Processed | Dispatched | 1 business day |
| 4 | Deliver to customer | Delivered | Delivered | 2-3 business days |
| 5 | Prepare Data (Customer) | Delivered | Delivered | Varies |
| 6 | Return disk (Customer) | Picked up | PickedUp | 2-3 business days |
| 7 | Receive at DC (Ops) | Received | AtAzureDC | 1 business day |
| 8 | Data Copy (Ops) | Data Copy in Progress | DataCopy | < 1 business day |
| 9 | Complete | Completed/CompletedWithErrors | Completed | < 1 business day |

## Self-Managed Shipping Timeline

| Phase | Action | Portal Status | ASC Status | Typical Duration |
|-------|--------|---------------|------------|-----------------|
| 1 | Create Job | Ordered | DeviceOrdered | 3 business days to prepare |
| 2 | Prepare Disk (Ops) | Pending user action for pick-up | DevicePrepared → ReadyToDispatchFromAzureDC | 1 business day |
| 3 | Schedule Pickup | Ready for Pickup | ReadyToDispatchFromAzureDC | Customer-dependent |
| 4 | Pick up at DC | Picked Up | Delivered | Customer-dependent |
| 5 | Prepare Data | Picked Up | Delivered | Customer-dependent |
| 6 | Schedule drop-off | Pending user action for drop-off | ReadyToReceiveAtAzureDC | Customer-dependent |
| 7 | Drop-off at DC | Ready to receive | ReadyToReceiveAtAzureDC | Same day possible |
| 8 | Receive (Ops) | Received | AtAzureDC | < 1 business day |
| 9 | Data Copy (Ops) | Data Copy in Progress | DataCopy | < 1 business day |
| 10 | Complete | Completed/CompletedWithErrors | Completed | < 1 business day |

## Key Operational Tips

### Ordering
- **Address**: Department/Co line will NOT be printed on shipping label
- **First-time orders**: Datacenter may call to verify customer address
- **Estimated total lead time**: Order to data upload ~2-3 weeks

### Notifications
- **Mooncake default mailbox cannot receive notifications** — customer must add valid external mailbox
- Use ASC to check shipment status if emails not received

### Self-Managed Shipping Specifics
- Customer emails Ops team with pickup details (person, date)
- Security records NOT required; carrier/person can pick up at DC Gate
- DC local operator hours: 9:00 - 17:00 workday (confirm beforehand)
- Authorization code required for pickup

### Carrier Notes (Mooncake)
- COVID-19 may cause carrier switches (e.g., FedEx → EMS) for delivery area coverage
- Different carriers have different area limitations

### Post-Completion
- **CRITICAL**: Once data copy completes (success or error), disk enters erasure stage immediately
- If customer needs disk for troubleshooting, must contact Ops or Support ASAP before erasure
- Customer will receive email about disk erasure (may be delayed)

### Self-Managed Return
- Customer can manage order flexibly based on schedule
- Follow up with Ops via email to ensure timely processing after drop-off
