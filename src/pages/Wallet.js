import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  walletService,
  depositService,
  withdrawalService,
} from "../lib/services";
import "./Wallet.css";

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [referralEarning, setReferralEarning] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Fetch wallet balance
      
      const walletRes = await walletService.getBalance();
      console.log("Wallet response:", walletRes);
      setBalance(walletRes.data.data.walletBalance || 0);    //data.data
      setReferralEarning(walletRes.data.data.totalReferralEarning || 0);
      

      // Fetch deposits and withdrawals
      const [depositsRes, withdrawalsRes] = await Promise.all([
        depositService.getMyDeposits(),
        withdrawalService.getMyWithdrawals(),
      ]);

      const deposits = (depositsRes.data.data.deposits || []).map((d) => ({
        ...d,
        amount: d.amountUSD,
        type: "deposit",
        displayType: "Deposit",
      }));

      const withdrawals = (withdrawalsRes.data.data.withdrawals || []).map(
        (w) => ({
          ...w,
          amount: w.amountUSD || w.amount,
          type: "withdrawal",
          displayType: "Withdrawal",
        }),
      );

      // Combine and sort by date
      const allTransactions = [...deposits, ...withdrawals].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    navigate("/add-funds");
  };

  const handleWithdraw = () => {
    navigate("/withdraw-funds");
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: "badge bg-warning text-dark",
      APPROVED: "badge bg-success",
      REJECTED: "badge bg-danger",
      COMPLETED: "badge bg-success",
      pending: "badge bg-warning text-dark",
      approved: "badge bg-success",
      rejected: "badge bg-danger",
      completed: "badge bg-success",
    };
    return (
      <span className={statusClasses[status] || "badge bg-secondary"}>
        {status}
      </span>
    );
  };

  // Filter transactions based on search and period
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.displayType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);

    if (filterPeriod === "all") return matchesSearch;

    const txDate = new Date(tx.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));

    return matchesSearch && daysDiff <= parseInt(filterPeriod);
  });

  return (
    <Layout title="Wallet">
      <div className="p-4">
        {/* Balance Card */}
        <div className="balance-card mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <p className="text-gray mb-2">Total Balance</p>
              <div className="d-flex align-items-center">
                <h2 className="balance-amount mb-0">
                  {balanceVisible ? formatCurrency(balance) : "****"}
                </h2>
                <i className="fas fa-arrow-up text-success ms-3 fs-5"></i>
                <i
                  className={`fas ${balanceVisible ? "fa-eye-slash" : "fa-eye"} text-gray ms-2 fs-5`}
                  onClick={toggleBalanceVisibility}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>
              <div className="d-flex align-items-center mt-3">
                <i className="fas fa-user-friends text-gray me-2"></i>
                <span className="text-gray">Referral Earning:</span>
                <span className="text-white fw-bold ms-2">
                  {formatCurrency(referralEarning)}
                </span>
                <i className="fas fa-arrow-up text-success ms-2"></i>
              </div>
            </div>
            <div className="d-flex gap-3 mt-3 mt-md-0">
              <button className="btn-dashboard" onClick={handleDeposit}>
                <i className="fas fa-arrow-up me-2"></i>Deposit
              </button>
              <button className="btn-dashboard" onClick={handleWithdraw}>
                <i className="fas fa-arrow-down me-2"></i>Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h5 className="text-white mb-0 opacity-95" style={{ fontWeight: 'normal' }}>Recent Activity</h5>
            <div className="d-flex gap-3">
              <div className="position-relative">
                <i
                  className="fas fa-search position-absolute text-gray"
                  style={{
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                ></i>
                <input
                  type="text"
                  className="search-box ps-5"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-dashboard py-2 px-3">
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

          {/* Table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="py-5">
                        <p
                          className="text-gray mb-0"
                          style={{ fontSize: "18px" }}
                        >
                          No transaction history found!
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td>
                        <span
                          className={`badge ${tx.type === "deposit" ? "bg-success" : "bg-warning text-dark"}`}
                        >
                          {tx.displayType}
                        </span>
                      </td>
                      <td className="text-white fw-bold">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td>{getStatusBadge(tx.status)}</td>
                      <td className="text-gray">{formatDate(tx.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
