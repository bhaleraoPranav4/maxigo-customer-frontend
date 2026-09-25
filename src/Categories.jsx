import "./Categories.css";

function Categories({
  categories = [],
  selectedCategory,
  onCategoryClick,
  onSeeAll,
}) {
  return (
    <section className="customer-categories-section">
      <div className="customer-categories">

        {categories.map(
          (category) => (

            <button
              type="button"
              key={category.id}
              className={`customer-category ${
                String(
                  selectedCategory
                ) ===
                String(
                  category.id
                )
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onCategoryClick(
                  category.id
                )
              }
            >

              <div className="customer-category-icon">
                {category.icon}
              </div>

              <span>
                {category.name}
              </span>

            </button>

          )
        )}

      </div>

      {onSeeAll && (

        <button
          type="button"
          className="customer-category-see-all"
          onClick={
            onSeeAll
          }
        >
          See All →
        </button>

      )}

    </section>
  );
}

export default Categories;