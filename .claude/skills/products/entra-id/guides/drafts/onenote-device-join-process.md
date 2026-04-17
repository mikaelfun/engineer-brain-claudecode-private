# Azure AD Device Join Process

## Summary
Step-by-step flow of Azure AD device join covering discovery, registration with ADRS, and MDM enrollment.

## Join Flow

### Step 1: Authentication/Configuration Acquisition
- Orchestrator code (typically Shell, e.g. OOBE) initiates the join
- User provides credentials or configuration is pre-set

### Step 2: Discovery
- Goal: determine which Azure AD tenant (and instance) to connect device to
- Based on authentication credentials or configuration

### Step 3: Registration with ADRS (Azure Device Registration Service)
1. Generate device key and transport key (TPM-backed or software-based)
2. Format and send registration request to ADRS
3. Install certificate provided by ADRS in response
4. Save join information locally

### Step 4: MDM Auto-Enrollment (Optional)
- Orchestrator code (e.g. OOBE) performs MDM enrollment if configured in Azure AD tenant
- Device key is used to get AAD access token with device claim for MDM join

### Step 5: License Verification
- If auto-enrollment was enabled on Intune, user must have Intune license assigned
- Missing license will cause device join process to fail at MDM enrollment step

## Key Components
| Component | Role |
|-----------|------|
| TPM | Stores device and transport keys securely |
| ADRS | Azure Device Registration Service - issues device certificate |
| OOBE | Out-of-Box Experience - orchestrates join flow |
| Intune | MDM enrollment target |

## Source
- sourceRef: `Mooncake POD Support Notebook/.../Device Join Process.md`
