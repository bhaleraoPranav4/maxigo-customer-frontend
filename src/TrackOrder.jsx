import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./TrackOrder.css";

import {
  getOrderTracking,
} from "./api";

// =========================================================
// STATUS STEP
// =========================================================

const statusSteps = [
  {
    key: "PLACED",
    title: "Order Placed",
    subtitle:
      "Customer placed the order",
  },
  {
    key: "STORE",
    title: "Store Processing",
    subtitle:
      "Store accepted and prepares your order",
  },
  {
    key: "RIDER",
    title: "Rider Assigned",
    subtitle:
      "Rider has accepted the delivery",
  },
  {
    key: "OUT_FOR_DELIVERY",
    title: "On the Way",
    subtitle:
      "Rider is moving towards you",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    subtitle:
      "Order delivered successfully",
  },
];

// =========================================================
// STEP INDEX
// =========================================================

function getStepIndex(
  status
) {

  switch (
    status
  ) {

    case "DELIVERED":
      return 5;

    case "OUT_FOR_DELIVERY":
      return 4;

    case "PICKED_UP":
      return 4;

    case "RIDER_ASSIGNED":
      return 3;

    case "ASSIGNED":
      return 3;

    case "READY_FOR_PICKUP":
      return 2;

    case "PREPARING":
      return 2;

    case "ACCEPTED":
      return 2;

    case "PLACED":
    default:
      return 1;
  }
}

function TrackOrder({
  orderId,
  onBack,
}) {

  const [
    tracking,
    setTracking,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // =======================================================
  // LOAD TRACKING
  // =======================================================

  useEffect(() => {

    if (!orderId) {
      return;
    }

    let timer;

    const loadTracking =
      async () => {

        try {

          const data =
            await getOrderTracking(
              orderId
            );

          setTracking(
            data
          );

          setError("");

        } catch (err) {

          console.error(
            "Tracking load failed:",
            err
          );

          setError(
            err.message ||
            "Unable to load tracking."
          );

        } finally {

          setLoading(
            false
          );
        }
      };

    setLoading(true);

    loadTracking();

    timer =
      setInterval(
        loadTracking,
        5000
      );

    return () =>
      clearInterval(
        timer
      );

  }, [
    orderId,
  ]);

  // =======================================================
  // LOCATION
  // =======================================================

  const rider =
    tracking?.riderLocation;

  const riderReady =
    rider?.latitude != null &&
    rider?.longitude != null;

  const customerReady =
    tracking?.customerLatitude !=
      null &&
    tracking?.customerLongitude !=
      null;

  const mapUrl =
    riderReady

      ? `https://www.google.com/maps?q=${rider.latitude},${rider.longitude}&z=16&output=embed`

      : customerReady

      ? `https://www.google.com/maps?q=${tracking.customerLatitude},${tracking.customerLongitude}&z=16&output=embed`

      : "";

  // =======================================================
  // STEP INDEX
  // =======================================================

  const currentStep =
    useMemo(
      () =>
        getStepIndex(
          tracking?.status
        ),
      [
        tracking?.status,
      ]
    );

  // =======================================================
  // STATUS MESSAGE
  // =======================================================

  const statusMessage =
    (() => {

      switch (
        tracking?.status
      ) {

        case "PLACED":
          return "Order placed successfully.";

        case "ACCEPTED":
          return "Store accepted your order.";

        case "PREPARING":
          return "Store is preparing your order.";

        case "READY_FOR_PICKUP":
          return "Your order is ready for pickup.";

        case "RIDER_ASSIGNED":
          return "Rider has been assigned.";

        case "PICKED_UP":
          return "Rider has picked up your order.";

        case "OUT_FOR_DELIVERY":
          return "Rider is on the way to you.";

        case "DELIVERED":
          return "Order delivered successfully.";

        case "CANCELLED":
          return "This order was cancelled.";

        default:
          return "Order status is updating.";
      }

    })();

  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="track-order-page">

      <div className="track-header">

        <button
          type="button"
          onClick={
            onBack
          }
        >
          ←
        </button>

        <div>

          <h2>
            Track Your Order
          </h2>

          <p>
            Order #
            {
              orderId
            }
          </p>

        </div>

      </div>

      {loading && (

        <div className="track-loading">
          Loading live tracking...
        </div>
      )}

      {!loading &&
        error && (

          <div className="track-error">
            {error}
          </div>
        )}

      {tracking && (

        <>

          <div className="track-status-card">

            <div className="track-status-icon">

              {
                tracking.status ===
                "DELIVERED"
                  ? "✅"
                  : tracking.status ===
                    "CANCELLED"
                  ? "❌"
                  : "🛵"
              }

            </div>

            <div>

              <span>
                Current Status
              </span>

              <h3>

                {
                  (
                    tracking.status ||
                    "PLACED"
                  )
                    .replaceAll(
                      "_",
                      " "
                    )
                }

              </h3>

              <p>
                {
                  statusMessage
                }
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* RIDER CARD */}
          {/* ================================================= */}

          {tracking.riderName && (

            <div className="rider-info-box">

              <div className="rider-avatar">
                🛵
              </div>

              <div className="rider-info-text">

                <small>
                  RIDER
                </small>

                <strong>
                  {
                    tracking.riderName
                  }
                </strong>

                <span>
                  {
                    tracking.riderCode ||
                    "MaxiGo Rider"
                  }
                </span>

              </div>

              {tracking.riderMobile && (

                <a
                  href={`tel:${tracking.riderMobile}`}
                  style={{
                    textDecoration:
                      "none",
                    fontSize:
                      "24px",
                  }}
                  aria-label="Call rider"
                >
                  📞
                </a>

              )}

            </div>
          )}

          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          <div className="track-map-card">

            {mapUrl ? (

              <iframe
                title="MaxiGo live rider location"
                src={mapUrl}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

            ) : (

              <div className="map-waiting">

                <div>
                  🛵
                </div>

                <h3>
                  Waiting for rider location
                </h3>

                <p>
                  The map will show the rider
                  after GPS location is available.
                </p>

              </div>

            )}

            {riderReady && (

              <div className="rider-live-badge">
                🟢 Rider location updating
              </div>

            )}

          </div>

          {/* ================================================= */}
          {/* ROUTE */}
          {/* ================================================= */}

          <div className="track-route">

            {statusSteps.map(
              (step, index) => {

                const stepNumber =
                  index + 1;

                const done =
                  currentStep >=
                  stepNumber;

                const active =
                  currentStep ===
                  stepNumber;

                return (

                  <div
                    key={
                      step.key
                    }
                    className={`route-step ${
                      done
                        ? "done"
                        : ""
                    } ${
                      active
                        ? "active"
                        : ""
                    }`}
                  >

                    <b>
                      {
                        stepNumber
                      }
                    </b>

                    <div>

                      <strong>
                        {
                          step.title
                        }
                      </strong>

                      <span>
                        {
                          step.subtitle
                        }
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* ================================================= */}
          {/* DELIVERY ADDRESS */}
          {/* ================================================= */}

          <div
            style={{
              marginTop:
                "18px",
              padding:
                "16px",
              borderRadius:
                "12px",
              border:
                "1px solid #ddd",
            }}
          >

            <strong>
              Delivery Address
            </strong>

            <p
              style={{
                marginBottom:
                  "0",
              }}
            >
              {
                tracking.deliveryAddress ||
                "Address details unavailable"
              }

              {tracking.deliveryCity && (
                <>
                  ,{" "}
                  {
                    tracking.deliveryCity
                  }
                </>
              )}

              {tracking.deliveryPincode && (
                <>
                  -{" "}
                  {
                    tracking.deliveryPincode
                  }
                </>
              )}

            </p>

          </div>

        </>
      )}

    </div>
  );
}

export default TrackOrder;