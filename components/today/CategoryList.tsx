"use client";

import type { CategoryForecast } from "@/lib/types";
import CategoryCard from "./CategoryCard";
import { useT } from "@/lib/i18n";

interface CategoryListProps {
  categories: CategoryForecast[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const { t } = useT();

  return (
    <div className="mx-5">
      <h2 className="text-lg font-medium tracking-wide text-white/90 mb-3">
        {t("cat.title")}
      </h2>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.category} forecast={cat} />
        ))}
      </div>
    </div>
  );
}
