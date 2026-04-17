# iOS App Bundle ID Reference

**Source**: OneNote > Mooncake POD Support Notebook > iOS TSG > How to - iOS App Bundle ID

## Common Apple Bundle IDs

| Bundle ID | App Name |
|-----------|----------|
| com.apple.AppStore | App Store |
| com.apple.mobilecal | Calendar |
| com.apple.camera | Camera |
| com.apple.MobileAddressBook | Contacts |
| com.apple.facetime | FaceTime |
| com.apple.Health | Health |
| com.apple.mobilemail | Mail |
| com.apple.MobileSMS | Messages |
| com.apple.Music | Music |
| com.apple.mobilenotes | Notes |
| com.apple.mobileslideshow | Photos |
| com.apple.MobileSafari | Safari |
| com.apple.Preferences | Settings |

## Microsoft Apps

| Bundle ID | App Name |
|-----------|----------|
| com.microsoft.CompanyPortal | Company Portal |
| com.microsoft.Office.Outlook | Outlook |
| com.microsoft.skype.teams | Microsoft Teams |

## How to Find Any App's Bundle ID

1. Go to the App Store page for the app
2. Copy the ID number from the URL (e.g., `586447913` from `https://itunes.apple.com/us/app/microsoft-word/id586447913`)
3. Browse to `https://itunes.apple.com/lookup?id=586447913`
4. Download and open the resulting `1.txt` file
5. Search for `bundleId` in the file

## Company Portal Redirect URI Format

`companyportal://com.microsoft.CompanyPortal`

The application redirect URI format is: `scheme://bundle_id`

## References

- Apple MDM Bundle ID list: https://support.apple.com/en-sg/guide/mdm/mdm90f60c1ce/web
- Third-party lookup: https://offcornerdev.com/bundleid.html
