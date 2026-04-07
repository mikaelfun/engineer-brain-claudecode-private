# Disk Data Box Disk: DC Upload & Errors — 详细速查

**条目数**: 4 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Data Box Disk in Mooncake: customer does not receive notification emails because default mailbox is 

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: The default mailbox configured in Mooncake portal cannot receive external emails.

**方案**: Customer needs to add a valid external mailbox in Data Box order notification settings. Use ASC to check shipment status.

**标签**: data-box-disk, mooncake, notification, mailbox

---

### 2. Data Box Disk Mooncake: customer complains disk preparation takes too long after order is placed, no

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Disk preparation in Mooncake can take up to 5 business days (FAQ). CE3 region observed 3 days, BJB took 1 day. SLA only documented in FAQ, not in order workflow or notifications.

**方案**: Set customer expectation: disk preparation may take up to 5 business days per FAQ. If exceeding, engage Data Box operations. Ref: docs.azure.cn/en-us/databox/data-box-disk-faq

**标签**: data-box-disk, mooncake, preparation-sla, delay, order-status

---

### 3. Data Box Disk self-managed shipment Mooncake: after disks are ready, customer still needs to wait 1-

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: In self-managed shipment mode, DC requires security record for anyone entering the gate. This takes 1-2 working days. In practice, carriers in China do pickup/dropoff at gate where DC operator takes package, so security record may not be strictly necessary.

**方案**: Inform customer about 1-2 business day wait after disks ready for security record. Once operation team provides Authorization code in portal, customer can contact DC operator. DC only operates on business days.

**标签**: data-box-disk, mooncake, self-managed-shipment, security-record, pickup-delay

---

### 4. Customer returned Data Box Disk with their own shipping label instead of Microsoft-provided label; n

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: When a Data Box device is returned using a shipping label other than the one provided by Microsoft, the return shipment is not linked to the Data Box order, preventing order status updates and delaying data transfer.

**方案**: 1) Get tracking information from customer shipment. 2) Create IcM with Data Box Operations Team with order details and tracking info. 3) Operations team notifies datacenter to locate package and start data transfer. Advise customer to always contact MS support before using own shipping label.

**标签**: data-box-disk, shipping-label, logistics, order-status, icm

---

