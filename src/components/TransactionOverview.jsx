import React, { useEffect, useState } from "react";
import { FaRegTimesCircle } from "react-icons/fa"; // Import the icon

function TransactionOverview() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  // Function to fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "http://localhost/budget-tracker_backend/Backend/api/get_transactions.php"
      );
      const data = await response.json();

      if (data.success) {
        // Filter transactions with status 'paid'
        const paidTransactions = data.transactions.filter(
          (transaction) => transaction.status === "paid"
        );
        setTransactions(paidTransactions);
      } else {
        console.error("Error fetching transactions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Fetch transactions on component mount and periodically every 5 seconds
  useEffect(() => {
    fetchTransactions(); // Initial fetch
    const interval = setInterval(() => {
      fetchTransactions(); // Fetch every 5 seconds
    }, 2000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Function to update the status to "unpaid"
  const markAsUnpaid = async (transactionId) => {
    try {
      setLoading(true); // Start loading
      console.log("Sending request for transaction ID:", transactionId);

      const response = await fetch(
        `http://localhost/BudgetTracker_backend/Backend/api/update_status.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            status: "unpaid",
          }),
        }
      );

      const rawResponse = await response.text(); // Capture raw response
      console.log("Raw server response:", rawResponse);

      const data = JSON.parse(rawResponse); // Parse JSON
      console.log("Parsed response from server:", data);

      if (data.success) {
        fetchTransactions(); // Refetch updated transactions
      } else {
        console.error("Error updating status:", data.message);
      }
    } catch (error) {
      console.error("Error marking as unpaid:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto mt-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">List</h2>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td className="px-4 py-2">{transaction.amount}</td>
              <td className="px-4 py-2">{transaction.type}</td>
              <td className="px-4 py-2">{transaction.category}</td>
              <td className="px-4 py-2">{transaction.date}</td>
              <td className="px-4 py-2">
                {transaction.status !== "unpaid" && !loading && (
                  <button
                    onClick={() => markAsUnpaid(transaction.id)}
                    className="text-red-500 p-2 rounded flex items-center"
                  >
                    <FaRegTimesCircle className="mr-2" /> {/* React icon */}
                  </button>
                )}
                {loading && <span>Loading...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionOverview;
