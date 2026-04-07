---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/Editing DevOps Wiki_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FKnowledge%20Management%20%28KM%29%2FEditing%20DevOps%20Wiki_Process"
importDate: "2026-04-06"
type: process-guide
---

# Editing the AzureIaaSVM DevOps Wiki

## Summary

This article outlines the process for creating a new development (dev) branch to make changes to the wiki — creating, editing, renaming, or moving pages.

## Contributing

Only direct OneVM POD members can contribute. Permission: "[AzureIaaSVM (OneVM) Wiki - Contributor](https://aka.ms/vmwikiaccess)".

For more KM processes see [KM Home Page](https://aka.ms/vmkm).

## Video Walkthrough

[Brownbag walkthrough of wiki editing](https://microsoft.sharepoint.com/:v:/t/VMHub/EY-tYGcb20FOhknsok1FOC8BvfajBRoJEX5lVEzMPZgrEQ?e=lmJ254)

---

## Creating a New Dev Branch

1. Go to **Repos > Branches**
2. Check **Behind | Ahead** numbers for any existing branch. If Behind > Ahead, start with a new branch.
3. Click **New branch** button. Name: `<yourAlias>-dev`, always based on `main`.
4. Use a **new dev branch for each PR** to reduce merge conflicts.
5. After PR is completed, delete your old dev branch.

---

## Updating an Existing Page

1. Select your dev branch.
2. Browse files and select the one to modify → Edit content.
3. Click **Commit** when finished.
4. Add a comment about changes. Ensure commit targets `<yourAlias>-dev`. Link related work items.
5. **Repeat for any additional pages before moving to next step.**
6. After all changes committed, click **Create a pull request**.
7. Ensure PR goes from `<yourAlias>-dev` to `main`.
8. Fill out PR details:
   - **Title**: Brief description of what the PR is about.
   - **Description**: Everything that was done to the pages.
   - **Add commit messages**: inserts all commit comments.
   - **Reviewers**: optional reviewers.
   - **Add required reviewers**: policies auto-add required reviewers. See [KM Approving Pull Requests](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494910).
   - **Work items to link**: auto-closes when PR is merged.
   - **Tags**: related tags.
   - Click **Create**.
9. Wait for approvers. Check approvals in PR under Reviewers section.
10. Once all required reviewers approve → KM engineer merges PR to `main` and deletes dev branch.
11. Verify source branch is deleted after merge.

---

## Creating a New Page

1. Select your dev branch.
2. Navigate to the target folder → click ellipsis → **+ New > File**.
3. Name the page following [Wiki Page Standards](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494917). Add `.md` extension.
4. Add content → Click **Commit**.
5. Add commit comment, verify branch is `<yourAlias>-dev`, add work items.
6. **Repeat for any additional pages before moving to next step.**
7. After all changes, click **Create a pull request**.
8. Fill out PR details (title, description, reviewers, work items). Click **Create**.
9. Wait for approvers.
10. KM engineer merges PR to `main` and deletes dev branch.

---

## Renaming a Page

> **IMPORTANT**: Do NOT edit page content when renaming. Doing both in the same PR may change the page ID and break all links.  
> If you need to rename AND edit content, do it in **two separate PRs**.

1. Select your dev branch.
2. Find the file → click ellipsis → **Rename**.
3. Type new file name following [Wiki Naming Standards](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494917). Keep `.md` extension.
4. Click Commit → Create a pull request → Follow steps 7-11 from Updating an Existing Page.

---

## Moving a Page

> **IMPORTANT**: Do NOT edit page content when moving a file. Do it in **two separate PRs** if both are needed.

1. Select your dev branch.
2. Find the file → click ellipsis → **Download**.
3. After downloading, delete the file from its current folder → click **Delete** → **Commit**.
4. Navigate to the new folder → click ellipsis → **Upload file(s)** → browse to downloaded file → **Commit**.
5. Create a pull request → Follow steps 7-11 from Updating an Existing Page.

---

## Editing an Existing Pull Request

1. From the PR → click the branch name hyperlink below the PR title.
2. Use the search bar to find the page requiring update.
3. Select Edit → make necessary changes → **Commit**.
4. **Important**: Make ALL changes at once before committing. Multiple commits send emails to all approvers — excessive commits may result in revoked contributor privileges.
5. The new commit is automatically pushed to the existing PR.
6. After applying changes, mark reviewer's comments as **Resolved** on the PR.

---

## Important Tips

- Use **Visual Studio Code** to make changes locally before committing to DevOps.
- Make all changes at once per commit to avoid sending multiple notifications.
- The KM engineer who approves and merges the PR is also responsible for **deleting your dev branch**.
- Save a copy of new pages locally in case of merge conflicts.

## Next Steps

Once PR is created, it needs review and approval. See: [Approving Pull Requests](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494910)
