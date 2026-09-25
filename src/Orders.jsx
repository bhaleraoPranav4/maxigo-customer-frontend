import "./Orders.css";

function formatMoney(value) {
  return Number(
    value || 0
  ).toFixed(2);
}

function formatDate(value) {

  if (!value) {
    return "Date not available";
  }

  try {

    return new Date(
      value
    ).toLocaleString();

  } catch {

    return value;
  }
}

function getStatusClass(
  status
) {

  if (
    status ===
    "DELIVERED"
  ) {
    return "status-delivered";
  }

  if (
    status ===
    "CANCELLED"
  ) {
    return "status-cancelled";
  }

  return "status-delivery";
}

function Orders({
  orders = [],
  loading = false,
  error = "",
  selectedOrderId,
  onBack,
  onHome,
  onTrack,
  onCancel,
}) {

  return (

    <div className="orders-page">

      <div className="orders-header">

        <button
          type="button"
          className="orders-back-btn"
          onClick={
            onBack
          }
        >
          ←
        </button>

        <div>

          <h2>
            My Orders
          </h2>

          <p>
            Track and manage your orders
          </p>

        </div>

      </div>

      {loading && (

        <div className="empty-page">

          <div>
            ⏳
          </div>

          <h3>
            Loading your orders...
          </h3>

        </div>
      )}

      {!loading &&
        error && (

          <div className="no-products">

            <div>
              ⚠️
            </div>

            <h3>
              Unable to load orders
            </h3>

            <p>
              {error}
            </p>

          </div>
        )}

      {!loading &&
        !error &&
        orders.length === 0 && (

          <div className="empty-page">

            <div>
              📦
            </div>

            <h3>
              No orders yet
            </h3>

            <p>
              Your placed orders will appear here.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                onHome
              }
            >
              Start Shopping
            </button>

          </div>
        )}

      {!loading &&
        !error &&
        orders.map(
          (order) => {

            const canCancel =
              [
                "PLACED",
                "ACCEPTED",
              ].includes(
                order.orderStatus
              );

            const items =
              Array.isArray(
                order.items
              )
                ? order.items
                : [];

            const itemText =
              items.length > 0
                ? items
                    .map(
                      (item) =>
                        `${item.productName} × ${item.quantity}`
                    )
                    .join(", ")
                : "No items";

            return (

              <div
                className="order-card"
                key={
                  order.id
                }
                style={
                  selectedOrderId ===
                  order.id
                    ? {
                        outline:
                          "2px solid currentColor",
                      }
                    : undefined
                }
              >

                <div className="order-card-top">

                  <div>

                    <span className="order-label">
                      ORDER ID
                    </span>

                    <h3>
                      #
                      {
                        order.id
                      }
                    </h3>

                    <small>
                      {
                        order.orderNumber
                      }
                    </small>

                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {
                      (
                        order.orderStatus ||
                        "PLACED"
                      )
                        .replaceAll(
                          "_",
                          " "
                        )
                    }
                  </span>

                </div>

                <div className="order-divider" />

                <div className="order-store-row">

                  <div className="order-store-icon">
                    🏪
                  </div>

                  <div>

                    <strong>
                      Store #
                      {
                        order.storeId
                      }
                    </strong>

                    <p>
                      {
                        itemText
                      }
                    </p>

                  </div>

                  <strong className="order-amount">

                    ₹
                    {
                      formatMoney(
                        order.totalAmount
                      )
                    }

                  </strong>

                </div>

                <div className="order-route-preview">

                  <div className="route-preview-item">

                    <span className="route-preview-dot pickup-dot">
                      P
                    </span>

                    <div>

                      <small>
                        Store
                      </small>

                      <p>
                        Store #
                        {
                          order.storeId
                        }
                      </p>

                    </div>

                  </div>

                  <div className="route-preview-line" />

                  <div className="route-preview-item">

                    <span className="route-preview-dot delivery-dot">
                      D
                    </span>

                    <div>

                      <small>
                        Delivery
                      </small>

                      <p>
                        Address #
                        {
                          order.deliveryAddressId
                        }
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rider-info-box">

                  <div className="rider-avatar">
                    🛵
                  </div>

                  <div className="rider-info-text">

                    <small>
                      STATUS
                    </small>

                    <strong>
                      {
                        order.orderStatus ||
                        "PLACED"
                      }
                    </strong>

                    <span>
                      {
                        order.paymentMethod ||
                        "Payment"
                      }
                    </span>

                  </div>

                  <span className="live-dot">

                    <i />
                    LIVE

                  </span>

                </div>

                <div
                  style={{
                    marginTop:
                      "8px",
                    marginBottom:
                      "12px",
                    fontSize:
                      "13px",
                    opacity:
                      "0.75",
                  }}
                >
                  Placed:{" "}
                  {
                    formatDate(
                      order.placedAt
                    )
                  }
                </div>

                {order.orderStatus !==
                  "CANCELLED" && (

                  <button
                    type="button"
                    className="track-order-btn"
                    onClick={() =>
                      onTrack?.(
                        order.id
                      )
                    }
                  >
                    🛵 Track Order
                    <span>
                      →
                    </span>
                  </button>
                )}

                {canCancel && (

                  <button
                    type="button"
                    onClick={() =>
                      onCancel?.(
                        order.id
                      )
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "10px",
                      padding:
                        "12px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #ccc",
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                    }}
                  >
                    Cancel Order
                  </button>

                )}

              </div>
            );
          }
        )}

      <div className="orders-shop-more">

        <button
          type="button"
          className="orders-shop-btn"
          onClick={
            onHome
          }
        >
          Continue Shopping
        </button>

      </div>

    </div>
  );
}

export default Orders;