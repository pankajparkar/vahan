import { Page, Download } from '@playwright/test';
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

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    await this.page.goto(VAHAN_CONFIG.DASHBOARD_URL, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.PAGE_LOAD
    });
    await waitForPageLoad(this.page);
    await delay(3000); // Allow dynamic content to load
  }

  async selectFromDropdownByLabel(
    labelText: string,
    optionText: string
  ): Promise<void> {
    // Find the inner label with ui-outputlabel class (e.g., "State:", "Y-Axis:", "X-Axis:")
    const label = this.page.locator(`label.ui-outputlabel:has-text("${labelText}")`);
    await label.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });

    // Navigate up to the container div (ui-grid-col-*) and find the dropdown
    const container = label.locator('..').locator('..');
    const dropdown = container.locator('.ui-selectonemenu').first();

    // Click to open dropdown
    await dropdown.click();
    await delay(500);

    // Wait for dropdown panel to appear
    const dropdownPanel = this.page.locator('.ui-selectonemenu-panel:visible');
    await dropdownPanel.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });

    // Find and click the option
    const option = dropdownPanel.locator('li').filter({ hasText: optionText });
    await option.first().click();

    await delay(1000);
    await waitForLoaderToDisappear(this.page);
  }

  async selectState(state: StateName): Promise<void> {
    console.log(`Selecting state: ${state}`);
    await this.selectFromDropdownByLabel('State:', state);
  }

  async selectYAxis(option: YAxisOption): Promise<void> {
    console.log(`Selecting Y-Axis: ${option}`);
    await this.selectFromSelectById('yaxisVar_input', option);
  }

  async selectXAxis(option: XAxisOption): Promise<void> {
    console.log(`Selecting X-Axis: ${option}`);
    await this.selectFromSelectById('xaxisVar_input', option);
  }

  async selectFromSelectById(selectId: string, optionText: string): Promise<void> {
    // Find the parent ui-selectonemenu container of the select element
    const select = this.page.locator(`#${selectId}`);
    const dropdown = select.locator('..').locator('..'); // Navigate up to .ui-selectonemenu

    // Click to open dropdown
    await dropdown.click();
    await delay(500);

    // Wait for dropdown panel to appear
    const dropdownPanel = this.page.locator('.ui-selectonemenu-panel:visible');
    await dropdownPanel.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });

    // Find and click the option
    const option = dropdownPanel.locator('li').filter({ hasText: optionText });
    await option.first().click();

    await delay(1000);
    await waitForLoaderToDisappear(this.page);
  }

  async clickMainRefresh(): Promise<void> {
    console.log('Clicking main Refresh button');

    // Find Refresh button inside .button-section div with span containing "Refresh"
    const refreshButton = this.page.locator('.button-section span:has-text("Refresh")').first();
    await refreshButton.click();

    await delay(TIMEOUTS.REFRESH_DELAY);
    await waitForLoaderToDisappear(this.page);
  }

  async openSidebarFilter(): Promise<void> {
    console.log('Opening sidebar filter');

    // Check if sidebar is already visible
    const sidebar = this.page.locator('#filterLayout');
    const isVisible = await sidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    }).catch(() => false);

    // Only click toggler if sidebar is not visible
    if (!isVisible) {
      const sidebarToggler = this.page.locator('#filterLayout-toggler');
      await sidebarToggler.click();
      await delay(1000);
    }
  }

  async selectVehicleCategories(categories: readonly string[]): Promise<void> {
    console.log(`Selecting vehicle categories: ${categories.join(', ')}`);

    // Find the VhCatg table
    const table = this.page.locator('#VhCatg');
    await table.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });

    for (const category of categories) {
      // Find the label with the category text inside the table
      const label = table.locator(`label:has-text("${category}")`);

      // Find the checkbox associated with this label (sibling or parent's checkbox)
      const row = label.locator('..');
      const checkbox = row.locator('.ui-chkbox-box').first();

      // Check if already selected
      const isChecked = await checkbox.getAttribute('aria-checked') === 'true';

      if (!isChecked) {
        await checkbox.click();
        await delay(500);
      }
    }
  }

  async clickSidebarRefresh(): Promise<void> {
    console.log('Clicking sidebar Refresh button');

    // Find Refresh button inside #filterLayout div with span containing "Refresh"
    const sidebarRefreshButton = this.page.locator('#filterLayout span:has-text("Refresh")').first();
    await sidebarRefreshButton.click();

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

    // Click the Excel download button
    const excelButton = this.page.locator('#groupingTable\\:xls');
    await excelButton.click();

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

    // Open sidebar filter
    await this.openSidebarFilter();

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
