import {
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Slider,
} from "@heroui/react";
import type { Key } from "react";
import { categoryOptions } from "~/server/lib/categories";
import { levelOptions } from "~/server/lib/levels";
import type { ChangeEvent } from "react";

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
  const selectedCategoryValue = searchParams.get("category") ?? "";
  const selectedCategory = categoryOptions.find(
    (cat) => cat.value === selectedCategoryValue,
  );

  const setCategoryParam = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  const handleCategoryChange = (value: string) => {
    const match = categoryOptions.find((cat) => cat.label === value);
    setCategoryParam(match?.value ?? null);
  };

  const handleCategorySelection = (key: Key | null) => {
    const value = typeof key === "string" ? key : null;
    setCategoryParam(value);
  };

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") next.set("level", value);
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

  console.log("Selected filters:", {
    minPrice,
    maxPrice,
  });

  return (
    <div className="flex gap-4 mb-6 items-center justify-center">
      <Autocomplete
        className="max-w-xs"
        defaultItems={categoryOptions}
        label="Filtrer par catégorie"
        name="category"
        selectedKey={selectedCategoryValue || null}
        inputValue={selectedCategory?.label ?? ""}
        onInputChange={handleCategoryChange}
        onSelectionChange={handleCategorySelection}
      >
        {(item) => (
          <AutocompleteItem key={item.value} className="capitalize">
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>
      <Select
        className="max-w-xs"
        label="Filtrer par niveau"
        name="level"
        onChange={handleLevelChange}
      >
        <SelectItem key="all">Tous les niveaux</SelectItem>
        <>
          {levelOptions.map((levelItem: { value: string; label: string }) => (
            <SelectItem key={levelItem.value} className="capitalize">
              {levelItem.label}
            </SelectItem>
          ))}
        </>
      </Select>
      <>
        <Slider
          className="max-w-md"
          name="price"
          defaultValue={[minPrice, maxPrice]}
          formatOptions={{ style: "currency", currency: "EUR" }}
          showTooltip={true}
          tooltipValueFormatOptions={{ style: "currency", currency: "EUR" }}
          label="Filtrer par prix"
          minValue={minPrice}
          maxValue={maxPrice}
          step={5}
          onChange={handlePriceRangeChange}
        />
      </>
    </div>
  );
}
