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
} from "@heroui/react";
import type { Key } from "react";
import { categoryOptions } from "~/server/lib/categories";
import { levelOptions } from "~/server/lib/levels";
import type { ChangeEvent } from "react";
import { InlineIcon } from "@iconify/react";

type FiltersProps = {
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  minPrice: number;
  maxPrice: number;
};

export function Filters({
  searchParams,
  setSearchParams,
  minPrice,
  maxPrice,
}: FiltersProps) {
  const toCapitalized = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  const selectedCategoryValue = searchParams.get("category") ?? "";
  const selectedLevelValue = searchParams.get("level") ?? "";
  const selectedCategory = categoryOptions.find(
    (cat) => cat.value === selectedCategoryValue,
  );

  const rawMinPrice = Number(searchParams.get("minPrice") ?? minPrice);
  const rawMaxPrice = Number(searchParams.get("maxPrice") ?? maxPrice);

  const selectedMinPrice = Number.isFinite(rawMinPrice)
    ? Math.min(Math.max(rawMinPrice, minPrice), maxPrice)
    : minPrice;

  const selectedMaxPrice = Number.isFinite(rawMaxPrice)
    ? Math.max(Math.min(rawMaxPrice, maxPrice), minPrice)
    : maxPrice;

  const priceRange: [number, number] =
    selectedMinPrice <= selectedMaxPrice
      ? [selectedMinPrice, selectedMaxPrice]
      : [selectedMaxPrice, selectedMinPrice];

  const setCategoryParam = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  const handleCategoryChange = (value: string) => {
    const normalizedValue = value.toLowerCase();
    const match = categoryOptions.find(
      (cat) => cat.label.toLowerCase() === normalizedValue,
    );
    setCategoryParam(match?.value ?? null);
  };

  const handleCategorySelection = (key: Key | null) => {
    const value = typeof key === "string" ? key : null;
    setCategoryParam(value);
  };

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("level", value);
    else next.delete("level");
    setSearchParams(next);
  };

  const handlePriceRangeChange = (value: number | number[]) => {
    const next = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      next.set("minPrice", value[0].toString());
      next.set("maxPrice", value[1].toString());
    } else {
      next.delete("minPrice");
      next.delete("maxPrice");
    }
    setSearchParams(next);
  };

  return (
    <>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            variant="flat"
            startContent={<InlineIcon icon="lucide:list-filter-plus" />}
          >
            Filtrer
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4">
          <div className="flex flex-col gap-4">
            <Autocomplete
              size="sm"
              className="w-full capitalize"
              defaultItems={categoryOptions}
              label="Filtrer par catégorie"
              name="category"
              selectedKey={selectedCategoryValue || null}
              inputValue={
                selectedCategory?.label
                  ? toCapitalized(selectedCategory.label)
                  : ""
              }
              onInputChange={handleCategoryChange}
              onSelectionChange={handleCategorySelection}
              isClearable
            >
              {(item) => (
                <AutocompleteItem key={item.value} className="capitalize">
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Select
              className="w-full"
              classNames={{ value: "capitalize" }}
              label="Filtrer par niveau"
              size="sm"
              name="level"
              selectedKeys={selectedLevelValue ? [selectedLevelValue] : []}
              onChange={handleLevelChange}
              isClearable
            >
              {levelOptions.map(
                (levelItem: { value: string; label: string }) => (
                  <SelectItem key={levelItem.value} className="capitalize">
                    {levelItem.label}
                  </SelectItem>
                ),
              )}
            </Select>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">Filtrer par prix</p>
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat">
                    {formatPrice(priceRange[0])}
                  </Chip>
                  <span className="text-default-500">—</span>
                  <Chip size="sm" variant="flat">
                    {formatPrice(priceRange[1])}
                  </Chip>
                </div>
              </div>

              <Slider
                className="w-full"
                color="foreground"
                name="price"
                value={priceRange}
                formatOptions={{ style: "currency", currency: "EUR" }}
                showTooltip={true}
                tooltipValueFormatOptions={{
                  style: "currency",
                  currency: "EUR",
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
                next.delete("category");
                next.delete("level");
                next.delete("minPrice");
                next.delete("maxPrice");
                setSearchParams(next);
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex gap-4 mb-6 items-center justify-center">
        <></>
      </div>
    </>
  );
}
