import { Page } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.NETWORK_IDLE });
}

export async function waitForLoaderToDisappear(page: Page): Promise<void> {
  const loaderSelectors = [
    '.ui-blockui',
    '.ui-loading',
    '.loading-overlay',
    '[class*="loading"]',
    '[class*="spinner"]'
  ];

  for (const selector of loaderSelectors) {
    const loader = page.locator(selector);
    const count = await loader.count();

    if (count > 0) {
      await loader.first().waitFor({ state: 'hidden', timeout: TIMEOUTS.ELEMENT_VISIBLE });
    }
  }
}

export async function delay(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForElementAndClick(
  page: Page,
  selector: string,
  options?: { timeout?: number }
): Promise<void> {
  const timeout = options?.timeout ?? TIMEOUTS.ELEMENT_VISIBLE;

  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.click(selector);
}

export async function waitForDropdownOption(
  page: Page,
  panelSelector: string,
  optionText: string
): Promise<void> {
  await page.waitForSelector(panelSelector, { state: 'visible' });

  const option = page.locator(`${panelSelector} li`).filter({ hasText: optionText });
  await option.waitFor({ state: 'visible' });
}
