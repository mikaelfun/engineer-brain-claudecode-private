---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Billing/Billing and refund issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FBilling%2FBilling%20and%20refund%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]
# Overview
---
- If you have a credit request you should read this page in its entirety
- When discussing "refunds" with Azure customers, use the term "credit" in place of the word refund. It is only on rare occasions that we return money (refund); we typically credit a customer's account.
- Billing and credit issues will involve the Billing and Subscription Management team (ASMS) 
- Billing and credit cases could start in Azure Monitor or with the Billing Team (ASMS). Typically collabs are then sent to the other team to help resolve the issue.
- There are many considerations to keep in mind when dealing with billing and credit requests. This is the key point of this page.
- This page will allow Azure Monitor to set appropriate expectations that align with what Billing (ASMS) can do when a customer requests a refund or credit.

# Key things to know about credit requests
---
1. **The only place a credit decision is made is via the billing process which involves the Finance team.** Neither product teams nor CSS have the ability to provide or guarantee a credit. This means set or reset expectations as early as possible with your customer. Do not promise a customer a refund. 
1. Customer type is important to understand as this impacts the length of time a credit takes. There are 3 flavors of Azure Customer: *Enterprise/Field-led*, *CSP/Partner-led*, and *Web-Direct/Customer-led*
   - The customer type customer determines the process a credit goes through to be applied to the customers account.  For example: Enterprise customers, regardless of the amount of the credit, are applied to the customer account by the Microsoft Business Office (MBO). Therefore, these credit requests go to ASMS and then ASMS files an ADO/ICM with the MBO for application of the credit. It does not matter if the refund amount is 23 cents or $23,000, MBO must apply an Enterprise (EA) customer's credit. This means that these cases take an extra step and ASMS may be forced to wait on another team. The other two customer types have different application processes, but the main point is: the work that ASMS does to process a credit for a customer is not always 100% under the control of the ASMS Engineer or the ASMS Support Team.

1. Payment Instrument (PI)
   - How the customer pays is the payment instrument or PI. PIs are typically credit card or invoice pay. This is important because the amount of time it takes the customer to see their credit can be impacted by the PI they used to make their payment, sometimes that impact can be weeks. 
1. Credit amount
   - Credit amount is another consideration as this dictates who can approve the credit and who can apply the credit to the customer's account. Because credits are subject to audits, ALL credit requests have a chain of approval. No credit can be completed by just one engineer. Small refunds (<$10,000) may only require another ASMS engineer to approve the credit. Larger credits may require an ASMS Technical Advisor or a Manager, and very large refunds (>$100,000) may require Directors in the Microsoft Business Office or CSS to approve the credit. It is important to keep in mind that a credit case may need to be reviewed or processed by multiple people and this can impact the time it takes to complete the credit. 

It is important to keep these things in mind as you work with your customer on their credit so you can set their expectations appropriately. Feel free to explain to your customer that you don't work in the billing department, but it is your understanding that Microsoft follows strict credit and documentation policies, so we are able to pass financial audits and compliance reviews. You can further explain that we know that credits seem so easy when you take something back to the store and they run your credit card and you are out of the store in 5 minutes. But processing credits for over 600 Azure Services purchased through multiple sales channels to several different customer types in many regions creates a complex structure that takes time to navigate. ASMS Engineers don't ask that you understand this structure; they ask that you recognize the complexity of it and set customer expectations accordingly.

# Additional considerations

1. A credit request can only be completed after the customer has been invoiced for the charge. If a customer opens a case the day after they discover they accidentally turned on an option and ran up their bill, set the customer's expectations that a credit request cannot be made until after their invoice is generated. So the ASMS engineer will likely sit on that collaboration until the customers invoice has been generated and this could take up to 30 days depending upon when their billing cycle ends.
   1. You may want to ask the customer when their invoice date is and put a note on your calendar to follow up with the ASMS engineer after that date. 
1. Never promise a customer a credit, EVEN if the credit is approved by the product group.  
   1. The Microsoft Business Office (MBO) under Amy Hood is tasked with tracking why we give credits and approving them after certain levels. They maintain the central Microsoft Credit Policy that documents customer scenarios that can be credited and why. You do not need to know the specifics of this policy; that is the billing team's job. But you should not assume that your customers scenario will fit into the policy and be approved for a credit. You should set expectations with your customer that the Billing and Subscriptions Management team (ASMS) will work through every avenue to provide appropriate credits per the policy.  
1. Refunds to credit cards are an exception and not a rule. Set expectations that you do not know how the money will be credited back or better yet, let the customer know that the ASMS team will explain that. But do not promise that the customers credit card will be refunded.
1. Credits are not quick. As mentioned above, customers may have an impression from store refunds that Azure credits should be quick, so it is imperative that proper expectations are set. Depending upon the type of customer (Enterprise/Field-led, Customer-led/Web-Direct, Partner-led/CSA) and the amount of the refund, there are levels of approval that the credit must go through. There is no scenario where a credit is submitted and approved by the same engineer. ALL credits must have a submitter and an approver. For small refunds up to $10,000 ASMS engineers can often get another ASMS engineer to approve a credit request, so these may go more quickly. All Enterprise customer credit requests regardless of the amount must be submitted to MBO along with a fair amount of support documentation, therefore helping the ASMS engineer gather that documentation may help your case move more quickly. But again, credits are not quick. Set expectations with your customers that these things take time but assure them that we are committed to doing what is right when it comes to Azure billing.  
1. When you are working with ASMS to get a customer a credit be sure that you provide all the information you can so it can move as quickly as possible. You should plan to include the impacted subscription IDs (GUIDs), the impact start and end dates, the exact impacted services and root cause analysis including ICM numbers. The ASMS engineer must match the customers credit request to a credit scenario in the Microsoft Credit Policy. The supporting documentation you provide helps the ASMS engineer find the right credit scenario and helps the approval process move more smoothly.
   1. Also note that ASMS provides credits for all Azure Services. It is impossible for them to be well versed in what a particular Azure service does or how it is billed. They rely upon the technical support teams to provide those details so they can process the credit. When working with ASMS on a credit, you should plan to stay engaged to assist, just in case the credit request requires more information or details on the service billed.
1. How and when the credit shows up is not always predictable and is based upon the payment instrument (PI that is credit card, invoice, etc.) Invoices will likely show the refund within a few days but we have situations where this takes up to 2 billing cycles to show. Credit card refunds, if they are approved can take several weeks because some banks batch refunds and this can delay processing significantly. Again, your best bet here is to not set expectations on what the customer will see. 
1. Refunds are per customer and they must be associated with a DfM case. The ASMS team cannot process multiple refunds for multiple customers in one case.  

# Routing to Billing Team
---
The proper routing SAP for refunds is Azure/Billing/Credit request/*.
ASMS teams handles refund requests, **not** the Application Insights billing team. 
For additional information see [HT: Initiate a refund process](/Log-Analytics/How%2DTo-Guides/Billing-and-Usage/HT:-Initiate-a-refund-process)
