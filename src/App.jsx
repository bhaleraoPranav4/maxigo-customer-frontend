import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./App.css";

import Search from "./Search";
import Categories from "./Categories";
import Orders from "./Orders";
import Profile from "./Profile";
import PaymentMethods from "./PaymentMethods";
import TrackOrder from "./TrackOrder";
import Referral from "./Referral";
import Wallet from "./Wallet";

import {
  addCartItem,
  cancelMyOrder,
  clearAuth,
  createAddress,
  deleteAddress,
  getAddresses,
  getCart,
  getCategories,
  getMyOrder,
  getMyOrders,
  getMyProfile,
  getProducts,
  getToken,
  getStoredUser,
  isLoggedIn,
  loginUser,
  removeCartItem,
  setDefaultAddress,
  updateAddress,
  updateCartItem,
  placeOrder as placeOrderApi,
} from "./api";

// =========================================================
// FALLBACK CATEGORIES
// Backend categories available नसतील तर UI blank होऊ नये.
// =========================================================

const fallbackCategories = [
  {
    id: "all",
    name: "All",
    icon: "🛍️",
  },
  {
    id: 1,
    name: "Food",
    icon: "🍛",
  },
  {
    id: 2,
    name: "Kitchen",
    icon: "🍳",
  },
  {
    id: 3,
    name: "Vegetables & Fruits",
    icon: "🥦",
  },
  {
    id: 4,
    name: "Kirana",
    icon: "🌾",
  },
  {
    id: 5,
    name: "Non Food",
    icon: "🧴",
  },
  {
    id: 6,
    name: "Dairy",
    icon: "🥛",
  },
  {
    id: 7,
    name: "Baby Care",
    icon: "🧸",
  },
  {
    id: 8,
    name: "Personal Care",
    icon: "🧼",
  },
  {
    id: 9,
    name: "Home Care",
    icon: "🏠",
  },
];

// =========================================================
// IMAGE HELPER
// =========================================================

function getProductImage(product) {

  const image =
    product?.imageUrl ||
    product?.productImage ||
    "";

  if (!image) {
    return "/icons.svg";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `http://localhost:8080${image}`;
  }

  return `http://localhost:8080/${image}`;
}

// =========================================================
// PRODUCT MAPPER
// =========================================================

function mapProduct(product) {

  const price =
    product?.discountPrice != null &&
    Number(product.discountPrice) > 0
      ? Number(product.discountPrice)
      : Number(product?.price || 0);

  return {
    id: product.id,
    name: product.name || "Product",
    quantity:
      product.unit ||
      "1 Unit",
    price,
    categoryId:
      product.categoryId,
    brand:
      product.brand || "",
    description:
      product.description || "",
    stock:
      product.stock ?? 0,
    isActive:
      product.isActive !== false,
    status:
      product.status || "ACTIVE",
    image:
      getProductImage(product),
    time:
      "15 MIN",
    raw:
      product,
  };
}

// =========================================================
// CATEGORY MAPPER
// =========================================================

function mapCategory(
  category,
  index
) {

  const icons = [
    "🍛",
    "🍳",
    "🥦",
    "🌾",
    "🧴",
    "🥛",
    "🧸",
    "🧼",
    "🏠",
  ];

  return {
    id: category?.id,
    name:
      category?.name ||
      category?.categoryName ||
      `Category ${index + 1}`,
    icon:
      category?.icon ||
      icons[index % icons.length],
  };
}

function App() {

  // =======================================================
  // PAGE
  // =======================================================

  const [activePage, setActivePage] =
    useState("home");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const [search, setSearch] =
    useState("");

  const [
    selectedOrderId,
    setSelectedOrderId,
  ] = useState(null);

  // =======================================================
  // AUTH
  // =======================================================

  const [
    authenticated,
    setAuthenticated,
  ] = useState(
    isLoggedIn()
  );

  const [
    customer,
    setCustomer,
  ] = useState(
    getStoredUser()
  );

  // =======================================================
  // PRODUCTS
  // =======================================================

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState(
    fallbackCategories
  );

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(true);

  const [
    productsError,
    setProductsError,
  ] = useState("");

  // =======================================================
  // CART
  // =======================================================

  const [cart, setCart] =
    useState([]);

  const [
    cartTotal,
    setCartTotal,
  ] = useState(0);

  const [
    cartCount,
    setCartCount,
  ] = useState(0);

  // =======================================================
  // ADDRESSES
  // =======================================================

  const [
    addresses,
    setAddresses,
  ] = useState([]);

  // =======================================================
  // ORDERS
  // =======================================================

  const [orders, setOrders] =
    useState([]);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false);

  const [
    ordersError,
    setOrdersError,
  ] = useState("");

  // =======================================================
  // CUSTOMER LOCATION
  // =======================================================

  const [
    customerLocation,
    setCustomerLocation,
  ] = useState(null);

  const [
    locationStatus,
    setLocationStatus,
  ] = useState("idle");

  const [
    locationError,
    setLocationError,
  ] = useState("");

  // =======================================================
  // WISHLIST - LOCAL ONLY
  // Backend मध्ये wishlist API नाही.
  // =======================================================

  const [
    wishlist,
    setWishlist,
  ] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "maxigo_wishlist"
        );

      return saved
        ? JSON.parse(saved)
        : [];

    } catch {
      return [];
    }
  });

  useEffect(() => {

    localStorage.setItem(
      "maxigo_wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);

  // =======================================================
  // LOAD PUBLIC DATA
  // =======================================================

  useEffect(() => {

    loadPublicData();

  }, []);

  const loadPublicData =
    async () => {

      setProductsLoading(true);
      setProductsError("");

      try {

        const [
          productData,
          categoryData,
        ] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const mappedProducts =
          Array.isArray(productData)
            ? productData
                .filter(
                  (item) =>
                    item?.isActive !== false &&
                    (
                      !item?.status ||
                      item.status
                        .toUpperCase() ===
                        "ACTIVE"
                    )
                )
                .map(mapProduct)
            : [];

        setProducts(
          mappedProducts
        );

        if (
          Array.isArray(categoryData) &&
          categoryData.length > 0
        ) {

          setCategories([
            {
              id: "all",
              name: "All",
              icon: "🛍️",
            },
            ...categoryData.map(
              mapCategory
            ),
          ]);

        }

      } catch (error) {

        console.error(
          "Public data load failed:",
          error
        );

        setProductsError(
          error.message ||
          "Unable to load products."
        );

      } finally {

        setProductsLoading(false);
      }
    };

  // =======================================================
  // LOAD CUSTOMER DATA
  // =======================================================

  useEffect(() => {

    if (!authenticated) {
      return;
    }

    loadCustomerData();

  }, [authenticated]);

  const loadCustomerData =
    async () => {

      try {

        const [
          profileData,
          addressData,
          cartData,
        ] = await Promise.all([
          getMyProfile(),
          getAddresses(),
          getCart(),
        ]);

        setCustomer({
          ...(getStoredUser() || {}),
          ...profileData,
        });

        setAddresses(
          Array.isArray(addressData)
            ? addressData
            : []
        );

        applyCartResponse(
          cartData
        );

      } catch (error) {

        console.error(
          "Customer data load failed:",
          error
        );

        if (
          error.message
            ?.toLowerCase()
            .includes("jwt")
        ) {

          handleLogout();
        }
      }
    };

  // =======================================================
  // CART MAPPER
  // =======================================================

  const applyCartResponse =
    (cartData) => {

      const items =
        Array.isArray(
          cartData?.items
        )
          ? cartData.items
          : [];

      const mapped = items.map(
        (item) => {

          const quantity =
            Number(
              item.quantity || 0
            );

          const unitPrice =
            Number(
              item.unitPrice || 0
            );

          return {
            id:
              item.productId,
            cartItemId:
              item.cartItemId,
            name:
              item.productName ||
              "Product",
            quantity:
              "1 Unit",
            price:
              unitPrice,
            image:
              getProductImage({
                imageUrl:
                  item.productImage,
              }),
            quantityInCart:
              quantity,
            subTotal:
              Number(
                item.subTotal || 0
              ),
          };
        }
      );

      setCart(mapped);

      setCartTotal(
        Number(
          cartData?.totalAmount || 0
        )
      );

      setCartCount(
        Number(
          cartData?.totalItems ||
          mapped.reduce(
            (sum, item) =>
              sum +
              item.quantityInCart,
            0
          )
        )
      );
    };

  // =======================================================
  // CATEGORY
  // =======================================================

  const handleCategoryClick =
    (categoryId) => {

      setSelectedCategory(
        categoryId
      );

      setSearch("");

      setActivePage("home");
    };

  // =======================================================
  // SEARCH + FILTER
  // =======================================================

  const filteredProducts =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {

          const categoryMatch =
            selectedCategory ===
              "all" ||
            String(
              product.categoryId
            ) ===
              String(
                selectedCategory
              );

          if (!categoryMatch) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          return (
            product.name
              .toLowerCase()
              .includes(keyword) ||
            product.brand
              .toLowerCase()
              .includes(keyword) ||
            product.description
              .toLowerCase()
              .includes(keyword)
          );
        }
      );

    }, [
      products,
      search,
      selectedCategory,
    ]);

  // =======================================================
  // AUTH CHECK
  // =======================================================

  const requireLogin =
    () => {

      if (!getToken()) {

        alert(
          "Please login to continue."
        );

        setActivePage(
          "profile"
        );

        return false;
      }

      return true;
    };

  // =======================================================
  // ADD TO CART
  // =======================================================

  const addToCart =
    async (product) => {

      if (!requireLogin()) {
        return;
      }

      try {

        const response =
          await addCartItem(
            product.id,
            1
          );

        applyCartResponse(
          response
        );

      } catch (error) {

        alert(
          error.message ||
          "Unable to add product to cart."
        );
      }
    };

  // =======================================================
  // INCREASE
  // =======================================================

  const increaseCart =
    async (item) => {

      try {

        const response =
          await updateCartItem(
            item.cartItemId,
            item.quantityInCart + 1
          );

        applyCartResponse(
          response
        );

      } catch (error) {

        alert(
          error.message ||
          "Unable to update cart."
        );
      }
    };

  // =======================================================
  // DECREASE
  // =======================================================

  const decreaseCart =
    async (item) => {

      try {

        if (
          item.quantityInCart <= 1
        ) {

          await removeCartItem(
            item.cartItemId
          );

          const response =
            await getCart();

          applyCartResponse(
            response
          );

          return;
        }

        const response =
          await updateCartItem(
            item.cartItemId,
            item.quantityInCart - 1
          );

        applyCartResponse(
          response
        );

      } catch (error) {

        alert(
          error.message ||
          "Unable to update cart."
        );
      }
    };

  // =======================================================
  // LOCATION
  // =======================================================

  const getCustomerLiveLocation =
    () => {

      if (!requireLogin()) {
        return;
      }

      if (
        !navigator.geolocation
      ) {

        setLocationStatus(
          "error"
        );

        setLocationError(
          "Live location is not supported by this browser."
        );

        setActivePage(
          "location"
        );

        return;
      }

      setLocationStatus(
        "loading"
      );

      setLocationError("");

      setActivePage(
        "location"
      );

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const location = {
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
            accuracy:
              Math.round(
                position.coords.accuracy
              ),
            capturedAt:
              new Date().toLocaleString(),
            mapsUrl:
              `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
          };

          setCustomerLocation(
            location
          );

          setLocationStatus(
            "success"
          );
        },

        (error) => {

          let message =
            "Unable to get your location.";

          if (error.code === 1) {

            message =
              "Location permission was denied. Please allow location access.";

          } else if (error.code === 2) {

            message =
              "Your location is currently unavailable.";

          } else if (error.code === 3) {

            message =
              "Location request timed out.";
          }

          setLocationError(
            message
          );

          setLocationStatus(
            "error"
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

  // =======================================================
  // CHECKOUT
  // =======================================================

  const proceedToCheckout =
    () => {

      if (cart.length === 0) {
        alert(
          "Your cart is empty."
        );
        return;
      }

      if (!requireLogin()) {
        return;
      }

      if (addresses.length === 0) {

        alert(
          "Please add a delivery address first."
        );

        setActivePage(
          "profile"
        );

        return;
      }

      getCustomerLiveLocation();
    };

  // =======================================================
  // PLACE ORDER
  // =======================================================

  const handlePlaceOrder =
    async ({
      deliveryAddressId,
      paymentMethod,
      customerNote,
    }) => {

      if (!requireLogin()) {
        return;
      }

      if (!deliveryAddressId) {

        alert(
          "Please select a delivery address."
        );

        return;
      }

      try {

        // -------------------------------------------------
        // Save live location into selected address
        // -------------------------------------------------

        if (customerLocation) {

          await updateAddress(
            deliveryAddressId,
            {
              latitude:
                customerLocation.latitude,
              longitude:
                customerLocation.longitude,
            }
          );
        }

        // -------------------------------------------------
        // PLACE ORDER
        // -------------------------------------------------

        const response =
          await placeOrderApi({
            deliveryAddressId:
              Number(
                deliveryAddressId
              ),
            paymentMethod:
              paymentMethod,
            customerNote:
              customerNote ||
              "",
          });

        // -------------------------------------------------
        // Refresh cart
        // -------------------------------------------------

        const newCart =
          await getCart();

        applyCartResponse(
          newCart
        );

        // -------------------------------------------------
        // Refresh addresses
        // -------------------------------------------------

        const newAddresses =
          await getAddresses();

        setAddresses(
          Array.isArray(
            newAddresses
          )
            ? newAddresses
            : []
        );

        // -------------------------------------------------
        // Refresh orders
        // -------------------------------------------------

        await loadOrders();

        setSelectedOrderId(
          response?.id
        );

        setCustomerLocation(
          null
        );

        setLocationStatus(
          "idle"
        );

        setActivePage(
          "orders"
        );

        alert(
          `Order placed successfully! Order #${response?.id}`
        );

      } catch (error) {

        alert(
          error.message ||
          "Unable to place order."
        );
      }
    };

  // =======================================================
  // LOAD ORDERS
  // =======================================================

  const loadOrders =
    async () => {

      if (!getToken()) {
        return;
      }

      setOrdersLoading(true);
      setOrdersError("");

      try {

        const response =
          await getMyOrders();

        setOrders(
          Array.isArray(response)
            ? response
            : []
        );

      } catch (error) {

        setOrdersError(
          error.message ||
          "Unable to load orders."
        );

      } finally {

        setOrdersLoading(
          false
        );
      }
    };

  // =======================================================
  // ORDERS PAGE
  // =======================================================

  useEffect(() => {

    if (
      activePage === "orders" &&
      authenticated
    ) {

      loadOrders();
    }

  }, [
    activePage,
    authenticated,
  ]);

  // =======================================================
  // CANCEL ORDER
  // =======================================================

  const handleCancelOrder =
    async (orderId) => {

      try {

        const response =
          await cancelMyOrder(
            orderId
          );

        setOrders(
          (current) =>
            current.map(
              (order) =>
                order.id === orderId
                  ? response
                  : order
            )
        );

        alert(
          "Order cancelled successfully."
        );

      } catch (error) {

        alert(
          error.message ||
          "Unable to cancel order."
        );
      }
    };

  // =======================================================
  // AUTH CHANGE
  // =======================================================

  const handleAuthChanged =
    async (authData) => {

      if (!authData) {

        clearAuth();

        setAuthenticated(
          false
        );

        setCustomer(null);

        setAddresses([]);

        setCart([]);

        setCartTotal(0);

        setCartCount(0);

        setOrders([]);

        setActivePage("home");

        return;
      }

      setAuthenticated(
        true
      );

      setCustomer(
        authData
      );

      await loadCustomerData();
    };

  // =======================================================
  // WISHLIST
  // =======================================================

  const toggleWishlist =
    (product) => {

      setWishlist(
        (current) => {

          const exists =
            current.some(
              (item) =>
                item.id === product.id
            );

          if (exists) {

            return current.filter(
              (item) =>
                item.id !==
                product.id
            );
          }

          return [
            ...current,
            product,
          ];
        }
      );
    };

  // =======================================================
  // LOCATION PAGE
  // =======================================================

  const LocationPage =
    () => (

      <div className="inner-page customer-location-page">

        <div className="page-header">

          <div>
            <h2>
              Delivery Location
            </h2>

            <p>
              Your current location
              is required before checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setActivePage(
                "cart"
              )
            }
          >
            ✕
          </button>

        </div>

        {locationStatus ===
          "loading" && (

          <div className="location-card">

            <div className="location-loader">
              📍
            </div>

            <h3>
              Getting your live location...
            </h3>

            <p>
              Please allow location permission.
            </p>

          </div>
        )}

        {locationStatus ===
          "error" && (

          <div className="location-card location-error-card">

            <div className="location-loader">
              ⚠️
            </div>

            <h3>
              Location required
            </h3>

            <p>
              {locationError}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                getCustomerLiveLocation
              }
            >
              Try Again
            </button>

          </div>
        )}

        {locationStatus ===
          "success" &&
          customerLocation && (

          <div className="location-card">

            <div className="location-success-icon">
              📍
            </div>

            <h3>
              Live location captured
            </h3>

            <p>
              Your current delivery
              location has been captured.
            </p>

            <div className="customer-map">

              <iframe
                title="Customer location"
                src={
                  `https://www.google.com/maps?q=${customerLocation.latitude},${customerLocation.longitude}&z=17&output=embed`
                }
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

            </div>

            <div className="location-details">

              <div>
                <span>
                  Latitude
                </span>

                <strong>
                  {
                    customerLocation
                      .latitude
                      .toFixed(6)
                  }
                </strong>
              </div>

              <div>
                <span>
                  Longitude
                </span>

                <strong>
                  {
                    customerLocation
                      .longitude
                      .toFixed(6)
                  }
                </strong>
              </div>

              <div>
                <span>
                  Accuracy
                </span>

                <strong>
                  ±
                  {
                    customerLocation
                      .accuracy
                  }{" "}
                  m
                </strong>
              </div>

            </div>

            <div className="location-actions">

              <a
                href={
                  customerLocation.mapsUrl
                }
                target="_blank"
                rel="noreferrer"
                className="location-map-button"
              >
                Open in Google Maps
              </a>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setActivePage(
                    "payment"
                  )
                }
              >
                Continue to Payment →
              </button>

            </div>

            <small className="location-time">
              Captured:{" "}
              {
                customerLocation.capturedAt
              }
            </small>

          </div>
        )}

      </div>
    );

  // =======================================================
  // HOME PAGE
  // =======================================================

  const HomePage =
    () => (

      <>

        <header className="header">

          <div className="top-header">

            <div className="logo-section">

              <img
                src="/maxigo-customer-logo.png"
                alt="MaxiGo"
                className="maxigo-customer-logo"
              />

            </div>

            <div className="location">

              <img
                src="/location.png"
                alt="Location"
                className="location-image"
              />

              <div>

                <small>
                  Delivery to
                </small>

                <b>
                  {
                    addresses.find(
                      (address) =>
                        address.isDefault
                    )?.city ||
                    addresses[0]?.city ||
                    customer?.city ||
                    "Your Location"
                  }
                  ⌄
                </b>

              </div>

            </div>

            <button
              className="desktop-cart"
              type="button"
              onClick={() =>
                setActivePage(
                  "cart"
                )
              }
            >

              🛒

              {cartCount > 0 && (

                <span className="cart-count">
                  {cartCount}
                </span>

              )}

            </button>

          </div>

          <Search
            value={search}
            onChange={
              setSearch
            }
            onClear={() =>
              setSearch("")
            }
          />

        </header>

        <Categories
          categories={
            categories
          }
          selectedCategory={
            selectedCategory
          }
          onCategoryClick={
            handleCategoryClick
          }
          onSeeAll={() =>
            setActivePage(
              "categories"
            )
          }
        />

        <section className="banner">

          <div className="banner-content">

            <p className="banner-small">
              MAXIGO SPECIAL
            </p>

            <h2>
              Fresh Essentials
              <br />
              Delivered in{" "}
              <span>
                Minutes!
              </span>
            </h2>

            <p>
              Fruits, Vegetables,
              Groceries & More
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(
                  "all"
                );
                setSearch("");
              }}
            >
              Shop Now →
            </button>

          </div>

          <div className="offer">

            <small>
              UP TO
            </small>

            <strong>
              50%
            </strong>

            <small>
              OFF
            </small>

          </div>

        </section>

        <section className="products-section">

          <div className="section-title">

            <h2>

              {
                selectedCategory ===
                "all"

                  ? search
                    ? "Search Results"
                    : "Top Picks for You"

                  : categories.find(
                      (category) =>
                        String(
                          category.id
                        ) ===
                        String(
                          selectedCategory
                        )
                    )?.name ||
                    "Products"
              }

            </h2>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(
                  "all"
                );
                setSearch("");
              }}
            >
              See All →
            </button>

          </div>

          {productsLoading ? (

            <div className="no-products">

              <div>
                ⏳
              </div>

              <h3>
                Loading products...
              </h3>

            </div>

          ) : productsError ? (

            <div className="no-products">

              <div>
                ⚠️
              </div>

              <h3>
                Unable to load products
              </h3>

              <p>
                {productsError}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={
                  loadPublicData
                }
              >
                Retry
              </button>

            </div>

          ) : filteredProducts.length ===
            0 ? (

            <div className="no-products">

              <div>
                🔍
              </div>

              <h3>
                No products found
              </h3>

              <p>
                Try another product
                or category.
              </p>

            </div>

          ) : (

            <div className="products-grid">

              {filteredProducts.map(
                (product) => {

                  const isWishlisted =
                    wishlist.some(
                      (item) =>
                        item.id ===
                        product.id
                    );

                  return (

                    <div
                      className="product-card"
                      key={
                        product.id
                      }
                    >

                      <button
                        type="button"
                        className="heart"
                        onClick={() =>
                          toggleWishlist(
                            product
                          )
                        }
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {
                          isWishlisted
                            ? "♥"
                            : "♡"
                        }
                      </button>

                      <div className="product-image">

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />

                      </div>

                      <div className="product-info">

                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        <p>
                          {
                            product.quantity
                          }
                        </p>

                        <div className="price-row">

                          <strong>
                            ₹
                            {
                              product.price
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                          >
                            ADD
                          </button>

                        </div>

                        <div className="delivery-time">
                          ⚡{" "}
                          {
                            product.time
                          }
                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        <section className="shop-category">

          <div className="section-title">

            <h2>
              Shop by Category
            </h2>

            <button
              type="button"
              onClick={() =>
                setActivePage(
                  "categories"
                )
              }
            >
              See All →
            </button>

          </div>

          <div className="shop-category-grid">

            {categories
              .slice(1, 7)
              .map(
                (category) => (

                  <button
                    key={
                      category.id
                    }
                    className="shop-category-card"
                    type="button"
                    onClick={() =>
                      handleCategoryClick(
                        category.id
                      )
                    }
                  >

                    <div>
                      {
                        category.icon
                      }
                    </div>

                    <span>
                      {
                        category.name
                      }
                    </span>

                  </button>

                )
              )}

          </div>

        </section>

      </>
    );

  // =======================================================
  // CATEGORY PAGE
  // =======================================================

  const CategoryPage =
    () => (

      <div className="inner-page">

        <div className="page-header">

          <h2>
            All Categories
          </h2>

          <button
            type="button"
            onClick={() =>
              setActivePage(
                "home"
              )
            }
          >
            ✕
          </button>

        </div>

        <div className="all-category-grid">

          {categories
            .filter(
              (category) =>
                category.id !==
                "all"
            )
            .map(
              (category) => (

                <button
                  key={
                    category.id
                  }
                  className="big-category-card"
                  type="button"
                  onClick={() =>
                    handleCategoryClick(
                      category.id
                    )
                  }
                >

                  <div className="big-category-icon">
                    {
                      category.icon
                    }
                  </div>

                  <span>
                    {
                      category.name
                    }
                  </span>

                </button>

              )
            )}

        </div>

      </div>
    );

  // =======================================================
  // CART PAGE
  // =======================================================

  const CartPage =
    () => (

      <div className="inner-page">

        <div className="page-header">

          <h2>
            My Cart
          </h2>

          <button
            type="button"
            onClick={() =>
              setActivePage(
                "home"
              )
            }
          >
            ✕
          </button>

        </div>

        {cart.length === 0 ? (

          <div className="empty-page">

            <div>
              🛒
            </div>

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add some products to
              continue.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                setActivePage(
                  "home"
                )
              }
            >
              Start Shopping
            </button>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map(
                (item) => (

                  <div
                    className="cart-item"
                    key={
                      item.cartItemId
                    }
                  >

                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                    />

                    <div className="cart-item-info">

                      <h3>
                        {
                          item.name
                        }
                      </h3>

                      <p>
                        {
                          item.quantity
                        }
                      </p>

                      <strong>
                        ₹
                        {
                          item.price
                        }
                      </strong>

                    </div>

                    <div className="quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseCart(
                            item
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {
                          item.quantityInCart
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseCart(
                            item
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

            <div className="cart-summary">

              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {
                    cartTotal.toFixed(
                      2
                    )
                  }
                </strong>

              </div>

              <div>

                <span>
                  Delivery
                </span>

                <strong>
                  FREE
                </strong>

              </div>

              <hr />

              <div className="grand-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {
                    cartTotal.toFixed(
                      2
                    )
                  }
                </strong>

              </div>

              <button
                className="checkout-button"
                type="button"
                onClick={
                  proceedToCheckout
                }
              >
                Proceed to Checkout
              </button>

            </div>

          </>
        )}

      </div>
    );

  // =======================================================
  // MAIN APP
  // =======================================================

  return (

    <div className="app">

      {activePage ===
        "home" && (
        <HomePage />
      )}

      {activePage ===
        "categories" && (
        <CategoryPage />
      )}

      {activePage ===
        "cart" && (
        <CartPage />
      )}

      {activePage ===
        "location" && (
        <LocationPage />
      )}

      {activePage ===
        "payment" && (

        <PaymentMethods
          setActivePage={
            setActivePage
          }
          addresses={
            addresses
          }
          customerLocation={
            customerLocation
          }
          cartTotal={
            cartTotal
          }
          onPlaceOrder={
            handlePlaceOrder
          }
        />

      )}

      {activePage ===
        "orders" && (

        <Orders
          orders={
            orders
          }
          loading={
            ordersLoading
          }
          error={
            ordersError
          }
          selectedOrderId={
            selectedOrderId
          }
          onBack={() =>
            setActivePage(
              "home"
            )
          }
          onHome={() =>
            setActivePage(
              "home"
            )
          }
          onTrack={(orderId) => {

            setSelectedOrderId(
              orderId
            );

            setActivePage(
              "track"
            );
          }}
          onCancel={
            handleCancelOrder
          }
        />

      )}

      {activePage ===
        "track" && (

        <TrackOrder
          orderId={
            selectedOrderId
          }
          onBack={() =>
            setActivePage(
              "orders"
            )
          }
        />

      )}

      {activePage ===
        "referral" && (

        <Referral
          setActivePage={
            setActivePage
          }
        />

      )}

      {activePage ===
        "wallet" && (

        <Wallet
          setActivePage={
            setActivePage
          }
        />

      )}

      {activePage ===
        "profile" && (

        <Profile
          setActivePage={
            setActivePage
          }
          authenticated={
            authenticated
          }
          customer={
            customer
          }
          addresses={
            addresses
          }
          setAddresses={
            setAddresses
          }
          wishlist={
            wishlist
          }
          toggleWishlist={
            toggleWishlist
          }
          addToCart={
            addToCart
          }
          onAuthChanged={
            handleAuthChanged
          }
        />

      )}

      <nav className="bottom-nav">

        <button
          type="button"
          className={
            activePage ===
            "home"
              ? "bottom-active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "home"
            )
          }
        >

          <span>
            ⌂
          </span>

          Home

        </button>

        <button
          type="button"
          onClick={() => {

            setActivePage(
              "home"
            );

            setTimeout(() => {

              document
                .querySelector(
                  ".customer-search-box input"
                )
                ?.focus();

            }, 100);

          }}
        >

          <span>
            ⌕
          </span>

          Search

        </button>

        <button
          type="button"
          className={
            activePage ===
            "categories"
              ? "bottom-active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "categories"
            )
          }
        >

          <span>
            ▦
          </span>

          Categories

        </button>

        <button
          type="button"
          className={
            activePage ===
            "orders" ||
            activePage ===
            "track"
              ? "bottom-active"
              : ""
          }
          onClick={() => {

            if (
              !requireLogin()
            ) {
              return;
            }

            setActivePage(
              "orders"
            );

          }}
        >

          <span>
            ▤
          </span>

          Orders

        </button>

        <button
          type="button"
          className={
            activePage ===
            "profile"
              ? "bottom-active"
              : ""
          }
          onClick={() =>
            setActivePage(
              "profile"
            )
          }
        >

          <span>
            ♙
          </span>

          Profile

        </button>

      </nav>

    </div>
  );
}

export default App;