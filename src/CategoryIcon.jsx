import React from "react";

const ICONS = {
  grocery: "/category-icons/grocery.png",
  beverages: "/category-icons/beverages.png",
  snacks: "/category-icons/snacks.png",
  food: "/category-icons/food.png",
  dairy: "/category-icons/dairy.png",
  fruitsVegetables: "/category-icons/fruits-vegetables.png",
  personalCare: "/category-icons/personal-care.png",
  household: "/category-icons/household.png",
  juice: "/category-icons/juice.png",
  iceCream: "/category-icons/ice-cream.png",
  nonVeg: "/category-icons/non-veg.png",
  sweets: "/category-icons/sweets.png",
  cafe: "/category-icons/cafe.png",
};

function getCategoryIconKey(category) {
  const value = String(
    category?.name ||
      category?.categoryName ||
      ""
  )
    .trim()
    .toLowerCase();

  if (["grocery", "किराना", "किराणा", "all", "सभी", "सर्व"].includes(value)) return "grocery";
  if (value === "beverages" || value === "पेय" || value === "पेयपदार्थ") return "beverages";
  if (value === "snacks" || value === "स्नैक्स") return "snacks";
  if (value === "food" || value === "खाना" || value === "खाद्यपदार्थ") return "food";
  if (value === "dairy" || value === "डेयरी") return "dairy";
  if (
    value.includes("vegetables") ||
    value.includes("fruits") ||
    value.includes("सब्ज़") ||
    value.includes("सब्जी") ||
    value.includes("फळे") ||
    value.includes("भाज्या")
  ) return "fruitsVegetables";
  if (
    value.includes("personal care") ||
    value.includes("पर्सनल केयर") ||
    value.includes("पर्सनल केअर")
  ) return "personalCare";
  if (
    value.includes("household") ||
    value.includes("घरेलू सामान") ||
    value.includes("घरगुती वस्तू")
  ) return "household";
  if (value === "juice" || value === "जूस" || value === "ज्यूस") return "juice";
  if (value.includes("ice cream") || value.includes("आइसक्रीम")) return "iceCream";
  if (
    value.includes("non veg") ||
    value.includes("non-veg") ||
    value.includes("नॉन वेज") ||
    value.includes("नॉन-वेज")
  ) return "nonVeg";
  if (value === "sweets" || value === "मिठाई" || value === "मिठाईयां") return "sweets";
  if (value === "cafe" || value === "कैफे" || value === "कॅफे") return "cafe";

  return null;
}

function CategoryIcon({ category, className = "" }) {
  const key = getCategoryIconKey(category);
  const src = key ? ICONS[key] : null;

  if (!src) {
    return <span className={className}>{category?.icon || "🏷️"}</span>;
  }

  return (
    <img
      src={src}
      alt=""
      className={`category-icon-image ${className}`.trim()}
      draggable="false"
    />
  );
}

export default CategoryIcon;
