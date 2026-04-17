# IME Log Interpreter Tool Reference

> Source: OneNote — MCVKB/Intune/Windows/Win32 & Power Shell: IME log Interpreter
> Status: draft

## Overview

GUI tool for parsing and analyzing Intune Management Extension (IME) logs. Separates Win32 app and PowerShell script sessions for easier troubleshooting.

**Download**: [GitHub - mikaelfun/Intune-IME-Project](https://github.com/mikaelfun/Intune-IME-Project/releases)

**Author**: Kun Fang (internal tool, inspired by Leon Zhu)

## What It Solves

1. CMTrace pre-defined warning/error highlighting is inaccurate for IME logs
2. Notepad++ search doesn't give session context; timestamps are mid-line
3. IME logs contain many ignorable errors that distract engineers
4. Win32 and PowerShell logs are interleaved in the same file
5. Same app appears in multiple poller sessions — hard to distinguish

## Key Features (v3.0, 2023-04-11)

- **Session separation**: Splits log into Application Poller sessions
- **Win32 V3 processor**: Updated flow analysis for latest IME version
- **MSFB UWP app flow**: New Microsoft Store for Business UWP app support
- **Dependency chain**: Fixed dependency chain processing with auto-install
- **Assignment filter**: Filter analysis
- **WPJ context skip**: Shows when WPJ/user context apps are skipped
- **DO download**: Shows Delivery Optimization download priority and timeout
- **Install timeout**: Displays install timeout settings

## Usage

1. Open IME Log Interpreter
2. Browse to IME log directory: `C:\ProgramData\Microsoft\IntuneManagement Extension\Logs`
3. Select the log file
4. Tool separates the log into per-session views for each application
