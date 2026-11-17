/**
 * @file config.js
 * @description Global client configuration for Rectilinear Redundancies.
 * Configures analytics synchronization endpoints and environment credentials.
 * @version 5.3.0
 * @license MIT
 */

(function (window) {
  'use strict';

  /**
   * Client-side synchronization configuration.
   * Configure this object to connect your study dashboard with a hosted sync server.
   *
   * @property {string} endpoint - The base URL of the sync server (e.g., "https://sync.example.com").
   *                               Leave empty ("") to keep all data local to this device.
   * @property {string} siteKey  - Optional authorization key matching the server's SITE_KEY.
   */
  window.SYNC_CONFIG = Object.freeze({
    endpoint: '',
    siteKey: ''
  });

})(typeof window !== 'undefined' ? window : this);
