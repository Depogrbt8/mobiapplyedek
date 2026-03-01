// Araç Arama Hook - Desktop (grbt8) ile birebir aynı yapı

import { useState, useCallback } from 'react';
import { searchCars } from '../services/car/api';
import type { CarSearchParams, CarSearchResult, CarFiltersType, Car } from '../types/car';
import { calculateFilterOptions } from '../utils/carHelpers';

export function useCarSearch() {
  const [result, setResult] = useState<CarSearchResult | null>(null);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: CarSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const searchResult = await searchCars(params);
      setResult(searchResult);
      setAllCars(searchResult.data);
    } catch (err: any) {
      console.error('Car search error:', err);
      setError(err.message || 'Araç arama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterOptions = allCars.length > 0 ? calculateFilterOptions(allCars) : null;

  return { result, allCars, loading, error, search, filterOptions };
}
