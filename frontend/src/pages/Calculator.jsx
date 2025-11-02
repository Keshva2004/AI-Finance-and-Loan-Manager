import React, { useState } from "react";

export default function Calculator() {
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [period, setPeriod] = useState("");
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  const formatNumber = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const calculateEMI = () => {
    let P = Number(amount);
    let R = Number(interest) / 100 / 12;
    let N = Number(period) * 12;

    if (!P || !R || !N) {
      alert("Please enter all values before calculating.");
      return;
    }

    let emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) || 0;
    let totalAmt = emiValue * N;
    let totalInt = totalAmt - P;

    setEmi(Math.round(emiValue));
    setTotalInterest(Math.round(totalInt));
    setTotalPayment(Math.round(totalAmt));
  };

  const resetAll = () => {
    setAmount("");
    setInterest("");
    setPeriod("");
    setEmi(0);
    setTotalInterest(0);
    setTotalPayment(0);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-gray-100 transition-all duration-300 font-inter">
      <h2 className="text-2xl font-semibold text-center mb-8 text-blue-700 dark:text-blue-400">
         EMI Calculator
      </h2>

      {/* Layout Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
            Enter Loan Details
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Loan Amount"
              className="w-full px-3 py-2 border border-blue-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Interest %</label>
            <input
              type="number"
              step="0.1"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Enter Interest Rate"
              className="w-full px-3 py-2 border border-blue-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Period (Years)
            </label>
            <input
              type="number"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Enter Loan Period"
              className="w-full px-3 py-2 border border-blue-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={calculateEMI}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
            >
              Calculate
            </button>
            <button
              onClick={resetAll}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-blue-700 dark:text-blue-300 font-semibold px-5 py-2 rounded-lg transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right: Result */}
        {emi > 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-center text-blue-700 dark:text-blue-300">
               EMI Summary
            </h3>

            <div className="space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 flex justify-between items-center shadow border border-blue-100 dark:border-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Monthly EMI
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  ₹ {formatNumber(emi)}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 flex justify-between items-center shadow border border-blue-100 dark:border-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Total Interest
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  ₹ {formatNumber(totalInterest)}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 flex justify-between items-center shadow border border-blue-100 dark:border-gray-600">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Total Payment (principal + interest)
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  ₹ {formatNumber(totalPayment)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md p-6 flex items-center justify-center text-gray-500 dark:text-gray-400 text-center">
            <p className="text-sm">
              Enter loan details and click <b>Calculate</b> to view your EMI
              summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
