import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { planService, investmentService } from '../lib/services';
import './InvestmentPlans.css';

const InvestmentPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getAll();
      setPlans(response.data.data.plans || []);
    } catch (err) {
      setError('Failed to load investment plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInvesting = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.min.toString());
    setShowInvestModal(true);
  };

  const handleInvest = async () => {
    if (!selectedPlan || !investAmount) return;
    
    const amount = parseFloat(investAmount);
    
    if (amount < selectedPlan.min) {
      alert(`Minimum investment amount is $${selectedPlan.min}`);
      return;
    }
    
    if (amount > selectedPlan.max) {
      alert(`Maximum investment amount is $${selectedPlan.max}`);
      return;
    }

    try {
      setInvesting(true);
      await investmentService.create({
        planId: selectedPlan._id,
        amount: amount
      });
      alert('Investment created successfully!');
      setShowInvestModal(false);
      setInvestAmount('');
      setSelectedPlan(null);
    } catch (err) {
      alert(err.message || 'Failed to create investment');
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString()}`;
  };

  const getPlanIcon = (planName) => {
    const icons = {
      'Lithium': 'fas fa-battery-full',
      'Gold': 'fas fa-coins',
      'Platinum': 'fas fa-crown',
      'Diamond': 'fas fa-gem',
      'Silver': 'fas fa-medal',
      'Bronze': 'fas fa-award'
    };
    return icons[planName] || 'fas fa-chart-line';
  };

  if (loading) {
    return (
      <Layout title="Plans">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Plans">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-5">
          <h2 className="text-white opacity-95" style={{ fontWeight: 'normal' }}>Investment Plans</h2>
          <p className="text-gray">Choose your AI trading bot and start earning</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="row g-4">
          {plans.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-gray">No investment plans available at the moment.</p>
            </div>
          ) : (
            plans.map((plan, index) => (
              <div key={plan._id || index} className="col-12 mb-4">
                <div className="plan-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="d-flex align-items-start mb-4">
                    <div className="plan-icon me-4">
                      <i className={getPlanIcon(plan.name)}></i>
                    </div>
                    <div>
                      <h4 className="text-white fw-bold mb-2">{plan.name}</h4>
                      <p className="text-gray mb-2">Duration: {plan.duration} days</p>
                      <p className="text-success-custom mb-0">{plan.capitalReturn ? 'Principal Return Policy' : 'No Principal Return'}</p>
                    </div>
                  </div>
              
                  <div className="d-flex align-items-center mb-2">
                    <div>
                      <p className="text-gray mb-1">Range</p>
                      <p className="text-white fw-bold mb-0">
                        {formatCurrency(plan.min)} - {formatCurrency(plan.max)} <span className="text-gray fw-normal">Min</span>
                      </p>
                    </div>
                    <div className="plan-divider"></div>
                    <div>
                      <p className="text-white fw-bold mb-1">
                        ROI {plan.dailyProfit}% <span className="text-gray fw-normal">Daily</span>
                      </p>
                      <p className="text-white mb-0">{(plan.dailyProfit / 24).toFixed(4)}% / Hourly</p>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn-start" 
                      onClick={() => handleStartInvesting(plan)}
                      disabled={!plan.active}
                    >
                      {plan.active ? 'Start Investing' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedPlan && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: '#1a1d29', border: '1px solid #2d3348' }}>
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">Invest in {selectedPlan.name}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowInvestModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label text-gray">Investment Amount</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white">$</span>
                    <input
                      type="number"
                      className="form-control bg-dark border-secondary text-white"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      min={selectedPlan.min}
                      max={selectedPlan.max}
                      placeholder="Enter amount"
                    />
                  </div>
                  <small className="text-gray">
                    Min: {formatCurrency(selectedPlan.min)} | Max: {formatCurrency(selectedPlan.max)}
                  </small>
                </div>
                <div className="mb-3">
                  <p className="text-gray mb-1">Expected Daily Return: <span className="text-success">{selectedPlan.dailyProfit}%</span></p>
                  <p className="text-gray mb-0">Expected Hourly Return: <span className="text-success">{(selectedPlan.dailyProfit / 24).toFixed(4)}%</span></p>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowInvestModal(false)}
                  disabled={investing}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleInvest}
                  disabled={investing || !investAmount}
                >
                  {investing ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Processing...</>
                  ) : (
                    'Confirm Investment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InvestmentPlans;
