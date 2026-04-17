# Capacity Reservation Billing Scenarios

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/capacity-reservation-billing-scenerios

## Key Billing Rules

- Capacity Reservations are priced at the same rate as the underlying VM size
- You are billed for reserved quantity regardless of whether the reservation is used
- When a VM is deployed against the reservation, you pay only for the VM (not double-billed)
- Both used and unused capacity reservations are eligible for Reserved Instances discounts

## Example: 10 D2s_v3 Reserved, 5 Deployed

- 5 D2s_v3 VMs (used reservation) + 5 unused reservation = 10 total billed at D2s_v3 rate
- If customer has 2 Reserved Instances for D2s_v3, those 2 are zeroed out (applied to either VM or unused reservation)

## Example: Mixed with Reserved Instances

- 2 reserved quantity + 1 matching Reserved VM Instance
- RI discount applied to one unused instance (cost = 0)
- Other instance charged at PAYG rate
- When VM allocated against reservation: VM components (disks, network, extensions) also billed
- RI discount can apply to either VM or unused capacity instance

## Important Notes

- Allocated VM incurs charges for disks, networking, extensions in addition to compute
- RI discounts are flexible - can apply to VM or unused capacity interchangeably
