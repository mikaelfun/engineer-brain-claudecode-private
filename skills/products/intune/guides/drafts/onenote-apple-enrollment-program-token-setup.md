# Setup Apple Enrollment Program Token (ADE/DEP)

## Overview
Steps to download and configure an Apple Enrollment Program (DEP/ADE) token for Intune device enrollment.

## Steps

1. **Download MDM token** from Intune portal (Devices > iOS/iPadOS > Enrollment)
2. Go to [Apple Business Manager](https://business.apple.com/)
3. Sign in with your organization's Apple ID
4. Upload the MDM server token
5. Download the enrollment program token from Apple
6. Upload the token back to Intune portal
7. Assign devices to the enrollment profile

## Key Notes
- Token expires annually and must be renewed
- Use the same Apple ID that was used to create the original token
- For Mooncake (21Vianet): Verify ADE support availability

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > Setup Apple Enrollment Program Token
