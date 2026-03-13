import {
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Slider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Chip,
} from '@heroui/react';
import type { Key } from 'react';
import { categoryOptions, levelOptions } from '~/lib/constant';
import type { ChangeEvent } from 'react';
import { InlineIcon } from '@iconify/react';
import type { NavigateOptions } from 'react-router';
import { formatPrice } from '~/lib/utils';

type FiltersProps = {
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams, navigateOptions?: NavigateOptions) => void;
  minPrice: number;
  maxPrice: number;
};

export default function Filters({ searchParams, setSearchParams, minPrice, maxPrice }: FiltersProps) {
  const selectedCategoryValue = searchParams.get('category') ?? '';
  const selectedLevelValue = searchParams.get('level') ?? '';
  const selectedCategory = categoryOptions.find((cat) => cat.value === selectedCategoryValue);

  const rawMinPrice = Number(searchParams.get('minPrice') ?? minPrice);
  const rawMaxPrice = Number(searchParams.get('maxPrice') ?? maxPrice);

  const selectedMinPrice = Number.isFinite(rawMinPrice)
    ? Math.min(Math.max(rawMinPrice, minPrice), maxPrice)
    : minPrice;

  const selectedMaxPrice = Number.isFinite(rawMaxPrice)
    ? Math.max(Math.min(rawMaxPrice, maxPrice), minPrice)
    : maxPrice;

  const priceRange: [number, number] =
    selectedMinPrice <= selectedMaxPrice ? [selectedMinPrice, selectedMaxPrice] : [selectedMaxPrice, selectedMinPrice];

  const setCategoryParam = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    next.delete('cursor');
    next.delete('direction');
    if (value) next.set('category', value);
    else next.delete('category');
    setSearchParams(next, { preventScrollReset: true });
  };

  const handleCategoryChange = (value: string) => {
    const match = categoryOptions.find((cat) => cat.key === value);
    setCategoryParam(match?.value ?? null);
  };

  const handleCategorySelection = (key: Key | null) => {
    const value = typeof key === 'string' ? key : null;
    setCategoryParam(value);
  };

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    next.delete('cursor');
    next.delete('direction');
    if (value) next.set('level', value);
    else next.delete('level');
    setSearchParams(next, { preventScrollReset: true });
  };

  const handlePriceRangeChange = (value: number | number[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('cursor');
    next.delete('direction');
    if (Array.isArray(value)) {
      next.set('minPrice', value[0].toString());
      next.set('maxPrice', value[1].toString());
    } else {
      next.delete('minPrice');
      next.delete('maxPrice');
    }
    setSearchParams(next, { preventScrollReset: true });
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          variant="flat"
          radius="lg"
          startContent={<InlineIcon icon="lucide:list-filter-plus" />}
          className="bg-bg font-medium"
        >
          Filtrer
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col gap-4">
          <Autocomplete
            size="sm"
            className="w-full"
            defaultItems={categoryOptions}
            label="Filtrer par catégorie"
            name="category"
            color="warning"
            variant="bordered"
            selectedKey={selectedCategoryValue || null}
            inputValue={selectedCategory?.value || ''}
            onInputChange={handleCategoryChange}
            onSelectionChange={handleCategorySelection}
            isClearable
          >
            {(item) => <AutocompleteItem key={item.key}>{item.value}</AutocompleteItem>}
          </Autocomplete>

          <Select
            className="w-full"
            label="Filtrer par niveau"
            size="sm"
            name="level"
            color="warning"
            variant="bordered"
            selectedKeys={selectedLevelValue ? [selectedLevelValue] : []}
            onChange={handleLevelChange}
            isClearable
          >
            {levelOptions.map((levelItem) => (
              <SelectItem key={levelItem.key}>{levelItem.value}</SelectItem>
            ))}
          </Select>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Filtrer par prix</p>
              <div className="flex items-center gap-2">
                <Chip size="sm" variant="flat" color="warning">
                  {formatPrice(priceRange[0])}
                </Chip>
                <span className="text-default-500">—</span>
                <Chip size="sm" variant="flat" color="warning">
                  {formatPrice(priceRange[1])}
                </Chip>
              </div>
            </div>

            <Slider
              className="w-full"
              color="warning"
              name="price"
              value={priceRange}
              formatOptions={{ style: 'currency', currency: 'EUR' }}
              showTooltip={true}
              tooltipValueFormatOptions={{
                style: 'currency',
                currency: 'EUR',
              }}
              size="sm"
              minValue={minPrice}
              maxValue={maxPrice}
              step={1}
              onChange={handlePriceRangeChange}
            />

            <div className="flex items-center justify-between text-xs text-default-500">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
          </div>

          <Button
            variant="light"
            onPress={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('cursor');
              next.delete('direction');
              next.delete('category');
              next.delete('level');
              next.delete('minPrice');
              next.delete('maxPrice');
              setSearchParams(next, { preventScrollReset: true });
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
