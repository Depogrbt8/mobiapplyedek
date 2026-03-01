// Araç Kiralama Modülü - Initialization
// Desktop (grbt8) ile aynı adapter pattern

import { setCarRentalAPI } from './api';
import { demoCarAPI } from './adapters/demo';

/**
 * Araç kiralama modülünü başlat
 * Gerçek API'ye geçişte sadece bu dosya değiştirilecek:
 *
 * import { rentalcarsAPI } from './adapters/rentalcars';
 * setCarRentalAPI(rentalcarsAPI);
 */
export function initCarRentalModule() {
  // Şimdilik demo API kullan
  setCarRentalAPI(demoCarAPI);

  if (__DEV__) {
    console.log('[Car Rental] Module initialized with Demo API');
  }
}

// Auto-initialize
initCarRentalModule();
