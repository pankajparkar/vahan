export const VAHAN_CONFIG = {
  BASE_URL: 'https://vahan.parivahan.gov.in',
  DASHBOARD_PATH: '/vahan4dashboard/vahan/vahan/view/reportview.xhtml',

  get DASHBOARD_URL() {
    return `${this.BASE_URL}${this.DASHBOARD_PATH}`;
  }
} as const;

export const STATES = {
  GOA: 'Goa',
  GUJARAT: 'Gujarat',
  MAHARASHTRA: 'Maharashtra',
  MADHYA_PRADESH: 'Madhya Pradesh'
} as const;

export const STATES_LIST = [
  STATES.GOA,
  STATES.GUJARAT,
  STATES.MAHARASHTRA,
  STATES.MADHYA_PRADESH
] as const;

export const Y_AXIS_OPTIONS = {
  MAKER: 'Maker'
} as const;

export const X_AXIS_OPTIONS = {
  MONTH_WISE: 'Month Wise',
  FUEL: 'Fuel'
} as const;

export const VEHICLE_CATEGORIES = {
  LIGHT_MOTOR_VEHICLE: 'LIGHT MOTOR VEHICLE',
  LIGHT_PASSENGER_VEHICLE: 'LIGHT PASSENGER VEHICLE'
} as const;

export const VEHICLE_CATEGORIES_TO_SELECT = [
  VEHICLE_CATEGORIES.LIGHT_MOTOR_VEHICLE,
  VEHICLE_CATEGORIES.LIGHT_PASSENGER_VEHICLE
] as const;

export const TIMEOUTS = {
  PAGE_LOAD: 60000,
  ELEMENT_VISIBLE: 30000,
  DOWNLOAD: 60000,
  NETWORK_IDLE: 30000,
  REFRESH_DELAY: 5000
} as const;

export const SELECTORS = {
  // Dropdown selectors
  STATE_DROPDOWN: '#stateId_label',
  STATE_DROPDOWN_PANEL: '#stateId_panel',
  Y_AXIS_DROPDOWN: '#yaxisVarId_label',
  Y_AXIS_DROPDOWN_PANEL: '#yaxisVarId_panel',
  X_AXIS_DROPDOWN: '#xaxisVarId_label',
  X_AXIS_DROPDOWN_PANEL: '#xaxisVarId_panel',

  // Buttons
  REFRESH_BUTTON: '#vhidenContent .ui-button',
  SIDEBAR_REFRESH_BUTTON: '#vhandedContent .ui-button, button:has-text("Refresh")',
  DOWNLOAD_EXCEL_BUTTON: 'a[href*="excel"], button:has-text("Excel"), .excel-download',

  // Vehicle category checkboxes in sidebar
  VEHICLE_CATEGORY_CHECKBOX: 'input[type="checkbox"]',

  // Sidebar
  SIDEBAR_PANEL: '.ui-datatable, #vhandedContent',

  // Loading indicators
  LOADING_INDICATOR: '.ui-blockui, .ui-loading'
} as const;

export type StateName = typeof STATES[keyof typeof STATES];
export type XAxisOption = typeof X_AXIS_OPTIONS[keyof typeof X_AXIS_OPTIONS];
export type YAxisOption = typeof Y_AXIS_OPTIONS[keyof typeof Y_AXIS_OPTIONS];
