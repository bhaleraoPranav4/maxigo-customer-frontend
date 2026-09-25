import {
  useEffect,
  useState,
} from "react";

import "./Referral.css";

import {
  applyReferralCode,
  getMyReferral,
  getReferralHistory,
} from "./api";

function Referral({
  setActivePage,
}) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    referral,
    setReferral,
  ] = useState(null);

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    referralCode,
    setReferralCode,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    applying,
    setApplying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  // =========================================================
  // LOAD REFERRAL DATA
  // =========================================================

  const loadReferralData =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          referralData,
          historyData,
        ] = await Promise.all([
          getMyReferral(),
          getReferralHistory(),
        ]);

        setReferral(
          referralData || null
        );

        setHistory(
          Array.isArray(historyData)
            ? historyData
            : []
        );
      } catch (err) {
        console.error(
          "Referral load failed:",
          err
        );

        setError(
          err.message ||
            "Unable to load referral details."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadReferralData();
  }, []);

  // =========================================================
  // APPLY REFERRAL CODE
  // =========================================================

  const handleApplyReferral =
    async (event) => {
      event.preventDefault();

      const code =
        referralCode.trim();

      if (!code) {
        setError(
          "Please enter referral code."
        );
        setSuccess("");
        return;
      }

      setApplying(true);
      setError("");
      setSuccess("");

      try {
        await applyReferralCode(
          code
        );

        setReferralCode("");

        setSuccess(
          "Referral code applied successfully! 🎉"
        );

        await loadReferralData();
      } catch (err) {
        console.error(
          "Referral apply failed:",
          err
        );

        setError(
          err.message ||
            "Unable to apply referral code."
        );
      } finally {
        setApplying(false);
      }
    };

  // =========================================================
  // COPY REFERRAL CODE
  // =========================================================

  const handleCopyCode =
    async () => {
      const code =
        referral?.referralCode;

      if (!code) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          code
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error(
          "Copy failed:",
          error
        );

        alert(
          "Unable to copy referral code."
        );
      }
    };

  // =========================================================
  // STATUS FORMATTER
  // =========================================================

  const getStatusClass =
    (status) => {
      const value =
        String(
          status || ""
        ).toUpperCase();

      if (
        value === "COMPLETED"
      ) {
        return "completed";
      }

      if (
        value === "PENDING" ||
        value === "PENDING_ORDER"
      ) {
        return "pending";
      }

      if (
        value === "DISABLED"
      ) {
        return "disabled";
      }

      return "active";
    };

  const getStatusText =
    (status) => {
      const value =
        String(
          status || ""
        ).toUpperCase();

      if (
        value === "COMPLETED"
      ) {
        return "Completed";
      }

      if (
        value === "PENDING_ORDER"
      ) {
        return "Order Placed";
      }

      if (
        value === "PENDING"
      ) {
        return "Pending";
      }

      if (
        value === "DISABLED"
      ) {
        return "Disabled";
      }

      if (
        value === "ACTIVE"
      ) {
        return "Active";
      }

      return status || "Unknown";
    };

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatDate =
    (dateValue) => {
      if (!dateValue) {
        return "-";
      }

      try {
        return new Date(
          dateValue
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
      } catch {
        return "-";
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="referral-page">
        <div className="referral-loading">
          <div className="referral-spinner">
            ⏳
          </div>

          <p>
            Loading referral details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="referral-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="referral-header">

        <button
          type="button"
          className="referral-back-button"
          onClick={() =>
            setActivePage?.("profile")
          }
        >
          ←
        </button>

        <div>
          <h1>
            Refer & Earn
          </h1>

          <p>
            Invite friends and earn
            MaxiGo rewards
          </p>
        </div>

      </div>

      {/* =====================================================
          HERO CARD
      ===================================================== */}

      <div className="referral-hero">

        <div className="referral-hero-icon">
          🎁
        </div>

        <div className="referral-hero-content">

          <h2>
            Invite Friends
          </h2>

          <p>
            Share your referral code
            with friends. When they
            complete a qualifying order,
            you earn wallet rewards.
          </p>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="referral-alert referral-alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="referral-alert referral-alert-success">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          MY REFERRAL CODE
      ===================================================== */}

      <div className="referral-card">

        <div className="referral-card-title">
          <span className="referral-card-icon">
            🔗
          </span>

          <div>
            <h3>
              Your Referral Code
            </h3>

            <p>
              Share this code with
              your friends
            </p>
          </div>
        </div>

        <div className="referral-code-box">

          <span>
            {referral?.referralCode ||
              "Not available"}
          </span>

          <button
            type="button"
            onClick={handleCopyCode}
            disabled={
              !referral?.referralCode
            }
          >
            {copied
              ? "Copied ✓"
              : "Copy"}
          </button>

        </div>

        <div className="referral-status-row">

          <span>
            Referral Program
          </span>

          <span
            className={`referral-status ${getStatusClass(
              referral?.status
            )}`}
          >
            {getStatusText(
              referral?.status
            )}
          </span>

        </div>

      </div>

      {/* =====================================================
          APPLY REFERRAL
      ===================================================== */}

      <div className="referral-card">

        <div className="referral-card-title">

          <span className="referral-card-icon">
            🎟️
          </span>

          <div>
            <h3>
              Have a Referral Code?
            </h3>

            <p>
              Enter your friend's
              referral code
            </p>
          </div>

        </div>

        <form
          className="referral-apply-form"
          onSubmit={
            handleApplyReferral
          }
        >

          <input
            type="text"
            value={referralCode}
            onChange={(event) =>
              setReferralCode(
                event.target.value.toUpperCase()
              )
            }
            placeholder="Enter referral code"
            maxLength={50}
            disabled={applying}
          />

          <button
            type="submit"
            disabled={
              applying ||
              !referralCode.trim()
            }
          >
            {applying
              ? "Applying..."
              : "Apply"}
          </button>

        </form>

      </div>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <div className="referral-card">

        <div className="referral-section-heading">
          <span>
            💡
          </span>

          <h3>
            How It Works
          </h3>
        </div>

        <div className="referral-steps">

          <div className="referral-step">

            <div className="referral-step-number">
              1
            </div>

            <div>
              <h4>
                Share Your Code
              </h4>

              <p>
                Send your MaxiGo referral
                code to your friends.
              </p>
            </div>

          </div>

          <div className="referral-step">

            <div className="referral-step-number">
              2
            </div>

            <div>
              <h4>
                Friend Applies Code
              </h4>

              <p>
                Your friend applies your
                referral code.
              </p>
            </div>

          </div>

          <div className="referral-step">

            <div className="referral-step-number">
              3
            </div>

            <div>
              <h4>
                Qualifying Order
              </h4>

              <p>
                Your friend places the
                required qualifying order.
              </p>
            </div>

          </div>

          <div className="referral-step">

            <div className="referral-step-number">
              4
            </div>

            <div>
              <h4>
                Earn Wallet Reward
              </h4>

              <p>
                After the order is delivered,
                your reward is credited to
                your MaxiGo wallet.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          REFERRAL HISTORY
      ===================================================== */}

      <div className="referral-card">

        <div className="referral-section-heading">

          <span>
            📋
          </span>

          <h3>
            Referral History
          </h3>

        </div>

        {history.length === 0 ? (
          <div className="referral-empty">

            <div className="referral-empty-icon">
              📭
            </div>

            <h4>
              No referrals yet
            </h4>

            <p>
              Share your referral code
              and start earning rewards.
            </p>

          </div>
        ) : (
          <div className="referral-history-list">

            {history.map(
              (item, index) => {

                const name =
                  item?.referredCustomerName ||
                  item?.referredUserName ||
                  item?.customerName ||
                  "Customer";

                const reward =
                  Number(
                    item?.rewardAmount || 0
                  );

                return (
                  <div
                    className="referral-history-item"
                    key={
                      item?.id ||
                      index
                    }
                  >

                    <div className="referral-history-avatar">
                      👤
                    </div>

                    <div className="referral-history-info">

                      <h4>
                        {name}
                      </h4>

                      <p>
                        {formatDate(
                          item?.createdAt
                        )}
                      </p>

                    </div>

                    <div className="referral-history-right">

                      <span
                        className={`referral-status ${getStatusClass(
                          item?.status
                        )}`}
                      >
                        {getStatusText(
                          item?.status
                        )}
                      </span>

                      {reward > 0 && (
                        <strong>
                          ₹{reward.toFixed(2)}
                        </strong>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          REWARD INFO
      ===================================================== */}

      <div className="referral-info-box">

        <span className="referral-info-icon">
          💰
        </span>

        <div>

          <h4>
            Your rewards go directly
            to your MaxiGo Wallet
          </h4>

          <p>
            Referral rewards are credited
            after the referred customer's
            qualifying order is successfully
            delivered.
          </p>

        </div>

      </div>

      {/* =====================================================
          WALLET BUTTON
      ===================================================== */}

      <button
        type="button"
        className="referral-wallet-button"
        onClick={() =>
          setActivePage?.("wallet")
        }
      >
        <span>
          💰
        </span>

        View MaxiGo Wallet

        <span>
          →
        </span>
      </button>

    </div>
  );
}

export default Referral;