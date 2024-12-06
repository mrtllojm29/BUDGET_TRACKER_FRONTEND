import React, { useState, useEffect } from "react";

function SpendingAnalysis() {
  const [backendTransactions, setBackendTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch transactions from the PHP backend
        const response = await fetch(
          "http://localhost/budget-tracker_backend/backend/api/get_transactions.php"
        );
        const data = await response.json();

        // Check if the response contains success flag
        if (data.success) {
          setBackendTransactions(data.transactions); // Set the transactions from backend
        } else {
          console.error("Failed to fetch transactions:", data.message);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions(); // Initial fetch
    const interval = setInterval(() => {
      fetchTransactions(); // Fetch every 5 seconds
    }, 5000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Calculate total income, total expenses, and expenses by category
  const totalIncome = backendTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const totalExpense = backendTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const expenseByCategory = backendTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => {
      if (acc[transaction.category]) {
        acc[transaction.category] += parseFloat(transaction.amount);
      } else {
        acc[transaction.category] = parseFloat(transaction.amount);
      }
      return acc;
    }, {});

  return (
    <div className="p-4 max-w-lg mx-auto mt-4 bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Total Income</h3>
        <p className="text-xl font-bold">₱{totalIncome.toFixed(2)}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Total Expense</h3>
        <p className="text-xl font-bold">₱{totalExpense.toFixed(2)}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Expenses by Category</h3>
        <ul className="list-disc pl-5">
          {Object.keys(expenseByCategory).map((category, index) => (
            <li key={index}>
              {category}: ₱{expenseByCategory[category].toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SpendingAnalysis;
