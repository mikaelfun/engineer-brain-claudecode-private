---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Zone is Not Available Error in Azure DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20Not%20Available%20Error%20in%20Azure%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer is trying to create a DNS zone but gets error "The zone {zone name} is not available."

[[_TOC_]]

## Scenario

Customer is attempting to create a DNS Zone in Azure DNS but is receiving the error "The zone {zone name} is not available."

## Details and Solution
First see which of the following cases are true
### Too many child zones
0. Check if the customer already has too many child zones. One common reason is that they have too many child zones such that they used up all the 9 nameservers (a.k.a buckets). Now they want to create the parent zone but are unable to do so. See appendix below for detailed explanation.
    - If yes, then Solution 1: check if customer can delete zones mapped to one of the nameservers, create the parent zone and then recreate the child zones. In most cases, customer are not using those child zones. 
       - Only if they are not able to delete it for some valid reason, proceed to Now What?
   - If no, then proceed to final solution
   - Sample kusto query for existing zones:
     
     **DNS++**
     ```
     https://azuredns.kusto.windows.net/dnsbillingprod
     cluster('AzureDns').database('dnsbillingprod').ZoneEvent
     | where PreciseTimeStamp > ago(2h)
     | where ZoneName endswith "contoso.net"
     | project ZoneName, BucketId, BucketIdDecimal = HexToInt(BucketId), CurrentRecordSetCount, MaxRecordSetCount, SubscriptionId, ResourceGroup
     | order by BucketIdDecimal 
     ```
     *Available Buckets:* 1-9, 32-38, and in future 80-87

     *Reserved Buckets (only DRIs can create zones here):* 41-47, 201-209, and more in future


###zone in other subscription
1. Using sample kusto queries from above, check other zones with overlapping name (i.e. one is a substring of other). See appendix below for some examples
    - If there are zones (parent or child zone), it may be in different subscription - either owned by them, or someone else took the name. 
    - If the subscription is owned by them or their aad tenant then check with customer. 
    - If not, then check who the other subscription is - could be valid user, or security (sniper) team or malicious user. 
    - If it's taken over by someone else, then generally there's no guarantee that the zone name is available. They can try a different name for the zone if possible. 
    - Only if they are not able to do so, then we can help create it in our reserved bucket by following the final solution below in "Now What" section.

###Now what?
What to do if the above fails or is not an option
1. Confirm customer claims domain name ownership
    1. Explain to the customer that the zone create failed because Azure DNS was unable to allocate name servers to the given zone name, because of conflicts with existing zones.
    2. Ask the customer if they are the legal owner of the domain name:
        1. If so, explain that we can create the zone for them, after which they will be able to manage the zone and record sets as normal. If they are happy to proceed, move to step 2.
        2. If not, explain to the customer that they will have to choose a different zone name. Do not proceed further - they should self-provision the zone e.g. via the Portal.
2. Verify that the customer owns the domain name
    1. Before going further, you need to verify that the customer does indeed own the domain name of the zone they are trying to create, as they claim. To do this, we will ask them to create a DNS record in the domain with the existing DNS hoster, and then verify that the DNS record can be resolved.
    2. The DNS record name we shall use is 'azurednsverify.{zone name}'. For example, if the zone name is 'contoso.com', the record name is 'azurednsverify.contoso.com'. We shall use the TXT record type.
        1. Firstly, check that the DNS verification record does not already exist. Use a tool such as http://digwebinterface.com to query for a TXT record with the above name.
        2. Ask customer to create a DNS 'TXT' record with the name 'azurednsverify' and a random string for the body
        3. Verify the TXT record resolves correctly.
        4. Once verified, continue with steps below.
3. Please submit this information in a post to the [Azure DNS Channel](https://teams.microsoft.com/l/channel/19%3ace3dd4b2cd344917aabafed17244bd98%40thread.skype/Azure%2520DNS?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) in Microsoft Teams for TA review so we can consider the creation of an ICM so that PG can manually create the record for the customer

    - Here is an ICM for reference: [102943627](https://icm.ad.msft.net/imp/v3/incidents/details/102943627/home)

# Appendix

## Nameserver/Bucket Exhaustion
There is a limitation that we enforce where a zone cannot be assigned the same bucket as any of its ancestors or descendants. A child zone cannot be assigned the same nameserver as its parent or grandparent or child or grandchild. Siblings can still share the same nameserver as each other.

### Happy path
We want to create zone eu.prd.ls.powerplatform.com and au.prd.ls.powerplatform.com and let's assume there are only 4 nameservers to pick from (0-3).

1. powerplatform.com is assigned to nameserver 0
2. ls.powerplatform.com cannot be assigned to 0, so it is assigned to nameserver 1
3. prd.ls.platform.com cannot be assigned to 0 or 1, so it is assigned to nameserver 2
4. eu.prd.ls.powerplatform.com cannot be assigned to 0 or 1 or 2, so it is assigned to nameserver 3
5. au.prd.ls.powerplatform.com cannot be assigned to 0 or 1 or 2, so it is also assigned to nameserver 3

### Sad path
1. powerplatform.com is assigned to nameserver 0
2. ls.powerplatform.com cannot be assigned to 0, so it is assigned to nameserver 1
3. prd.ls.platform.com cannot be assigned to 0 or 1, so it is assigned to nameserver 2
4. il105a.eu.prd.ls.powerplatform.com cannot be assigned to 0 or 1 or 2, so it is assigned to nameserver 3
5. When we try to create eu.prd.ls.powerplatform.com, zone creation fails because we have run out of nameservers.

### Solutions
1. The owner should clean up any unused zones that are children/grandchildren of eu.prd.ls and au.prd.ls.
2. If solution #1 is not possible, then follow the **Now What** section above.
