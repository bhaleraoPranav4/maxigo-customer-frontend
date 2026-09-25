import {
  useEffect,
  useState,
} from "react";

import "./PaymentMethods.css";

import {
  getCustomerDeliveryFee,
  getMyReferral,
  getReferralSettings,
  updateAddress,
} from "./api";

function PaymentMethods({
  setActivePage,
  addresses = [],
  cartTotal = 0,
  customerLocation = null,
  onPlaceOrder,
}) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState("");

  const [
    selectedMethod,
    setSelectedMethod,
  ] = useState("COD");

  const [
    customerNote,
    setCustomerNote,
  ] = useState("");

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [
    deliveryFee,
    setDeliveryFee,
  ] = useState(0);

  const [
    deliveryFeeLoading,
    setDeliveryFeeLoading,
  ] = useState(false);

  const [
    deliveryFeeError,
    setDeliveryFeeError,
  ] = useState("");

  // =========================================================
  // REFERRAL STATE
  // =========================================================

  const [
    referralSettings,
    setReferralSettings,
  ] = useState(null);

  const [
    referralData,
    setReferralData,
  ] = useState(null);

  const [
    referralLoading,
    setReferralLoading,
  ] = useState(false);

  // =========================================================
  // DEFAULT ADDRESS
  // =========================================================

  useEffect(() => {
    if (
      !selectedAddressId &&
      addresses.length > 0
    ) {
      const defaultAddress =
        addresses.find(
          (address) =>
            address.isDefault === true ||
            address.isDefault === "true"
        );

      setSelectedAddressId(
        String(
          defaultAddress?.id ||
            addresses[0]?.id ||
            ""
        )
      );
    }
  }, [
    addresses,
    selectedAddressId,
  ]);

  // =========================================================
  // LOAD DELIVERY FEE
  // IMPORTANT:
  // Do not update GPS here.
  // Latest GPS is saved only when Place Order is clicked.
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadDeliveryFee =
      async () => {
        if (!selectedAddressId) {
          setDeliveryFee(0);
          setDeliveryFeeError("");
          setDeliveryFeeLoading(false);
          return;
        }

        setDeliveryFeeLoading(true);
        setDeliveryFeeError("");

        try {
          const response =
            await getCustomerDeliveryFee(
              selectedAddressId
            );

          if (cancelled) {
            return;
          }

          const fee =
            typeof response === "number"
              ? response
              : Number(
                  response?.deliveryFee ??
                    response?.fee ??
                    response?.amount ??
                    0
                );

          if (!Number.isFinite(fee)) {
            throw new Error(
              "Invalid delivery charge received from server."
            );
          }

          setDeliveryFee(
            Math.max(30, fee)
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Delivery fee load failed:",
            error
          );

          setDeliveryFee(0);

          setDeliveryFeeError(
            error.message ||
              "Unable to calculate delivery charge."
          );
        } finally {
          if (!cancelled) {
            setDeliveryFeeLoading(false);
          }
        }
      };

    loadDeliveryFee();

    return () => {
      cancelled = true;
    };
  }, [selectedAddressId]);

  // =========================================================
  // LOAD REFERRAL DATA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadReferral =
      async () => {
        setReferralLoading(true);

        try {
          const [
            settings,
            referral,
          ] = await Promise.all([
            getReferralSettings(),
            getMyReferral(),
          ]);

          if (cancelled) {
            return;
          }

          setReferralSettings(
            settings || null
          );

          setReferralData(
            referral || null
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.warn(
            "Referral checkout data unavailable:",
            error
          );

          setReferralSettings(null);
          setReferralData(null);
        } finally {
          if (!cancelled) {
            setReferralLoading(false);
          }
        }
      };

    loadReferral();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // TOTALS
  // =========================================================

  const subtotal =
    Number(cartTotal) || 0;

  const safeDeliveryFee =
    Number(deliveryFee) || 0;

  // =========================================================
  // REFERRAL DISCOUNT
  //
  // Backend remains the final authority.
  // Frontend only displays the expected discount.
  // =========================================================

  const referralEnabled =
    referralSettings?.enabled === true ||
    referralSettings?.enabled === "true";

  const configuredDiscount =
    Number(
      referralSettings?.newUserDiscount ||
        0
    );

  const minimumOrderAmount =
    Number(
      referralSettings?.minimumOrderAmount ||
        0
    );

  const referralStatus =
    String(
      referralData?.status || ""
    ).toUpperCase();

  const referralEligibleStatus =
    referralStatus === "PENDING";

  const referralDiscount =
    referralEnabled &&
    referralEligibleStatus &&
    configuredDiscount > 0 &&
    subtotal >= minimumOrderAmount
      ? Math.min(
          configuredDiscount,
          subtotal
        )
      : 0;

  const totalBeforeDiscount =
    subtotal + safeDeliveryFee;

  const payableTotal =
    Math.max(
      0,
      totalBeforeDiscount -
        referralDiscount
    );

  // =========================================================
  // REFERRAL MESSAGE
  // =========================================================

  const getReferralMessage =
    () => {
      if (referralLoading) {
        return "Checking referral offer...";
      }

      if (!referralEnabled) {
        return "";
      }

      if (
        referralStatus === "COMPLETED"
      ) {
        return "";
      }

      if (
        referralStatus !== "PENDING"
      ) {
        return "";
      }

      if (
        subtotal < minimumOrderAmount
      ) {
        return `Add ₹${(
          minimumOrderAmount -
          subtotal
        ).toFixed(
          2
        )} more to unlock your referral discount.`;
      }

      if (referralDiscount > 0) {
        return `Referral discount ₹${referralDiscount.toFixed(
          2
        )} applied.`;
      }

      return "";
    };

  const referralMessage =
    getReferralMessage();

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder =
    async () => {
      if (!selectedAddressId) {
        alert(
          "Please select delivery address."
        );
        return;
      }

      if (!selectedMethod) {
        alert(
          "Please select payment method."
        );
        return;
      }

      if (deliveryFeeLoading) {
        alert(
          "Please wait. Delivery charge is being calculated."
        );
        return;
      }

      if (deliveryFeeError) {
        alert(
          "Delivery charge could not be calculated. Please try again."
        );
        return;
      }

      setPlacingOrder(true);

      try {
        // -------------------------------------------------
        // Save latest GPS only at final checkout.
        // -------------------------------------------------

        if (
          customerLocation &&
          Number.isFinite(
            Number(
              customerLocation.latitude
            )
          ) &&
          Number.isFinite(
            Number(
              customerLocation.longitude
            )
          )
        ) {
          await updateAddress(
            selectedAddressId,
            {
              latitude:
                Number(
                  customerLocation.latitude
                ),
              longitude:
                Number(
                  customerLocation.longitude
                ),
            }
          );
        }

        // -------------------------------------------------
        // Backend calculates the actual referral discount.
        // Do not send discount from frontend.
        // -------------------------------------------------

        await onPlaceOrder({
          deliveryAddressId:
            selectedAddressId,

          paymentMethod:
            selectedMethod,

          customerNote:
            customerNote.trim(),
        });
      } finally {
        setPlacingOrder(false);
      }
    };

  // =========================================================
  // ADDRESS FORMATTER
  // =========================================================

  const formatAddress =
    (address) => {
      const parts = [
        address.houseNo,
        address.area,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
      ].filter(Boolean);

      return parts.join(", ");
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="payment-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="payment-header">

        <button
          type="button"
          className="back-button"
          onClick={() =>
            setActivePage("cart")
          }
        >
          ←
        </button>

        <div>
          <h1>
            Checkout
          </h1>

          <p>
            Select address and payment method
          </p>
        </div>

      </div>

      {/* =====================================================
          DELIVERY ADDRESS
      ===================================================== */}

      <div className="payment-section">

        <h3>
          Delivery Address
        </h3>

        {addresses.length === 0 ? (
          <div>
            <p>
              No delivery address found.
            </p>

            <button
              type="button"
              onClick={() =>
                setActivePage("profile")
              }
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="address-list">

            {addresses.map(
              (address) => {

                const addressId =
                  String(
                    address.id
                  );

                const selected =
                  selectedAddressId ===
                  addressId;

                return (
                  <button
                    key={address.id}
                    type="button"
                    className="address-card"
                    onClick={() =>
                      setSelectedAddressId(
                        addressId
                      )
                    }
                    style={{
                      border:
                        selected
                          ? "2px solid currentColor"
                          : undefined,
                      textAlign:
                        "left",
                      cursor:
                        "pointer",
                    }}
                  >

                    <div className="address-card-header">

                      <strong>
                        {address.addressType ||
                          "Address"}
                      </strong>

                      {address.isDefault && (
                        <span>
                          Default
                        </span>
                      )}

                    </div>

                    <div>
                      {address.fullName && (
                        <strong>
                          {address.fullName}
                        </strong>
                      )}

                      <p>
                        {formatAddress(
                          address
                        )}
                      </p>

                      {address.mobile && (
                        <small>
                          {address.mobile}
                        </small>
                      )}
                    </div>

                    <div>
                      {selected
                        ? "✓ Selected"
                        : "○ Select"}
                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          REFERRAL OFFER
      ===================================================== */}

      {referralMessage && (
        <div
          className="payment-section"
          style={{
            background:
              "#fff8ef",
            border:
              "1px solid #ffe0bd",
            borderRadius:
              "14px",
          }}
        >

          <h3>
            🎁 Referral Offer
          </h3>

          <p
            style={{
              margin:
                "8px 0 0",
              color:
                referralDiscount > 0
                  ? "#168448"
                  : "#777",
              fontWeight:
                referralDiscount > 0
                  ? "700"
                  : "500",
            }}
          >
            {referralMessage}
          </p>

        </div>
      )}

      {/* =====================================================
          PAYMENT METHOD
      ===================================================== */}

      <div className="payment-section">

        <h3>
          Payment Method
        </h3>

        <div className="payment-methods">

          <button
            type="button"
            className="payment-method-card"
            onClick={() =>
              setSelectedMethod(
                "COD"
              )
            }
            style={{
              border:
                selectedMethod ===
                "COD"
                  ? "2px solid currentColor"
                  : undefined,
              textAlign:
                "left",
              cursor:
                "pointer",
            }}
          >

            <span className="payment-method-icon">
              💵
            </span>

            <div className="payment-method-info">

              <strong>
                Cash on Delivery
              </strong>

              <span>
                Pay when your order arrives
              </span>

            </div>

            <span>
              {
                selectedMethod ===
                "COD"
                  ? "✓"
                  : "○"
              }
            </span>

          </button>

          <button
            type="button"
            className="payment-method-card"
            onClick={() =>
              setSelectedMethod(
                "CARD"
              )
            }
            style={{
              border:
                selectedMethod ===
                "CARD"
                  ? "2px solid currentColor"
                  : undefined,
              textAlign:
                "left",
              cursor:
                "pointer",
            }}
          >

            <span className="payment-method-icon">
              💳
            </span>

            <div className="payment-method-info">

              <strong>
                Debit / Credit Card
              </strong>

              <span>
                Visa / Mastercard / RuPay
              </span>

            </div>

            <span>
              {
                selectedMethod ===
                "CARD"
                  ? "✓"
                  : "○"
              }
            </span>

          </button>

        </div>

      </div>

      {/* =====================================================
          CUSTOMER NOTE
      ===================================================== */}

      <div className="payment-section">

        <h3>
          Delivery Note
        </h3>

        <textarea
          value={
            customerNote
          }
          onChange={(event) =>
            setCustomerNote(
              event.target.value
            )
          }
          placeholder="Example: Please deliver carefully"
          rows={4}
          style={{
            width:
              "100%",
            resize:
              "vertical",
          }}
        />

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="cart-summary">

        <div>

          <span>
            Subtotal
          </span>

          <strong>
            ₹
            {subtotal.toFixed(2)}
          </strong>

        </div>

        <div>

          <span>
            Delivery
          </span>

          <strong>
            {deliveryFeeLoading
              ? "Calculating..."
              : `₹${safeDeliveryFee.toFixed(
                  2
                )}`}
          </strong>

        </div>

        {/* ===================================================
            REFERRAL DISCOUNT
        =================================================== */}

        {referralDiscount > 0 && (
          <div>

            <span
              style={{
                color:
                  "#168448",
              }}
            >
              Referral Discount
            </span>

            <strong
              style={{
                color:
                  "#168448",
              }}
            >
              -₹
              {referralDiscount.toFixed(
                2
              )}
            </strong>

          </div>
        )}

        {deliveryFeeError && (
          <p
            style={{
              margin:
                "8px 0 0",
              fontSize:
                "13px",
              color:
                "#d32f2f",
            }}
          >
            {deliveryFeeError}
          </p>
        )}

        <hr />

        <div className="grand-total">

          <span>
            Payable
          </span>

          <strong>
            ₹
            {payableTotal.toFixed(
              2
            )}
          </strong>

        </div>

        <button
          type="button"
          className="checkout-button"
          disabled={
            placingOrder ||
            deliveryFeeLoading ||
            Boolean(
              deliveryFeeError
            )
          }
          onClick={
            handlePlaceOrder
          }
        >

          {placingOrder
            ? "Placing Order..."
            : deliveryFeeLoading
              ? "Calculating Delivery..."
              : "Place Order"}

        </button>

      </div>

    </div>
  );
}

export default PaymentMethods;