# Uparjanam - Business Hub

## Current State
Full-stack business platform with HR, DSA Loan Management, and Accounting modules. Red/white themed. Sidebar shows Uparjanam logo as a Zap icon with text.

## Requested Changes (Diff)

### Add
- Company logo upload/change option in the Sidebar (click on logo area to upload custom image, stored in localStorage)
- CIBIL Score Check section in DSA Loan Management (new tab or section): input PAN number + applicant name, show simulated CIBIL score result with score gauge
- Download CIBIL Report button that generates and downloads a PDF-like printable report with applicant details and score

### Modify
- Sidebar logo area: make it clickable, show upload icon on hover, support custom image logo stored in localStorage
- LoanManagement page: add a second tab "CIBIL Check" alongside loan applications

### Remove
- Nothing removed

## Implementation Plan
1. Update Sidebar to support logo upload: on click of logo area, open hidden file input, store image as base64 in localStorage, display as <img> if set
2. Add CIBIL Check tab to LoanManagement page with:
   - Form: PAN number, applicant name, mobile number
   - Check Score button: simulate score (700-900 range based on PAN hash)
   - Score display: colored gauge/progress bar (green >= 750, yellow 650-749, red < 650)
   - Download Report button: triggers window.print() on a styled report div or generates a text blob download
