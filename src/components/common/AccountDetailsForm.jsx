import React from 'react';
import { Building2, QrCode, CreditCard } from 'lucide-react';

export default function AccountDetailsForm({ savedPayoutDetails, onChange }) {
  const payoutDetails = savedPayoutDetails || {
    payoutMethod: 'Bank',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
    upiId: '',
  };

  const payoutMethod = payoutDetails.payoutMethod || 'Bank';
  const bankDetails = payoutDetails.bankDetails || {
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  };
  const upiId = payoutDetails.upiId || '';

  const handleMethodChange = (method) => {
    onChange({
      ...payoutDetails,
      payoutMethod: method,
    });
  };

  const handleBankDetailChange = (field, value) => {
    onChange({
      ...payoutDetails,
      bankDetails: {
        ...bankDetails,
        [field]: value,
      },
    });
  };

  const handleUpiChange = (value) => {
    onChange({
      ...payoutDetails,
      upiId: value,
    });
  };

  return (
    <div className="space-y-4 py-1">
      <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3.5 text-xs text-purple-900">
        <p className="font-semibold flex items-center gap-1.5 text-purple-800">
          <CreditCard className="w-4 h-4 text-[#4d55f5]" />
          Bank & UPI Payout Details
        </p>
        <p className="text-purple-700/80 text-[11px] mt-0.5">
          These details will be used by the accounts team when processing incentive payouts for this role.
        </p>
      </div>

      {/* Method selector */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Payout Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleMethodChange('Bank')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
              payoutMethod === 'Bank'
                ? 'border-[#4d55f5] bg-indigo-50/50 text-[#4d55f5] shadow-xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Account</span>
          </button>
          <button
            type="button"
            onClick={() => handleMethodChange('UPI')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
              payoutMethod === 'UPI'
                ? 'border-[#4d55f5] bg-indigo-50/50 text-[#4d55f5] shadow-xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>UPI ID / VPA</span>
          </button>
        </div>
      </div>

      {/* Form fields */}
      {payoutMethod === 'Bank' ? (
        <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              value={bankDetails.accountHolderName || ''}
              onChange={(e) => handleBankDetailChange('accountHolderName', e.target.value)}
              placeholder="Full name as registered in bank account"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumber || ''}
                onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                placeholder="Bank A/C number"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankDetails.ifscCode || ''}
                onChange={(e) => handleBankDetailChange('ifscCode', e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bank Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={bankDetails.bankName || ''}
              onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
              placeholder="e.g. State Bank of India, HDFC Bank"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            UPI ID / VPA
          </label>
          <div className="relative">
            <QrCode className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={upiId}
              onChange={(e) => handleUpiChange(e.target.value)}
              placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
            />
          </div>
          <p className="text-[11px] text-gray-500">
            Provide an active UPI ID linked to this account holder.
          </p>
        </div>
      )}
    </div>
  );
}
