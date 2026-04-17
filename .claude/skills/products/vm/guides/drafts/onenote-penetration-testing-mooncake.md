# Azure China (Mooncake) Penetration Testing Process

## Overview
Process for handling customer penetration testing requests in Azure China (21Vianet).

## Steps
1. Direct customer to https://www.trustcenter.cn/zh-cn/security/penetrationtesting.html to download the approval form
2. Customer fills out the form and replies via email
3. Forward the email to approvers (ensure customer is REMOVED from CC):
   - RM: rm@oe.21vianet.com
   - Jeff Wang: wang.zipeng@oe.21vianet.com
   - Nanbo: li.nanbo@oe.21vianet.com
4. Act as bridge for any questions between customer and approvers (in separate email threads)
5. Once all three parties approve, inform customer they can proceed

## Important Notes
- Without approval, testing completion cannot be guaranteed
- 21Vianet team will scrub high-traffic load tests; bandwidth congestion can be identified by source/destination IP pairs
- Approval rate depends on the specific application form content

## Self-Service Conditions (No Approval Needed)
If the test meets ANY of the following, no authorization is required:
1. Test destination is customer's Azure private IP address
2. Test destination is customer's Azure public IP, AND source is also customer's Azure public/private IP, AND both belong to the same customer

All other scenarios require penetration testing authorization.

## References
- Penetration testing docs: https://docs.azure.cn/zh-cn/security/fundamentals/pen-testing
- Rules of engagement: https://www.microsoft.com/zh-cn/msrc/pentest-rules-of-engagement
