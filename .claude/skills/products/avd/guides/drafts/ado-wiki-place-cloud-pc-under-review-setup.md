---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Place Cloud PC under review/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Place%20Cloud%20PC%20under%20review/Setup%20Guide"
importDate: "2026-04-21"
type: guide-draft
---

1. Storage Accounts > Blob Storage > click Create

   ![image.png](/.attachments/image-44e5b62b-7b6f-4c97-a001-f8954b709ae9.png)

1. Basics Tab

   ![image.png](/.attachments/image-89971bef-b2cc-41e9-bb85-aa5077370b8b.png)

1. Advanced Tab
   - Disable Enable storage account key access
   - Minimum TLS version: Version 1.2

      ![image.png](/.attachments/image-0df59d70-6fbb-4443-8bfb-be03510032a0.png)

1. Networking Tab
   - Network access: Enable public access from all networks

      ![image.png](/.attachments/image-a5fcc535-1308-4f6d-b741-e0684f0c9fc8.png)

1. Data Protection tab 
   - Accept defaults

1. Encryption 
   - Accept defaults

1. Complete wizard and click Create

   ![image.png](/.attachments/image-0e000ee7-98ac-44c0-9a9f-ff42eb233f70.png)

1.  Select Go to resource > Select Access Control (IAM)

      ![image.png](/.attachments/image-1c903d78-9627-4e91-9729-8f29dcb7b73a.png)

1.  Select Role Assignments > Add Role Assignments
    - Add 2 role Assignemnts
      - Name: Storage Account Contributor
      - Assign Access to:  User Group or service principal
      - Members: Windows 365

         ![image.png](/.attachments/image-871cc0ec-136d-46f7-9079-6ac500756465.png)

      - Name: Storage Blob Data Contributor
      - Assign Access to:  User Group or service principal
      - Members: Windows 365

         ![image.png](/.attachments/image-258db71a-83d0-441c-b387-ac03c9b42fcf.png)

1. Go to CloudPC in Inune > Select Place Cloud PC under review

   ![image.png](/.attachments/image-34e68e4f-2426-40e2-806c-cdc877a9b740.png)

1. Select newly created Storage Account and Container > select Allow Access > select Place Under Review

   ![image.png](/.attachments/image-f7e14eb3-6a1c-43af-85ad-bb87f8c14c1d.png)

1. Select Place under review

   ![image.png](/.attachments/image-ffa97067-958c-442f-914e-440adcaff9d7.png)

1.  Access to CloucPC allowed

    ![image.png](/.attachments/image-f392aa03-b9c5-440c-884e-1660c3efaf47.png)

1.  Place under review status will show pending 

    ![image.png](/.attachments/image-3d5c9a07-3267-48a7-ad51-4cb71832022a.png)

1. If you click Containers should see newly created container

   ![image.png](/.attachments/image-9decbe0f-f8dc-41ed-8728-41297581718e.png)

1. Once complete status will show Active

   ![image.png](/.attachments/image-cab94622-efaa-4a9c-9e4b-a948c5f071da.png)