import "./Wishlist.css";

function Wishlist({
  wishlist = [],
  addToCart,
  toggleWishlist,
  setActivePage,
}) {
  return (
    <div className="wishlist-page">
      {/* HEADER */}
      <div className="wishlist-header">
        <button
          type="button"
          className="back-button"
          onClick={() => setActivePage("profile")}
          aria-label="Back to profile"
        >
          ←
        </button>

        <div>
          <h2>My Wishlist</h2>
          <p>Save your favourite products for later</p>
        </div>
      </div>

      {/* EMPTY */}
      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">♡</div>

          <h3>Your wishlist is empty</h3>

          <p>
            Like products to save them here.
          </p>

          <button
            type="button"
            onClick={() => setActivePage("home")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* PRODUCTS */
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div
              className="wishlist-card"
              key={product.id}
            >
              {/* HEART */}
              <button
                type="button"
                className="wishlist-heart"
                onClick={() => toggleWishlist(product)}
                aria-label={`Remove ${product.name} from wishlist`}
              >
                ♥
              </button>

              {/* IMAGE */}
              <div className="wishlist-image-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>

              {/* INFO */}
              <div className="wishlist-info">
                <h3>{product.name}</h3>

                <p>{product.quantity}</p>

                <div className="wishlist-bottom">
                  <strong>₹{product.price}</strong>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
