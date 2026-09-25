import {
  useEffect,
  useState,
} from "react";

import "./Wallet.css";

import {
  getMyWallet,
  getWalletTransactions,
} from "./api";

function Wallet({
  setActivePage,
}) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    wallet,
    setWallet,
  ] = useState(null);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // =========================================================
  // LOAD WALLET
  // =========================================================

  const loadWallet =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          walletData,
          transactionData,
        ] = await Promise.all([
          getMyWallet(),
          getWalletTransactions(),
        ]);

        setWallet(
          walletData || null
        );

        setTransactions(
          Array.isArray(
            transactionData
          )
            ? transactionData
            : []
        );
      } catch (err) {
        console.error(
          "Wallet load failed:",
          err
        );

        setError(
          err.message ||
            "Unable to load wallet."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadWallet();
  }, []);

  // =========================================================
  // NUMBER FORMATTER
  // =========================================================

  const formatAmount =
    (amount) => {
      const value =
        Number(amount || 0);

      if (!Number.isFinite(value)) {
        return "₹0.00";
      }

      return `₹${value.toFixed(2)}`;
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
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      } catch {
        return "-";
      }
    };

  // =========================================================
  // TRANSACTION TYPE
  // =========================================================

  const getTransactionTitle =
    (transaction) => {
      const type =
        String(
          transaction?.transactionType ||
            transaction?.type ||
            transaction?.referenceType ||
            ""
        ).toUpperCase();

      if (
        type.includes(
          "REFERRAL"
        )
      ) {
        return "Referral Reward";
      }

      if (
        type.includes(
          "CREDIT"
        )
      ) {
        return "Wallet Credit";
      }

      if (
        type.includes(
          "DEBIT"
        )
      ) {
        return "Wallet Debit";
      }

      return (
        transaction?.description ||
        transaction?.remarks ||
        "Wallet Transaction"
      );
    };

  // =========================================================
  // TRANSACTION DESCRIPTION
  // =========================================================

  const getTransactionDescription =
    (transaction) => {
      if (
        transaction?.description
      ) {
        return transaction.description;
      }

      if (
        transaction?.remarks
      ) {
        return transaction.remarks;
      }

      const referenceType =
        transaction?.referenceType;

      if (
        referenceType ===
        "REFERRAL"
      ) {
        return "Referral reward credited";
      }

      return "MaxiGo wallet transaction";
    };

  // =========================================================
  // AMOUNT
  // =========================================================

  const getTransactionAmount =
    (transaction) => {
      return Number(
        transaction?.amount ??
          transaction?.creditAmount ??
          transaction?.debitAmount ??
          0
      );
    };

  // =========================================================
  // CREDIT / DEBIT
  // =========================================================

  const isCredit =
    (transaction) => {
      const type =
        String(
          transaction?.transactionType ||
            transaction?.type ||
            transaction?.direction ||
            ""
        ).toUpperCase();

      if (
        type.includes("DEBIT")
      ) {
        return false;
      }

      if (
        transaction?.credit === true
      ) {
        return true;
      }

      if (
        transaction?.debit === true
      ) {
        return false;
      }

      if (
        transaction?.creditAmount != null &&
        Number(
          transaction.creditAmount
        ) > 0
      ) {
        return true;
      }

      if (
        transaction?.debitAmount != null &&
        Number(
          transaction.debitAmount
        ) > 0
      ) {
        return false;
      }

      return true;
    };

  // =========================================================
  // BALANCE
  // =========================================================

  const balance =
    Number(
      wallet?.balance ??
        wallet?.walletBalance ??
        wallet?.amount ??
        0
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="wallet-page">

        <div className="wallet-loading">

          <div className="wallet-loading-icon">
            💰
          </div>

          <p>
            Loading wallet...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="wallet-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="wallet-header">

        <button
          type="button"
          className="wallet-back-button"
          onClick={() =>
            setActivePage?.("profile")
          }
        >
          ←
        </button>

        <div>
          <h1>
            MaxiGo Wallet
          </h1>

          <p>
            Manage your wallet rewards
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="wallet-alert">

          <span>
            ⚠️
          </span>

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =====================================================
          BALANCE CARD
      ===================================================== */}

      <div className="wallet-balance-card">

        <div className="wallet-balance-top">

          <div className="wallet-balance-icon">
            💰
          </div>

          <div>

            <span className="wallet-balance-label">
              Available Balance
            </span>

            <h2>
              {formatAmount(balance)}
            </h2>

          </div>

        </div>

        <div className="wallet-balance-bottom">

          <span>
            MaxiGo Wallet
          </span>

          <span>
            Secure & Easy
          </span>

        </div>

      </div>

      {/* =====================================================
          QUICK INFO
      ===================================================== */}

      <div className="wallet-info-card">

        <div className="wallet-info-icon">
          🎁
        </div>

        <div>

          <h3>
            Earn through referrals
          </h3>

          <p>
            Refer your friends and earn
            rewards after their qualifying
            orders are delivered.
          </p>

        </div>

      </div>

      {/* =====================================================
          TRANSACTIONS
      ===================================================== */}

      <div className="wallet-card">

        <div className="wallet-section-heading">

          <span>
            📋
          </span>

          <h3>
            Transaction History
          </h3>

        </div>

        {transactions.length === 0 ? (

          <div className="wallet-empty">

            <div className="wallet-empty-icon">
              📭
            </div>

            <h4>
              No transactions yet
            </h4>

            <p>
              Your wallet transactions
              will appear here.
            </p>

          </div>

        ) : (

          <div className="wallet-transaction-list">

            {transactions.map(
              (
                transaction,
                index
              ) => {

                const credit =
                  isCredit(
                    transaction
                  );

                const amount =
                  Math.abs(
                    getTransactionAmount(
                      transaction
                    )
                  );

                return (
                  <div
                    className="wallet-transaction"
                    key={
                      transaction?.id ||
                      index
                    }
                  >

                    <div
                      className={`wallet-transaction-icon ${
                        credit
                          ? "credit"
                          : "debit"
                      }`}
                    >
                      {credit
                        ? "↓"
                        : "↑"}
                    </div>

                    <div className="wallet-transaction-details">

                      <h4>
                        {getTransactionTitle(
                          transaction
                        )}
                      </h4>

                      <p>
                        {getTransactionDescription(
                          transaction
                        )}
                      </p>

                      <span>
                        {formatDate(
                          transaction?.createdAt ||
                            transaction?.transactionDate ||
                            transaction?.date
                        )}
                      </span>

                    </div>

                    <div
                      className={`wallet-transaction-amount ${
                        credit
                          ? "credit"
                          : "debit"
                      }`}
                    >
                      {credit
                        ? "+"
                        : "-"}
                      {formatAmount(
                        amount
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
          REFERRAL BUTTON
      ===================================================== */}

      <button
        type="button"
        className="wallet-referral-button"
        onClick={() =>
          setActivePage?.("referral")
        }
      >

        <span className="wallet-referral-left">

          <span className="wallet-referral-icon">
            🎁
          </span>

          <span>
            Refer & Earn
          </span>

        </span>

        <span>
          →
        </span>

      </button>

    </div>
  );
}

export default Wallet;