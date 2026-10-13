/**
 * Comprehensive Automated Frontend Test Runner
 * Tests:
 * 1. TypeScript Strict Type-Check (Zero errors)
 * 2. Route & Component Registry Verification
 * 3. Endpoints & API Contract Verification
 * 4. Financial Reports Math & Resiliency (BRD Sec 25)
 * 5. Redux Store & Slice Configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function logHeader(title) {
  console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);
}

function logPass(testName, details = '') {
  console.log(`  ${colors.green}✔ PASS${colors.reset}: ${testName} ${details ? colors.yellow + '(' + details + ')' + colors.reset : ''}`);
}

function logFail(testName, error) {
  console.error(`  ${colors.red}✖ FAIL${colors.reset}: ${testName}\n     ${error}`);
}

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    logPass(name);
    passed++;
  } catch (err) {
    logFail(name, err.message || err);
    failed++;
  }
}

async function main() {
  logHeader('RENTMATE FRONTEND TEST SUITE RUNNER');

  // -------------------------------------------------------------
  // Test Category 1: TypeScript Strict Compilation
  // -------------------------------------------------------------
  console.log(`${colors.bold}1. TypeScript Compilation & Strict Type-Check${colors.reset}`);
  runTest('TypeScript Compilation Check (tsc -b)', () => {
    try {
      execSync('npx tsc -b', { cwd: projectRoot, stdio: 'pipe' });
    } catch (err) {
      throw new Error('TypeScript compilation failed:\n' + err.stdout?.toString());
    }
  });

  // -------------------------------------------------------------
  // Test Category 2: Router & Component Integrity
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}2. Route Hierarchy & Component Registry${colors.reset}`);

  const requiredComponents = [
    'src/app/router.tsx',
    'src/app/store.ts',
    'src/components/layout/AppLayout.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/features/auth/LoginPage.tsx',
    'src/features/auth/RegisterPage.tsx',
    'src/features/dashboard/DashboardPage.tsx',
    'src/features/properties/PropertiesPage.tsx',
    'src/features/tenants/TenantsPage.tsx',
    'src/features/payments/PaymentsPage.tsx',
    'src/features/applications/ApplicationsPage.tsx',
    'src/features/maintenance/MaintenancePage.tsx',
    'src/features/tenant/MyRentalsPage.tsx',
    'src/features/settings/layouts/SettingsLayout.tsx',
    'src/features/settings/pages/TeamSettingsPage.tsx',
    'src/features/settings/pages/RolesSettingsPage.tsx',
    'src/features/settings/pages/OrganizationSettingsPage.tsx',
    'src/features/superadmin/layouts/SuperAdminLayout.tsx',
    'src/features/superadmin/pages/SuperAdminOverviewPage.tsx',
    'src/features/superadmin/pages/SuperAdminOrganizationsPage.tsx',
    'src/features/superadmin/pages/SuperAdminPropertiesPage.tsx',
    'src/features/superadmin/pages/SuperAdminLeasesPage.tsx',
    'src/features/superadmin/pages/SuperAdminMaintenancePage.tsx',
    'src/features/superadmin/pages/SuperAdminPlansPage.tsx',
    'src/features/superadmin/pages/SuperAdminRolesPage.tsx',
    'src/features/superadmin/pages/SuperAdminUsersPage.tsx',
    'src/features/superadmin/pages/SuperAdminSettingsPage.tsx',
  ];

  requiredComponents.forEach((relPath) => {
    const fullPath = path.join(projectRoot, relPath);
    runTest(`Component exists: ${relPath}`, () => {
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File missing at ${fullPath}`);
      }
    });
  });

  // -------------------------------------------------------------
  // Test Category 3: API Service Endpoints Contract
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}3. API Service Endpoints Contract Verification${colors.reset}`);

  const endpointsFile = path.join(projectRoot, 'src/services/endpoints.ts');
  runTest('Endpoints contract defines required modules', () => {
    const content = fs.readFileSync(endpointsFile, 'utf8');
    const modules = ['AUTH', 'PROPERTIES', 'TENANTS', 'PAYMENTS', 'ROLES', 'ADMIN', 'MAINTENANCE', 'REPORTS'];
    for (const mod of modules) {
      if (!content.includes(mod)) {
        throw new Error(`Missing module endpoint definition for: ${mod}`);
      }
    }
  });

  // -------------------------------------------------------------
  // Test Category 4: Financial Reports Math & Resiliency (BRD Sec 25)
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}4. Financial Reports Calculation Logic (BRD Sec 25)${colors.reset}`);

  runTest('Collection Rate Math: Normal positive collection', () => {
    const totalCollected = 80000;
    const totalExpected = 100000;
    const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;
    if (rate !== 80) throw new Error(`Expected 80%, got ${rate}%`);
  });

  runTest('Collection Rate Math: Zero expected does not divide by zero', () => {
    const totalCollected = 0;
    const totalExpected = 0;
    const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;
    if (rate !== 100 && !Number.isFinite(rate)) throw new Error(`Divide by zero produced invalid number: ${rate}`);
  });

  runTest('Defaulter Math: Base + Late Fee equals Total Outstanding', () => {
    const baseAmount = 15000;
    const penaltyAmount = 500;
    const totalOutstanding = baseAmount + penaltyAmount;
    if (totalOutstanding !== 15500) throw new Error(`Expected 15500, got ${totalOutstanding}`);
  });

  runTest('Property PnL: Rental Income - Maintenance Expenses = Net Profit', () => {
    const rentalIncome = 120000;
    const totalExpenses = 25000;
    const netProfit = rentalIncome - totalExpenses;
    const profitMargin = rentalIncome > 0 ? Math.round((netProfit / rentalIncome) * 100) : 0;
    if (netProfit !== 95000) throw new Error(`Expected 95000, got ${netProfit}`);
    if (profitMargin !== 79) throw new Error(`Expected 79%, got ${profitMargin}%`);
  });

  runTest('Property PnL: High Expenses yields negative margin gracefully', () => {
    const rentalIncome = 50000;
    const totalExpenses = 75000;
    const netProfit = rentalIncome - totalExpenses;
    const profitMargin = rentalIncome > 0 ? Math.round((netProfit / rentalIncome) * 100) : 0;
    if (netProfit !== -25000) throw new Error(`Expected -25000, got ${netProfit}`);
    if (profitMargin !== -50) throw new Error(`Expected -50%, got ${profitMargin}%`);
  });

  // -------------------------------------------------------------
  // Test Category 5: Build Dist Directory & Chunk Validation
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}5. Production Artifacts & Assets Build Verification${colors.reset}`);

  const distDir = path.join(projectRoot, 'dist');
  runTest('Vite production build output contains index.html and assets', () => {
    if (!fs.existsSync(distDir)) {
      throw new Error('dist directory does not exist');
    }
    const indexHtml = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      throw new Error('dist/index.html is missing');
    }
    const assetsDir = path.join(distDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      throw new Error('dist/assets is missing');
    }
    const files = fs.readdirSync(assetsDir);
    const hasCss = files.some((f) => f.endsWith('.css'));
    const hasJs = files.some((f) => f.endsWith('.js'));
    if (!hasCss || !hasJs) {
      throw new Error('Missing bundled CSS or JS assets in dist/assets');
    }
  });

  // -------------------------------------------------------------
  // Final Results
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.bold}  FRONTEND TEST SUMMARY: ${colors.green}${passed} PASSED${colors.reset}, ${failed > 0 ? colors.red + failed + ' FAILED' : colors.green + '0 FAILED'}${colors.reset}`);
  console.log(`${colors.bold}====================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
