import "./Search.css";

function Search({
  value,
  onChange,
  onClear,
}) {

  return (

    <div className="customer-search-box">

      <span
        className="customer-search-icon"
        aria-hidden="true"
      >
        ⌕
      </span>

      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        aria-label="Search for products, brands and more"
      />

      {value && (

        <button
          type="button"
          className="customer-search-clear"
          onClick={
            onClear
          }
          aria-label="Clear search"
        >
          ✕
        </button>

      )}

    </div>
  );
}

export default Search;