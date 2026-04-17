# Ember - Blazing Fast Logs Tool

## Overview
Ember is a desktop tool for collecting and downloading Entra ID / AAD diagnostic logs via incident ID.

## Download
- [Ember - Blazing Fast Logs](https://ember-update.azurewebsites.net/api/HttpServe)

## Usage

### Log Collection
1. Launch Ember tool
2. Configure log collection parameters
3. Start collection

### Log Download
1. Enter the incident ID
2. Authenticate via browser SSO (will be redirected automatically)
3. Return to tool after authentication
4. Download logs from the tool interface

### Log File Location
- Logs are saved locally; follow the directory path shown in the tool interface to find downloaded files

## Notes
- Requires SSO authentication (redirects to browser)
- Works with ICM incident IDs
- Primarily for public cloud (Global Azure), not Mooncake

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > Ember
