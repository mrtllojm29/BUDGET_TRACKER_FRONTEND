import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null); // To store any errors during fetch

  // Fetch transactions from the backend
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost/budget-tracker_backend/Backend/api/get_transactions.php"
      );

      const data = response.data;

      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions); // Update transaction list
        setError(null); // Clear any previous errors
      } else {
        setError("Failed to fetch transactions. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("An error occurred while fetching transactions.");
    }
  };

  // Fetch transactions when the component mounts and at regular intervals
  useEffect(() => {
    fetchTransactions(); // Initial fetch
    const interval = setInterval(() => {
      fetchTransactions(); // Fetch every 5 seconds
    }, 5000);

    // Clean up the interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Error Message */}
      {error && <div className="mt-4 bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Transaction List */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Transaction History</h2>
        <div className="mt-4">
          {transactions && transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-3 ${
                    transaction.type === "income" ? "bg-green-50" : "bg-red-50"
                  } rounded shadow-sm`}
                >
                  <div>
                    <strong className="block text-gray-700">
                      {transaction.category}
                    </strong>
                    <span className="text-gray-400 text-sm">{transaction.date}</span>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₱{parseFloat(transaction.amount).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
