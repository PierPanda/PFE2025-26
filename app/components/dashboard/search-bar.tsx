import { Input } from '@heroui/react';
import type { NavigateOptions } from 'react-router';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { InlineIcon } from '@iconify/react';

type SearchBarProps = {
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams, navigateOptions?: NavigateOptions) => void;
};

const DEBOUNCE_MS = 300;

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { searchParams, setSearchParams },
  ref,
) {
  const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    setInputValue(urlSearch);
  }, [searchParams]);

  const commitSearch = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set('search', value);
      else next.delete('search');
      setSearchParams(next, { preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      commitSearch(value);
    }, DEBOUNCE_MS);
  };

  return (
    <Input
      ref={ref}
      onChange={handleChange}
      value={inputValue}
      placeholder="Rechercher un cours..."
      className="w-64"
      startContent={<InlineIcon icon="lucide:search" />}
    />
  );
});
