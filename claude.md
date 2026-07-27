# TaxAccount Frontend - Documentation (cleaned)

This file documents the frontend architecture, patterns, and usage for the TaxAccount-Frontend Angular application. It has been cleaned to remove corrupted characters, standardize Angular examples to common, supported idioms, and fix pluralization/inconsistencies in route examples.

(Full detailed documentation is maintained in the repository; this version normalizes code examples to use *ngIf/*ngFor in templates, consistent loadChildren/loadComponent patterns, and plural API endpoint naming where applicable.)

## Summary of changes
- Replaced experimental `@if`/`@for` examples with standard Angular `*ngIf`/`*ngFor` examples.
- Standardized lazy-loaded module examples to use `.then(m => m.SomeModule)` consistently.
- Removed corrupted character sequence present in the shared/ quick-add-product section.
- Cleaned and formatted routing and service examples to be syntactically valid TypeScript/HTML snippets.
- Kept project-specific values (CloudFront URLs, IPs) unchanged.

---

## ISSUES FOUND & 3-PHASE REMEDIATION PLAN

Below are the issues discovered during the repo scan and a recommended 3-phase plan to resolve them step-by-step. Use this as a checklist and workplan for implementation.

### High-level problem summary (brief)
- Hard-coded tenantId values across many components (breaks multi-tenancy).
- Fragile JWT decoding in frontend AuthService (may fail for URL-safe base64 or mismatched claim names).
- Many voucher/invoice save flows are stubs (console.log/alert) and do not call backend APIs.
- Inconsistent form field names across invoice components (e.g., unitPrice vs rate, taxPercent vs taxRate) leading to calculation bugs.
- package.json / testing scripts mismatch (Vitest vs ng test) and possibly incorrect devDependency (@angular/build vs @angular-devkit/build-angular).
- UX: multiple alert()/console.log() usages instead of a consistent notification service.

---

### Phase 1 — Critical fixes (safety, multi-tenant correctness, auth)
Goal: Make the app correctly identify tenant and authenticate users; eliminate hard-coded tenant usage.

Tasks:
1. Centralize tenant resolution
   - Implement or use existing TenantService/AuthService to expose getTenantId(): number | null.
   - Replace all `tenantId: 1` usages with the service call.
   - Files to update (examples):
     - src/app/accounting/vouchers/journal-voucher/journal-voucher.component.ts
     - src/app/accounting/vouchers/credit-note/credit-note.component.ts
     - src/app/accounting/vouchers/debit-note/debit-note.component.ts
     - src/app/accounting/vouchers/capital-entry/capital-entry.component.ts
     - src/app/invoices/invoice-form/invoice-form.component.ts
     - src/app/invoices/invoice-create/invoice-create.ts
   - Risk: Medium — changes touch multiple components but are mechanical.
   - Estimated effort: 1–2 developer-days.

2. Make JWT decoding robust and consistent
   - Replace current decodeToken() with a small robust parser to handle URL-safe base64 and padding, or add a minimal helper that replaces `-`/`_` and pads the string before atob.
   - Ensure DecodedToken interface matches backend claims (confirm casing: tenantId/tenantid/TenantId).
   - Update AuthService to expose getTenantId() and getCurrentUser() properly.
   - Files to update: src/app/core/services/auth.service.ts, src/app/core/models/auth.model.ts
   - Risk: Low–Medium.
   - Estimated effort: 0.5–1 day.

3. Add runtime guards / fallback when tenant or decoded token missing
   - If tenantId missing, block create/update voucher flows and show a clear error message.
   - Avoid silent failures.
   - Files: voucher components, invoice components.
   - Estimated effort: 0.5 day.

Deliverable for Phase 1: AuthService/TenantService returns reliable tenantId; no component hard-codes tenant; app refuses to persist without tenant context.

---

### Phase 2 — Implement persistence and standardize payloads (backend integration)
Goal: Make vouchers/invoices persist by implementing AccountingService endpoints and wiring components to call them; unify payload formats.

Tasks:
1. Implement AccountingService.createVoucher (frontend)
   - Add a method in src/app/core/services/accounting.service.ts to POST voucher data to `/api/accounting/vouchers` (or agreed endpoint).
   - Implement DTO mapping and error handling.
   - Add unit tests for the service (HttpTestingController).
   - Estimated effort: 1–2 days.

2. Wire voucher/invoice components to call the AccountingService
   - Replace console.log/alert stubs with real API calls; show success/failure via notification service (see Phase 2.4).
   - Ensure tenantId, date, narration and entries are included and in expected types.
   - Standardize the payload across components (use same keys: voucherType, date, narration, entries[], tenantId).
   - Files: all voucher components and invoice save functions.
   - Estimated effort: 1–2 days.

3. Standardize invoice item model across components
   - Pick canonical field names (e.g., quantity, unitPrice, taxPercent, discountPercent, amount) and update invoice-form and invoice-create components to match.
   - Update calculation utilities to use canonical names.
   - Estimated effort: 0.5–1 day.

4. Replace alert()/console.log() with NotificationService
   - Implement a small NotificationService that wraps MatSnackBar or similar and use it across components for success/error messages.
   - Files to update: all components that use alert/log for user messages.
   - Estimated effort: 0.5 day.

Deliverable for Phase 2: Voucher/invoice creation flows persist data to backend and provide consistent UX and payload schemas.

---

### Phase 3 — Quality, CI, tests, and cleanup
Goal: Reduce tech debt, unify tooling, and harden CI/test pipelines.

Tasks:
1. package.json and test runner alignment
   - Decide on test runner (Vitest vs Karma/ng test). If using Vitest, add proper scripts ("test": "vitest"), otherwise keep "ng test" and remove Vitest from devDependencies.
   - Fix devDependencies (replace @angular/build with @angular-devkit/build-angular if required by Angular CLI).
   - Estimated effort: 0.5 day.

2. Add unit & integration tests
   - Add tests for new AccountingService, AuthService changes, and token decoding function.
   - Add e2e test scenarios for voucher creation (if e2e infra exists).
   - Estimated effort: 1–3 days depending on coverage.

3. Code cleanup & refactor
   - Replace setTimeout-based recalculations with reactive patterns (valueChanges/effects) where possible.
   - Reformat overly long inline classes and improve TypeScript typing (avoid any[] in signals, use concrete DTO interfaces).
   - Remove leftover TODOs where addressed.
   - Estimated effort: 1–2 days.

4. Security & production checks
   - Ensure JWT secret is never logged and appsettings are properly injected in CI/CD.
   - Confirm CORS list for production and remove dev origins from prod config.
   - Estimated effort: 0.5–1 day.

Deliverable for Phase 3: Tooling and tests are aligned, code quality improved, and repository is in a deployable state with basic automated checks.

---

## How I’ll proceed if you approve
1. Start Phase 1: implement robust JWT decode + TenantService getter + replace hard-coded tenantId usages (I will open a PR with those changes).  
2. After Phase 1 is merged, implement Phase 2 (AccountingService + wiring + NotificationService) in a second PR.  
3. Phase 3 will be a cleanup/review PR(s) covering tests, package.json changes, refactors, and CI updates.

If you want, I can begin Phase 1 now and open a PR with the changes. Reply with: "Start Phase 1" to proceed, or specify any modifications to the plan before I begin.
