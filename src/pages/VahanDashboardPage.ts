import { Page, Locator, Download, expect } from '@playwright/test';
import path from 'path';
import {
  VAHAN_CONFIG,
  TIMEOUTS,
  StateName,
  XAxisOption,
  YAxisOption,
  VEHICLE_CATEGORIES_TO_SELECT
} from '../config/constants';
import { waitForPageLoad, waitForLoaderToDisappear, delay } from '../utils/wait-utils';
import { getDownloadPath, generateFileName } from '../utils/file-utils';

export class VahanDashboardPage {
  readonly page: Page;

  // Dropdown locators
  readonly stateDropdown: Locator;
  readonly yAxisDropdown: Locator;
  readonly xAxisDropdown: Locator;

  // Button locators
  readonly mainRefreshButton: Locator;
  readonly sidebarRefreshButton: Locator;
  readonly excelDownloadButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize dropdown locators
    this.stateDropdown = page.locator('#selectedState_label, #stateId_label, label:has-text("State") + div .ui-dropdown-label').first();
    this.yAxisDropdown = page.locator('#yaxisVar_label, #yaxisVarId_label, label:has-text("Y-Axis") + div .ui-dropdown-label').first();
    this.xAxisDropdown = page.locator('#xaxisVar_label, #xaxisVarId_label, label:has-text("X-Axis") + div .ui-dropdown-label').first();

    // Initialize button locators
    this.mainRefreshButton = page.locator('button:has-text("Refresh")').first();
    this.sidebarRefreshButton = page.locator('#filterVhPanel button:has-text("Refresh"), .sidebar button:has-text("Refresh")').first();
    this.excelDownloadButton = page.locator('a:has-text("Excel"), button:has-text("Excel"), .excel-btn, [title*="Excel"]').first();
  }

  async navigate(): Promise<void> {
    await this.page.goto(VAHAN_CONFIG.DASHBOARD_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.PAGE_LOAD
    });
    await waitForPageLoad(this.page);
    await delay(3000); // Allow dynamic content to load
  }

  async selectFromDropdown(
    dropdownLocator: Locator,
    optionText: string
  ): Promise<void> {
    // Click to open dropdown
    await dropdownLocator.click();
    await delay(500);

    // Wait for dropdown panel to appear and select option
    const dropdownPanel = this.page.locator('.ui-dropdown-panel:visible, .ui-selectonemenu-panel:visible');
    await dropdownPanel.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });

    // Find and click the option
    const option = dropdownPanel.locator('li').filter({ hasText: optionText });
    await option.first().click();

    await delay(1000);
    await waitForLoaderToDisappear(this.page);
  }

  async selectState(state: StateName): Promise<void> {
    console.log(`Selecting state: ${state}`);
    await this.selectFromDropdown(this.stateDropdown, state);
  }

  async selectYAxis(option: YAxisOption): Promise<void> {
    console.log(`Selecting Y-Axis: ${option}`);
    await this.selectFromDropdown(this.yAxisDropdown, option);
  }

  async selectXAxis(option: XAxisOption): Promise<void> {
    console.log(`Selecting X-Axis: ${option}`);
    await this.selectFromDropdown(this.xAxisDropdown, option);
  }

  async clickMainRefresh(): Promise<void> {
    console.log('Clicking main Refresh button');

    // Try multiple selectors for the refresh button
    const refreshSelectors = [
      'button:has-text("Refresh")',
      '#j_idt77',
      'button.ui-button:has-text("Refresh")',
      '.ui-button-text:has-text("Refresh")'
    ];

    for (const selector of refreshSelectors) {
      const button = this.page.locator(selector).first();
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        await button.click();
        break;
      }
    }

    await delay(TIMEOUTS.REFRESH_DELAY);
    await waitForLoaderToDisappear(this.page);
  }

  async selectVehicleCategories(categories: readonly string[]): Promise<void> {
    console.log(`Selecting vehicle categories: ${categories.join(', ')}`);

    for (const category of categories) {
      // Find checkbox row with the category text
      const row = this.page.locator('tr, .ui-datatable-row, .checkbox-row')
        .filter({ hasText: category });

      const checkbox = row.locator('input[type="checkbox"], .ui-chkbox-box').first();

      const isChecked = await checkbox.isChecked().catch(async () => {
        // For PrimeFaces checkboxes
        const chkbox = row.locator('.ui-chkbox-box');
        const ariaChecked = await chkbox.getAttribute('aria-checked');
        return ariaChecked === 'true';
      });

      if (!isChecked) {
        await checkbox.click().catch(async () => {
          // Try clicking the PrimeFaces checkbox wrapper
          await row.locator('.ui-chkbox').first().click();
        });
        await delay(500);
      }
    }
  }

  async clickSidebarRefresh(): Promise<void> {
    console.log('Clicking sidebar Refresh button');

    // The sidebar refresh might be a different button
    const sidebarRefreshSelectors = [
      '#filterVhPanel button:has-text("Refresh")',
      '.filter-panel button:has-text("Refresh")',
      'button:has-text("Refresh"):nth-child(2)',
      '#vhandedContent button:has-text("Refresh")'
    ];

    for (const selector of sidebarRefreshSelectors) {
      const button = this.page.locator(selector).first();
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        await button.click();
        break;
      }
    }

    // Fallback: click the second refresh button if multiple exist
    const allRefreshButtons = this.page.locator('button:has-text("Refresh")');
    const count = await allRefreshButtons.count();

    if (count > 1) {
      await allRefreshButtons.nth(1).click();
    }

    await delay(TIMEOUTS.REFRESH_DELAY);
    await waitForLoaderToDisappear(this.page);
  }

  async downloadExcel(state: string, xAxis: string): Promise<string> {
    console.log(`Downloading Excel for ${state} - ${xAxis}`);

    const downloadPath = getDownloadPath();
    const fileName = generateFileName(state, xAxis);
    const fullPath = path.join(downloadPath, fileName);

    // Set up download handler
    const downloadPromise = this.page.waitForEvent('download', {
      timeout: TIMEOUTS.DOWNLOAD
    });

    // Find and click download button
    const downloadSelectors = [
      'a:has-text("Excel")',
      'button:has-text("Excel")',
      '[title*="Excel"]',
      '.excel-download',
      'a[href*="excel"]',
      'img[alt*="excel"]',
      '.ui-commandlink:has-text("Excel")'
    ];

    let clicked = false;
    for (const selector of downloadSelectors) {
      const button = this.page.locator(selector).first();
      const isVisible = await button.isVisible().catch(() => false);

      if (isVisible) {
        await button.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      // Try finding by image or icon
      const excelIcon = this.page.locator('img[src*="excel"], [class*="excel"]').first();
      if (await excelIcon.isVisible()) {
        await excelIcon.click();
      }
    }

    // Wait for download to complete
    const download: Download = await downloadPromise;
    await download.saveAs(fullPath);

    console.log(`Downloaded: ${fullPath}`);
    return fullPath;
  }

  async extractDataForXAxis(
    state: StateName,
    xAxis: XAxisOption
  ): Promise<string> {
    // Select X-Axis
    await this.selectXAxis(xAxis);

    // Click main refresh
    await this.clickMainRefresh();

    // Select vehicle categories in sidebar
    await this.selectVehicleCategories(VEHICLE_CATEGORIES_TO_SELECT);

    // Click sidebar refresh
    await this.clickSidebarRefresh();

    // Download Excel
    const downloadedFile = await this.downloadExcel(state, xAxis);

    return downloadedFile;
  }

  async extractAllDataForState(
    state: StateName,
    yAxis: YAxisOption,
    xAxisOptions: readonly XAxisOption[]
  ): Promise<string[]> {
    const downloadedFiles: string[] = [];

    // Navigate and select state and Y-axis
    await this.navigate();
    await this.selectState(state);
    await this.selectYAxis(yAxis);

    // Extract data for each X-axis option
    for (const xAxis of xAxisOptions) {
      const file = await this.extractDataForXAxis(state, xAxis);
      downloadedFiles.push(file);
    }

    return downloadedFiles;
  }
}
