import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { depositService, paymentMethodService } from '../lib/services';
import './AddFunds.css';

const AddFunds = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [depositHistory, setDepositHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
    fetchDepositHistory();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodService.getActive();

      let methodsData = [];
      if (response.data?.data?.methods) {
        methodsData = response.data.data.methods;
      } else if (response.data?.methods) {
        methodsData = response.data.methods;
      } else if (Array.isArray(response.data)) {
        methodsData = response.data;
      }

      const methods = methodsData.map((pm) => ({
        id: pm._id,
        name: pm.name,
        icon: pm.type === 'crypto' ? 'fab fa-bitcoin' : 'fas fa-university',
        bgClass: pm.type === 'crypto' ? 'bg-crypto' : 'bg-bank',
        details: pm.details,
      }));

      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      const response = await depositService.getMyDeposits();
      const deposits = response.data?.data?.deposits || [];
      setDepositHistory(deposits);
    } catch (err) {
      console.error('Failed to fetch deposit history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (methodId) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid deposit amount first.');
      return;
    }

    if (parseFloat(amount) < 2) {
      alert('Minimum deposit amount is $2.');
      return;
    }

    setSelectedMethod(methodId);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (!e.target.value) {
      setSelectedMethod('');
    }
  };

  const handleContinueToDepositQR = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid deposit amount first.');
      return;
    }

    if (parseFloat(amount) < 2) {
      alert('Minimum deposit amount is $2.');
      return;
    }

    if (!selectedMethod) {
      alert('Please select a payment method.');
      return;
    }

    const selectedMethodDetails = paymentMethods.find((pm) => pm.id === selectedMethod);

    navigate(
      `/deposit-qr?method=${encodeURIComponent(
        selectedMethodDetails?.name || 'Payment Method'
      )}&amount=${amount}&paymentMethodId=${selectedMethod}`
    );
  };

  const filterHistory = (history) => {
    if (historyFilter === 'all') return history;
    const days = parseInt(historyFilter, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return history.filter((deposit) => new Date(deposit.createdAt) >= cutoffDate);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'text-warning',
      APPROVED: 'text-success',
      REJECTED: 'text-danger',
    };
    return statusClasses[status] || 'text-gray';
  };

  const filteredHistory = filterHistory(depositHistory);
  const selectedMethodDetails = paymentMethods.find((pm) => pm.id === selectedMethod);

  return (
    <Layout title="Deposit">
      <div className="p-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="dashboard-card">
            <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>
Deposit</h5>

              <div className="mb-4">
                <label className="text-gray mb-2" style={{ fontSize: '14px' }}>
                  Amount (Min: $2)
                </label>
                <div className="position-relative">
                  <span
                    className="position-absolute text-gray"
                    style={{
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    className="amount-input ps-5"
                    id="depositAmount"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    min="2"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray mb-2" style={{ fontSize: '14px' }}>
                  Select Payment Method
                </label>
                <div className="row" style={{ marginTop: '40px' }}>
                  {paymentMethods.length === 0 ? (
                    <div className="col-12 text-center py-3">
                      <p className="text-gray">No payment methods available</p>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="col-12 mb-3">
                        <div
                          className={`payment-card ${
                            selectedMethod === method.id ? 'active' : ''
                          }`}
                          onClick={() => handleMethodSelect(method.id)}
                        >
                          <div className={`payment-icon ${method.bgClass}`}>
                            <i className={`${method.icon} text-white`}></i>
                          </div>
                          <span className="text-white">{method.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedMethodDetails && (
                <div
                  style={{
                    borderTop: '1px solid rgba(148,163,184,0.3)',
                    paddingTop: '18px',
                    marginTop: '6px',
                  }}
                >
                  {selectedMethodDetails.details && (
                    <div
                      className="mb-3 p-3"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                      }}
                    >
                      <h6 className="text-white mb-2">Payment Details</h6>
                      {Object.entries(selectedMethodDetails.details).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="text-gray small">{key}: </span>
                          <span className="text-white small">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button className="btn-deposit" onClick={handleContinueToDepositQR}>
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboard-card mb-4">
        <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Deposit Instructions</h5>
              <ul className="instruction-list">
                <li>If the transfer time is up, please fill out the deposit form again.</li>
                <li>The amount you send must be the same as your order.</li>
                <li>Note: Don&apos;t cancel the deposit after sending the money.</li>
                <li>Minimum deposit is $2</li>
              </ul>
            </div>

            <div className="dashboard-card">
              <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Deposit History</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-link text-white p-2"
                    style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    type="button"
                  >
                    <i className="fas fa-sliders-h"></i>
                  </button>
                  <select
                    className="filter-dropdown"
                    id="historyFilter"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                  >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              <div id="depositHistoryContainer">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-gray mb-0" style={{ fontSize: '16px' }}>
                      No transaction history found!
                    </p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredHistory.map((deposit, index) => (
                      <div key={deposit._id || index} className="col-12">
                        <div
                          className="d-flex justify-content-between align-items-center p-3"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <div>
                            <div className="text-white fw-medium">
                              ${Number(deposit.amountUSD || 0).toFixed(2)}
                            </div>
                            <small className="text-gray">
                              {deposit.paymentMethod?.name || 'Unknown'}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className={getStatusBadge(deposit.status)}>
                              {deposit.status}
                            </div>
                            <small className="text-gray">{formatDate(deposit.createdAt)}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddFunds;