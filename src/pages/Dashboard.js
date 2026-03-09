import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { walletService, depositService, withdrawalService, investmentService } from '../lib/services';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);const [searchQuery, setSearchQuery] = useState('');
const [filterDays, setFilterDays] = useState('3');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvested: 0,
    referralEarning: 0,
    totalDeposit: 0,
    totalWithdrawn: 0,
    walletBalance: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);
const filteredTransactions = transactions.filter(tx => {
  const matchSearch = tx.type.toLowerCase().includes(searchQuery.toLowerCase());
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(filterDays));
  const matchDate = new Date(tx.createdAt) >= daysAgo;
  return matchSearch && matchDate;
});
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet balance
      const walletRes = await walletService.getBalance();
      const walletBalance = walletRes.data.data.walletBalance || 0;
      
      // Fetch deposits
      const depositsRes = await depositService.getMyDeposits();
      const deposits = depositsRes.data.data.deposits || [];
      const totalDeposit = deposits
        .filter(d => d.status === 'APPROVED')
        .reduce((sum, d) => sum + Number(d.amountUSD || 0), 0);
      
      // Fetch withdrawals
      const withdrawalsRes = await withdrawalService.getMyWithdrawals();
      const withdrawals = withdrawalsRes.data.data.withdrawals || [];
      const totalWithdrawn = withdrawals
        .filter(w => w.status === 'PAID')
        .reduce((sum, w) => sum + Number(w.amountUSD || 0), 0);
      
      // Fetch investments
      const investmentsRes = await investmentService.getMyInvestments();
      const investments = investmentsRes.data.data.investments || [];
      const totalInvested = investments
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      
      // Calculate referral earnings from user data
      const referralEarning = user?.referralEarnings || 0;
      
      setStats({
        totalInvested,
        referralEarning,
        totalDeposit,
        totalWithdrawn,
        walletBalance
      });

      // Combine transactions for display
      const allTransactions = [
        ...deposits.map(d => ({ ...d, type: 'deposit' })),
        ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      
      setTransactions(allTransactions);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge bg-warning',
      approved: 'badge bg-success',
      rejected: 'badge bg-danger',
      completed: 'badge bg-success'
    };
    return <span className={statusClasses[status] || 'badge bg-secondary'}>{status}</span>;
  };

  const statCards = [
    { icon: 'fas fa-hand-holding-usd', label: 'Total Invested', value: formatCurrency(stats.totalInvested), color: 'bg-orange' },
    { icon: 'fas fa-user-friends', label: 'Referral Earning', value: formatCurrency(stats.referralEarning), color: 'bg-purple' },
    { icon: 'fas fa-arrow-up', label: 'Total Deposit', value: formatCurrency(stats.totalDeposit), color: 'bg-yellow' },
    { icon: 'fas fa-arrow-down', label: 'Total Withdrawn', value: formatCurrency(stats.totalWithdrawn), color: 'bg-red' }
  ];

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-7">
            {/* Live Earning */}
            <div className="dashboard-card">
              <div className="d-flex align-items-center justify-content-between">
<h5 className="text-white opacity-75" style={{ fontWeight: 'normal' }}>
  Live Earning
</h5><span className="text-white opacity-50 mb-0 mt-3 d-block fs-10">                  Total Earning:<br />
                  <span className="fw-bold text-white">{formatCurrency(stats.referralEarning)}</span>
                </span>
              </div>
              <p className="text-success small mb-3">Real time updates</p>
              <h2 className="text-white fw-bold">{formatCurrency(stats.walletBalance)}</h2>
              <div className="d-flex gap-3 mt-4">
                <button 
                  className="btn-orange flex-fill"
                  onClick={() => navigate('/investment-plans')}
                >
                  <i className="fas fa-play me-2"></i>Invest Now
                </button>
                <button 
                  className="btn-teal flex-fill"
                  onClick={() => navigate('/add-funds')}
                >
                  <i className="fas fa-plus me-2"></i>Add Funds
                </button>
              </div>
            </div>
            <br />
            
            {/* Balance Card */}
            <div className="balance-card mb-3">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-gray mb-1">Total Balance</p>
                  <div className="d-flex align-items-center">
                    <h2 className="balance-amount mb-0">
                      {balanceVisible ? formatCurrency(stats.walletBalance) : '****'}
                    </h2>
                    <i className="fas fa-arrow-up text-success ms-3"></i>
                    <i 
                      className={`fas ${balanceVisible ? 'fa-eye-slash' : 'fa-eye'} text-gray ms-2`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setBalanceVisible(!balanceVisible)}
                    ></i>
                  </div>
                </div>
                <button 
                  className="btn-deposit"
                  onClick={() => navigate('/add-funds')}
                >
                  Deposit
                </button>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <p className="text-gray mb-0">
                  Deposit: <span className="text-white">{formatCurrency(stats.walletBalance)}</span>{' '}
                  <i className="fas fa-arrow-down text-success ms-1"></i>
                </p>
                <button 
                  className="btn-withdraw"
                  onClick={() => navigate('/withdraw-funds')}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-5">
            {/* Stats Grid */}
            <div className="row g-3 mb-4">
              {statCards.map((stat, index) => (
                <div key={index} className="col-6">
                  <div className="stat-card">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`stat-icon ${stat.color} me-3`}>
                        <i className={`${stat.icon} text-white`}></i>
                      </div>
                    </div>
                    <p className="text-gray small mb-1">{stat.label}</p>
                    <h4 className="text-white fw-bold mb-0">{stat.value}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
<div className="dashboard-card mt-4">
  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
<h5 className="text-white opacity-75" style={{ fontWeight: 'normal' }}>
Recent Transactions</h5>    {/* <button 
      className="btn btn-outline-light btn-sm"
      onClick={() => navigate('/transactions')}
    >
      View All
    </button> */}
  </div>

  {/* Search and Filter */}
<div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '12px', flexWrap: 'nowrap' }}>
  <div className="search-bar d-flex align-items-center" style={{ flex: '1', minWidth: '200px' }}>
    <input
      type="text"
      className="form-control"
      placeholder="Search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        backgroundColor: '#1f1f29',
        border: '1px solid #2c2c3a',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '8px 12px',
        width: '100%',
      }}
    />
    <i className="bi bi-filter ms-2" style={{ color: '#ffffff' }}></i>
  </div>

  <select
    className="form-select"
    value={filterDays}
    onChange={(e) => setFilterDays(e.target.value)}
    style={{
      maxWidth: '120px',
      backgroundColor: '#1f1f29',
      border: '1px solid #2c2c3a',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '8px 12px'
    }}
  >
    <option value="3">3 Days</option>
    <option value="7">7 Days</option>
    <option value="30">30 Days</option>
  </select>
</div>
<div className="table-responsive">
  {filteredTransactions.length === 0 ? (
    <div className="text-center py-5">
 <p className="text-gray mb-3 text-center" style={{ fontSize: '16px' }}>
    No transaction history found!
  </p>    </div>
  ) : (
    <table className="custom-table">
      <tbody>
        {filteredTransactions.map((tx, index) => (
          <tr key={index}>
            <td>
              <span className={`badge ${tx.type === 'deposit' ? 'bg-success' : 'bg-warning'}`}>
                {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </span>
            </td>
            <td className="text-white">{formatCurrency(tx.amountUSD)}</td>
            <td>{getStatusBadge(tx.status)}</td>
            <td className="text-gray">{formatDate(tx.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
</div>    </Layout>
  );
};

export default Dashboard;
