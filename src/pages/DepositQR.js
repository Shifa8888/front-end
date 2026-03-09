import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { depositService } from '../lib/services';
import './DepositQR.css';

const DepositQR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get('method');
  const amount = searchParams.get('amount');
  const paymentMethodId = searchParams.get('paymentMethodId');

  const [transactionId, setTransactionId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setSelectedFile(file);
    setUploadedImage(null);
  };

  const handleUploadScreenshot = async () => {
    try {
      if (!selectedFile) {
        alert('Please select a screenshot first');
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      const result = await depositService.uploadScreenshotToImageKit(
        selectedFile,
        (evt) => {
          const progress = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(progress);
        }
      );

      setUploadedImage({
        url: result.url,
        fileId: result.fileId,
        name: result.name,
      });

      alert('Screenshot uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error || 'Screenshot upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDeposit = async () => {
    try {
      if (!amount) {
        alert('Amount is missing');
        return;
      }

      if (!paymentMethodId) {
        alert('Payment method ID is missing');
        return;
      }

      if (!transactionId.trim()) {
        alert('Transaction ID is required');
        return;
      }

      if (!uploadedImage?.url) {
        alert('Please upload screenshot first');
        return;
      }

      setSubmitting(true);

      const payload = {
        amountUSD: Number(amount),
        paymentMethodId,
        transactionId: transactionId.trim(),
        screenshot: uploadedImage.url,
        screenshotFileId: uploadedImage.fileId,
      };

      console.log('Submitting deposit payload:', payload);

      const response = await depositService.create(payload);

      alert(response.data.message || 'Deposit request submitted');

      setTransactionId('');
      setSelectedFile(null);
      setUploadedImage(null);
      setUploadProgress(0);

      navigate('/dashboard');
    } catch (error) {
      console.error('Create deposit error:', error);
      alert(error || 'Deposit submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Deposit QR Code">
      <div className="dashboard-card text-center">
        <h5 className="text-white mb-4">Complete Your Deposit</h5>
        <p className="text-gray mb-3">Payment Method: {method}</p>
        <p className="text-white mb-4">Amount: ${amount}</p>

        <div className="qr-placeholder mb-4">
          <i className="fas fa-qrcode fa-5x text-gray"></i>
          <p className="text-gray mt-3">QR Code will be displayed here</p>
        </div>

        <p className="text-gray small mb-4">
          Scan the QR code to complete your payment
        </p>

        <div className="mb-3 text-start">
          <label className="form-label text-white">Transaction ID</label>
          <input
            type="text"
            className="form-control"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
          />
        </div>

        <div className="mb-3 text-start">
          <label className="form-label text-white">Upload Screenshot</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && !uploadedImage && (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleUploadScreenshot}
              disabled={uploading}
            >
              {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Screenshot'}
            </button>
          </div>
        )}

        {uploadedImage?.url && (
          <div className="mb-3">
            <p className="text-success">Screenshot uploaded successfully</p>
            <img
              src={uploadedImage.url}
              alt="Deposit screenshot"
              style={{ width: '180px', borderRadius: '8px' }}
            />
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmitDeposit}
          disabled={submitting || uploading}
        >
          {submitting ? 'Submitting...' : 'Submit Deposit'}
        </button>
      </div>
    </Layout>
  );
};

export default DepositQR;