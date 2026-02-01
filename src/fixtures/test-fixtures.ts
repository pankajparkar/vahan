import { test as base } from '@playwright/test';
import { VahanDashboardPage } from '../pages/VahanDashboardPage';

type VahanFixtures = {
  vahanDashboard: VahanDashboardPage;
};

export const test = base.extend<VahanFixtures>({
  vahanDashboard: async ({ page }, use) => {
    const vahanDashboard = new VahanDashboardPage(page);
    await use(vahanDashboard);
  },
});

export { expect } from '@playwright/test';
