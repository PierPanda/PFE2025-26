import { Button, Input } from '@heroui/react';
import type { NavigateOptions } from 'react-router';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { InlineIcon } from '@iconify/react';

type SearchBarProps = {
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams, navigateOptions?: NavigateOptions) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onSubmit?: () => void;
};

const DEBOUNCE_MS = 300;

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { searchParams, setSearchParams, className, size = 'md', onSubmit },
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
      next.delete('cursor');
      next.delete('direction');
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    commitSearch(inputValue);
    onSubmit?.();
  };

  return (
    <Input
      ref={ref}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      value={inputValue}
      placeholder="Rechercher un cours..."
      className={className ?? 'w-64'}
      size={size}
      startContent={<InlineIcon icon="lucide:search" />}
      endContent={
        onSubmit ? (
          <Button
            isIconOnly
            size="sm"
            radius="md"
            color="secondary"
            onPress={() => {
              commitSearch(inputValue);
              onSubmit();
            }}
            aria-label="Lancer la recherche"
          >
            <InlineIcon icon="lucide:arrow-right" />
          </Button>
        ) : null
      }
    />
  );
});
