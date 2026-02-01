import { test, expect } from '../fixtures/test-fixtures';
import {
  STATES,
  Y_AXIS_OPTIONS,
  X_AXIS_OPTIONS,
  VEHICLE_CATEGORIES_TO_SELECT
} from '../config/constants';
import fs from 'fs';

test.describe('Vahan Dashboard Data Extraction', () => {
  test.describe.configure({ mode: 'serial' });

  const extractDataForState = async (
    vahanDashboard: any,
    stateName: string,
    testInfo: any
  ) => {
    // Navigate to dashboard
    await vahanDashboard.navigate();

    // Select State
    await vahanDashboard.selectState(stateName);

    // Select Y-Axis as Maker
    await vahanDashboard.selectYAxis(Y_AXIS_OPTIONS.MAKER);

    // === MONTH WISE EXTRACTION ===

    // Select X-Axis as Month Wise
    await vahanDashboard.selectXAxis(X_AXIS_OPTIONS.MONTH_WISE);

    // Click main Refresh
    await vahanDashboard.clickMainRefresh();

    // Open sidebar filter
    await vahanDashboard.openSidebarFilter();

    // Select vehicle categories in sidebar
    await vahanDashboard.selectVehicleCategories(VEHICLE_CATEGORIES_TO_SELECT);

    // Click sidebar Refresh
    await vahanDashboard.clickSidebarRefresh();

    // Download Excel for Month Wise
    const monthWiseFile = await vahanDashboard.downloadExcel(
      stateName,
      X_AXIS_OPTIONS.MONTH_WISE
    );

    expect(fs.existsSync(monthWiseFile)).toBeTruthy();
    testInfo.attach(`${stateName} - Month Wise Excel`, {
      path: monthWiseFile,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // === FUEL WISE EXTRACTION ===

    // Change X-Axis to Fuel
    await vahanDashboard.selectXAxis(X_AXIS_OPTIONS.FUEL);

    // Click main Refresh
    await vahanDashboard.clickMainRefresh();

    // Open sidebar filter
    await vahanDashboard.openSidebarFilter();

    // Select vehicle categories again
    await vahanDashboard.selectVehicleCategories(VEHICLE_CATEGORIES_TO_SELECT);

    // Click sidebar Refresh
    await vahanDashboard.clickSidebarRefresh();

    // Download Excel for Fuel
    const fuelWiseFile = await vahanDashboard.downloadExcel(
      stateName,
      X_AXIS_OPTIONS.FUEL
    );

    expect(fs.existsSync(fuelWiseFile)).toBeTruthy();
    testInfo.attach(`${stateName} - Fuel Wise Excel`, {
      path: fuelWiseFile,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return { monthWiseFile, fuelWiseFile };
  };

  test('@goa Extract data for Goa', async ({ vahanDashboard }, testInfo) => {
    const files = await extractDataForState(vahanDashboard, STATES.GOA, testInfo);
    console.log(`Goa files downloaded:`, files);
  });

  test('@gujarat Extract data for Gujarat', async ({ vahanDashboard }, testInfo) => {
    const files = await extractDataForState(vahanDashboard, STATES.GUJARAT, testInfo);
    console.log(`Gujarat files downloaded:`, files);
  });

  test('@maharashtra Extract data for Maharashtra', async ({ vahanDashboard }, testInfo) => {
    const files = await extractDataForState(vahanDashboard, STATES.MAHARASHTRA, testInfo);
    console.log(`Maharashtra files downloaded:`, files);
  });

  test('@madhya-pradesh Extract data for Madhya Pradesh', async ({ vahanDashboard }, testInfo) => {
    const files = await extractDataForState(vahanDashboard, STATES.MADHYA_PRADESH, testInfo);
    console.log(`Madhya Pradesh files downloaded:`, files);
  });
});
