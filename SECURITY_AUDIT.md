# Security Audit Report

**Date**: April 18, 2026  
**Scope**: Codebase vulnerabilities (SAST), Configuration vulnerabilities, and Dependency scanning.  

This audit identifies vulnerabilities in source code, configuration files, and database migrations, organized from highest to lowest severity.

---

## 🛑 Critical Severity

### 1. Insecure API Key Exposure in Client Bundle
* **Location**: `.env` (Lines 6-7), `src/lib/whatsapp.ts`
* **Vulnerability Type**: Hardcoded Secret / Insecure Client-Side Data
* **Description**: The `.env` file is tracked in git and contains `VITE_ULTRAMSG_TOKEN`. Vite automatically statically replaces variables prefixed with `VITE_` inside the client bundle. This allows any user browsing the website to extract the UltraMsg API token from the Javascript source. 
* **Impact**: Total compromise of the WhatsApp messaging gateway. Attackers can spam, send phishing messages from your official business account, or rapidly exhaust API quotas. 
* **Remediation**: 
  - Revoke the current `VITE_ULTRAMSG_TOKEN` immediately on your provider's dashboard.
  - Remove `.env` from tracking using `git rm --cached .env` and ensure it is included in `.gitignore`.
  - Migrate the WhatsApp notification mechanism (currently in `src/lib/whatsapp.ts`) to a secure backend environment, such as a **Supabase Edge Function**, where the token can be securely injected as a backend environment variable without client exposure.

### 2. PII Data Leakage via Permissive SELECT Policy on Orders
* **Location**: `supabase/migrations/20260321021906_7b297d2b-ded8-4bfe-abf0-b6c27744f096.sql` & `20260417160000_setup_auth_roles.sql`
* **Vulnerability Type**: Insecure Direct Object Reference (IDOR) / PII Leak
* **Description**: `20260321021906...sql` establishes `CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);`. A later migration (`20260416000000_add_customer_info_to_orders.sql`) adds sensitive Personal Identifiable Information (PII) to the orders table (`customer_name`, `customer_phone`, `customer_address`, `customer_city`). The subsequent auth migration (`20260417160000_setup_auth_roles.sql`) deliberately leaves this SELECT policy untouched (`-- Orders (Keep SELECT public for now...`).
* **Impact**: Critical privacy breach. Any unauthenticated attacker using the public anonymous Supabase key can scrape your entire customer database, stealing customer names, phone numbers, and addresses.
* **Remediation**: Drop the permissive `SELECT` policy and replace it with a restrictive one ensuring only admins or the respective customer can view the rows.
  ```sql
  DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
  CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  ```

---

## 🔴 High Severity

### 3. Arbitrary Data Manipulation (Order Items & Product Assets)
* **Location**: `supabase/migrations/20260321021906_7b297d2b-ded8-4bfe-abf0-b6c27744f096.sql`, `20260417160000_setup_auth_roles.sql`
* **Vulnerability Type**: Broken Access Control 
* **Description**: While `20260417160000_setup_auth_roles.sql` applies restrictive policies for `products`, `categories`, and `orders`, it fails to overwrite the legacy permissive policies for associated junction and item tables:
  - `product_categories`
  - `product_images`
  - `order_items`  
  These tables still fall back to `FOR UPDATE USING (true)` and `FOR DELETE USING (true)`, meaning any anonymous user can issue an asynchronous command to rewrite or delete order items or product categorizations.
* **Impact**: Total loss of data integrity for shopping bags, catalog mappings, and historical orders.
* **Remediation**: Apply the `role = 'admin'` checks to `product_categories`, `product_images`, and `order_items`. Wait... for `order_items`, `INSERT` must still be allowed for public users creating orders, but `UPDATE` and `DELETE` should be restricted.

### 4. Arbitrary Storage Destruction / Defacement
* **Location**: `supabase/migrations/20260321021906_7b297d2b-ded8-4bfe-abf0-b6c27744f096.sql` (Line 139-141)
* **Vulnerability Type**: Unrestricted File Upload / Deletion
* **Description**: The Storage policies for the `product-images` bucket are globally permissive. 
  `CREATE POLICY "Anyone can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');`
  `CREATE POLICY "Anyone can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');`
* **Impact**: An attacker can systematically delete all product imagery rendering the storefront broken, or maliciously replace product images to deface the site with inappropriate contents.
* **Remediation**: Restrict `INSERT`, `UPDATE`, and `DELETE` on the `storage.objects` table specifically to authenticated administrators. Keep `SELECT` open for public viewing.

---

## 🟡 Low / Informational Severity

### 5. Potential XSS via DangerouslySetInnerHTML in Chart Components
* **Location**: `src/components/ui/chart.tsx` (Line 70)
* **Vulnerability Type**: Cross-Site Scripting (XSS)
* **Description**: The Shadcn UI chart component utilizes `dangerouslySetInnerHTML` to map internal theme configurations (`config` CSS attributes) to a raw injected `<style>` tag block. 
* **Impact**: Low. Currently, `ChartConfig` colors are generally hardcoded developer configuration variables (e.g. `hsl(var(--chart-1))`). If any feature inside the application is configured to allow end-users to designate or pick custom colors for charts, and that value is not sanitized, an attacker could inject arbitrary malicious markup escaping the `style` context sequence. 
* **Remediation**: Verify that `config` color sources are entirely developer-controlled and not populated from dynamic user-facing input forms. If they are, apply rigorous CSS validation sanitizers (like restricting matches strictly to valid hex/RGB codes).

### 6. Dependency Health Check
* **Status**: Passed (0 vulnerabilities found via NPM Audit)
* **Tool Used**: Built-in NPM Audit scanner (`npm audit --json`)
* **Note**: No immediate vulnerabilities in third-party module trees. It's recommended to add automated dependency scanning (e.g., Dependabot or Snyk) to your CI/CD pipeline to continuously monitor.

---

**Auditor Notes**: The combination of a publicly-available API token in `.env` and multiple fully permissive Supabase database policies constitutes an immediate crisis for the repository's production environment. Prioritize rectifying the `orders` PII database queries and removing `.env` immediately.
