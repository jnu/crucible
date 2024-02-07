import {useMemo} from 'react';
import {useLocation} from 'react-router-dom';

/**
 * Hook to extract the query parameters from the current URL.
 */
export const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};
