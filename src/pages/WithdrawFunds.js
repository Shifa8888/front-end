import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  withdrawalService,
  paymentMethodService,
  walletService,
} from "../lib/services";
import "./WithdrawFunds.css";

const WithdrawFunds = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [successMsg, setSuccessMsg] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
    fetchWalletBalance();
    fetchWithdrawHistory();
  }, [filterPeriod]);

  useEffect(() => {
    // Add floating animation to cards
    const cards = document.querySelectorAll(".dashboard-card");
    cards.forEach((card, index) => {
      card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodService.getActive();
      const methods = (response.data.data.methods || []).map((pm) => ({
        id: pm._id,
        name: pm.name,
        icon: pm.type === "crypto" ? "fab fa-bitcoin" : "fas fa-university",
        bgColor: pm.type === "crypto" ? "bg-crypto" : "bg-bank",
      }));
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      setWalletBalance(response.data.data.walletBalance || 0);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      setLoading(true);
      const response = await withdrawalService.getMyWithdrawals();
      let withdrawals = response.data.data.withdrawals || [];

      // Filter by period
      if (filterPeriod !== "all") {
        const days = parseInt(filterPeriod);
        const cutoffDate = new Date(
          new Date().getTime() - days * 24 * 60 * 60 * 1000,
        );
        withdrawals = withdrawals.filter(
          (w) => new Date(w.createdAt) >= cutoffDate,
        );
      }

      // Sort by date (newest first)
      withdrawals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setWithdrawHistory(withdrawals);
    } catch (err) {
      console.error("Failed to fetch withdraw history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

 const handleContinueWithdraw = async () => {
  if (!selectedMethod) {
    alert('Please select a payment method');
    return;
  }

  const amountValue = parseFloat(withdrawAmount);
  if (!withdrawAmount || isNaN(amountValue) || amountValue <= 0) {
    alert('Please enter a valid withdrawal amount');
    return;
  }

  if (amountValue < 10) {
    alert('Minimum withdrawal amount is $10');
    return;
  }

  if (amountValue > walletBalance) {
    alert('Insufficient wallet balance');
    return;
  }

  if (!withdrawAddress.trim()) {
    alert('Please enter your withdraw address');
    return;
  }

  try {
    setSubmitting(true);

    await withdrawalService.create({
      amountUSD: amountValue,
      paymentMethodId: selectedMethod,
      withdrawAddress: withdrawAddress.trim()
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
    }, 2500);

    setWithdrawAmount('');
    setWithdrawAddress('');
    setSelectedMethod('');

    fetchWithdrawHistory();
    fetchWalletBalance();
  } catch (err) {
    alert(err || 'Failed to submit withdrawal request');
  } finally {
    setSubmitting(false);
  }
};

  const handleAmountInput = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts[1];
    }
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
      value = parts[0] + "." + parts[1];
    }
    setWithdrawAmount(value);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENIDING: "text-warning",
      APPROVED: "text-success",
      REJECTED: "text-danger",
      pending: "text-warning",
      approved: "text-success",
      rejected: "text-danger",
    };
    return statusClasses[status] || "text-gray";
  };

  return (
    <Layout title="Withdraw">
      <div className="row g-4 withdraw-sections-row">
        {/* Wallet Balance */}
        <div className="col-12">
          <div className="dashboard-card mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
              <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Available Balance</h5>
                <h2 className="text-white fw-bold mb-0">
                  ${walletBalance.toFixed(2)}
                </h2>
              </div>
              <button
                className="btn-dashboard"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Instructions */}
        <div className="col-12 withdraw-instructions-col">
          <div className="dashboard-card mb-4">
             <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Withdrawal Instructions</h5>
            <ul className="instruction-list">
              <li>
                Double-check your wallet or account details before submitting a
                withdrawal request. Incorrect details may result in permanent
                loss of funds.
              </li>
              <li>
                Withdrawals are typically processed within{" "}
                <strong>24 hours</strong> on business days. Delays may occur
                during weekends or holidays.
              </li>
              <li>
                Minimum withdrawal amount: <strong>$10</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Select Payment Method + Withdraw Amount */}
        <div className="col-12 withdraw-form-col">
          {/* Select Payment Method */}
          <div className="dashboard-card mb-4">
             <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Select Payment Method</h5>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-gray">No payment methods available</p>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-card ${selectedMethod === method.id ? "active" : ""}`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div className={`payment-icon ${method.bgColor}`}>
                    <i className={`${method.icon} text-white`}></i>
                  </div>
                  <span className="text-white">{method.name}</span>
                </div>
              ))
            )}
          </div>

          {/* Withdraw Amount */}
          <div className="dashboard-card">
            <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Withdraw Amount</h5>
            <div className="position-relative mb-4">
              <span
                className="position-absolute text-gray"
                style={{
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                }}
              >
                $
              </span>
              <input
                type="text"
                className="amount-input ps-5"
                placeholder="Enter withdrawal amount (Min: $10)"
                value={withdrawAmount}
                onChange={handleAmountInput}
              />
            </div>
            <div className="position-relative mb-4">
              <input
                type="text"
                className="amount-input"
                placeholder="Enter your wallet address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>

            <button
              className="btn-withdraw"
              onClick={handleContinueWithdraw}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                </>
              ) : (
                "Continue Withdraw"
              )}
            </button>

            {successMsg && (
              <div
                className="mt-3 text-center"
                style={{ color: "#10b981", fontWeight: "700" }}
              >
                <i className="fas fa-check-circle me-2"></i>Request sent
                successfully
              </div>
            )}
          </div>
        </div>

        {/* Withdraw History */}
        <div className="col-12 withdraw-history-col">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Withdraw History</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-link text-white p-2"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.5))",
                    border: "1px solid rgba(6,182,212,0.3)",
                    borderRadius: "10px",
                    transition: "all 0.3s",
                  }}
                >
                  <i className="fas fa-sliders-h"></i>
                </button>
                <select
                  className="filter-dropdown"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                >
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : withdrawHistory.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-receipt text-gray fs-1 opacity-50"></i>
                </div>
                <p
                  className="text-gray mb-0"
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  No transaction history found!
                </p>
                <p
                  className="text-gray small mb-0 mt-2"
                  style={{ opacity: 0.7 }}
                >
                  Your withdrawal history will appear here
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {withdrawHistory.map((withdraw, index) => (
                  <div key={index} className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-3"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div>
                        <div className="text-white fw-medium">
                          ${Number(withdraw.amountUSD || 0).toFixed(2)}
                        </div>
                        <small className="text-gray">
                          {withdraw.paymentMethodId?.name || "Unknown"}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className={getStatusBadge(withdraw.status)}>
                          {withdraw.status.charAt(0).toUpperCase() +
                            withdraw.status.slice(1)}
                        </div>
                        <small className="text-gray">
                          {formatDate(withdraw.createdAt)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WithdrawFunds;
