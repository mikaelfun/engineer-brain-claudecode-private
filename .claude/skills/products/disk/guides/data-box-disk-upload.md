# Disk Data Box Disk: DC Upload & Errors — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: data-box-disk, delay, icm, logistics, mailbox, mooncake, notification, order-status, pickup-delay, preparation-sla

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box Disk in Mooncake: customer does not receive notification emails because default mailbox is invalid | The default mailbox configured in Mooncake portal cannot receive external emails. | Customer needs to add a valid external mailbox in Data Box order notification settings. Use ASC to check shipment status | 🟢 8.5 | [MCVKB] |
| 2 | Data Box Disk Mooncake: customer complains disk preparation takes too long after order is placed, no estimated SLA shown | Disk preparation in Mooncake can take up to 5 business days (FAQ). CE3 region observed 3 days, BJB t | Set customer expectation: disk preparation may take up to 5 business days per FAQ. If exceeding, engage Data Box operati | 🟢 8.5 | [MCVKB] |
| 3 | Data Box Disk self-managed shipment Mooncake: after disks are ready, customer still needs to wait 1-2 business days befo | In self-managed shipment mode, DC requires security record for anyone entering the gate. This takes  | Inform customer about 1-2 business day wait after disks ready for security record. Once operation team provides Authoriz | 🟢 8.5 | [MCVKB] |
| 4 | Customer returned Data Box Disk with their own shipping label instead of Microsoft-provided label; no updates on order s | When a Data Box device is returned using a shipping label other than the one provided by Microsoft,  | 1) Get tracking information from customer shipment. 2) Create IcM with Data Box Operations Team with order details and t | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Data Box Disk in Mooncake: customer does not receive notification emails because → Customer needs to add a valid external mailbox in Data Box order notification settings `[来源: onenote]`
2. Data Box Disk Mooncake: customer complains disk preparation takes too long after → Set customer expectation: disk preparation may take up to 5 business days per FAQ `[来源: onenote]`
3. Data Box Disk self-managed shipment Mooncake: after disks are ready, customer st → Inform customer about 1-2 business day wait after disks ready for security record `[来源: onenote]`
4. Customer returned Data Box Disk with their own shipping label instead of Microso → 1) Get tracking information from customer shipment `[来源: ado-wiki]`
