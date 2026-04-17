---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Delivery Partners/Internal Processes/Handling Volume Spikes Among Intune DPs"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Delivery%20Partners/Internal%20Processes/Handling%20Volume%20Spikes%20Among%20Intune%20DPs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

# Scope
- This process applies to Intune Unified Premier, Partner, and Broad Commercial cases.
- This process applies to Intune Global English volumes on weekdays only (Monday - Friday).
- This process has been approved by the SDMs and applies to all regions.


# Workflow
**Routing -> Monitoring -> Reporting out -> Mitigate the risk**

1. **Initial Allocation**: Cases are allocated to DPs based on predefined percentages via auto-routing (updated monthly based on capacity changes).

2. **Monitoring**: Each DP and aligned PTA must continuously monitor their case volumes in their own queue and resource availability.

3. **Identifying Volume Spikes**: A volume spike is identified when a DP anticipates they will not be able to handle all allocated cases within SLA due to resource constraints. Broadly this can occur:
   - (a) Overall increase in case inflow
   - (b) Mismatch between capacity and assigned volume
   - (c) DP having lesser capacity
   
   > The situation needs to be assessed and approved by PTAs/SDMs.

4. **Report out the volume spikes**:
   - The DP experiencing a volume spike must immediately notify their PTA(s), provide details of the expected shortfall and the reason.
   - The PTA will reach out to PTAs of other DPs in the same region to seek assistance. Request should include:
     - Number of cases that need to be reassigned
     - Expected duration of the resource challenge
     - Any specific requirements or constraints

5. **Sequence for redistributing cases by region**:
   - **Americas**: Wicloud → Sherweb, Tek (Premier), LTIM, CNX Nicaragua
   - **APAC**: Wicresoft should be the first point of transfer, followed by LTIMindtree
   - **INDIA**: Sherweb, LTIMindtree
   - **EMEA**: LTIMindtree, Sherweb, CNX EMEA and Teleperformance

6. **Reallocation of Cases**:
   - PTAs of assisting DPs will review current workloads and resource availability.
   - If capacity available, they will agree to move cases to the corresponding DP queue.

7. **Confirmation**:
   - The PTA of the DP experiencing the spike will confirm reallocation with all involved parties.
   - Updated allocation plan shared with all SDMs and Vikram via DL 'Vikram Directs' (vikdirects@microsoft.com).

8. **Follow-Up**:
   - The assisting DP provides corresponding updates on status of reassigned cases to ensure SLA compliance.
   - A post-incident review will be conducted to identify improvements for future volume spikes.

9. **Particularities and Regional Support**:
   - Some DPs only support specific regions. If they receive cases outside their shift, they should reach out to PTAs for re-alignment.


# Roles and Responsibilities

## Delivery Partners (DPs)
- Monitor case volumes and resource availability.
- Notify PTA of volume spikes or regional restraint.
- Provide updates on reassigned cases.

## Partner Technical Advisors (PTAs)
- Coordinate assistance requests with regional PTAs and SDM:
  - APAC: Junya/Vanaja
  - EMEA: Andreea/Ram
  - ATZ: Juan
  - Japan: Eiichi
- Review workloads and resource availability.
- Confirm and document case reallocations.
- Conduct post-incident reviews.

## Stakeholders
- SDMs
