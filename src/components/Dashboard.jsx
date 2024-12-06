import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles for animations
import { FaPencilAlt, FaTrashAlt, FaCheckCircle } from "react-icons/fa"; // Importing icons
import Modal from "./Modal"; // Import the modal component

const Dashboard = () => {
  // State to manage totals for income, expenses, and remaining balance
  const [totals, setTotals] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
  });

  // State to store all transactions
  const [transactions, setTransactions] = useState([]);

  // State to handle the creation of a new transaction
  const [newTransaction, setNewTransaction] = useState({
    user_id: 1, // Default user ID
    type: "income", // Default type as income
    category: "",
    amount: "",
    date: "",
  });

  // State to handle search functionality by category
  const [searchCategory, setSearchCategory] = useState("");

  // State to manage the visibility of the edit modal
  const [editTransactionModal, setEditTransactionModal] = useState(false);

  // State to store the transaction being edited
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // State for managing a general modal (success/error messages)
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Function to close the general modal
  const closeModal = () => setModalIsOpen(false);

  // Function to open the general modal with a custom message
  const openModal = (message) => {
    setModalMessage(message);
    setModalIsOpen(true);
  };

  const API_BASE_URL = "http://localhost/budget-tracker_backend/Backend/api";

  // Fetch transactions from the API
  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/get_transactions.php`);
      if (data.success) {
        setTransactions(data.transactions || []); // Update transactions state
        calculateTotals(data.transactions || []); // Update totals
      } else {
        console.error("Failed to fetch transactions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Error fetching transactions. Please try again later.");
    }
  }, []);

  // Calculate totals (income, expenses, and balance) based on transactions
  const calculateTotals = (transactions) => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    setTotals({
      totalIncome,
      totalExpenses,
      remainingBalance: totalIncome - totalExpenses,
    });
  };

  // Add a new transaction
  const addTransaction = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!newTransaction.category || !newTransaction.amount || !newTransaction.date) {
      openModal("Please fill out all fields.");
      return;
    }

    // Assign default statuses based on transaction type
    if (newTransaction.type === "expense") {
      newTransaction.status = "unpaid";
    } else if (newTransaction.type === "income") {
      newTransaction.status = "received";
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/add_transaction.php`,
        newTransaction
      );
      if (data.success) {
        openModal("Transaction added successfully!");
        // Reset the form fields
        setNewTransaction({
          user_id: 1,
          type: "income",
          category: "",
          amount: "",
          description: "",
          payment_method: "",
          date: "",
        });
        fetchTransactions(); // Refresh transactions
      } else {
        openModal(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      openModal("An error occurred while adding the transaction.");
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/delete_transact.php`, {
          transaction_id: id,
        });
        if (data.success) {
          openModal("Transaction deleted successfully!");
          fetchTransactions(); // Refresh transactions
        } else {
          openModal(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        openModal("An error occurred while deleting the transaction.");
      }
    }
  };

  // Mark a transaction as paid
  const markAsPaid = async (id) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/mark_as_paid.php`, {
        transaction_id: id,
      });
      if (data.success) {
        openModal(`Transaction ID ${id} marked as paid!`);
        // Update the status of the transaction in the state
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === id ? { ...transaction, status: "paid" } : transaction
          )
        );
      } else {
        openModal(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error marking transaction as paid:", error);
      openModal("An error occurred while marking the transaction as paid.");
    }
  };

  // Open the edit modal for a transaction
  const editTransaction = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setTransactionToEdit({
        id: transaction.id,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
      });
      setEditTransactionModal(true);
    } else {
      alert("Transaction not found!");
    }
  };

  // Update an existing transaction
  const updateTransaction = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (
      !transactionToEdit.category ||
      !transactionToEdit.amount ||
      !transactionToEdit.date
    ) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/update_transaction.php`, {
        transaction_id: transactionToEdit.id,
        category: transactionToEdit.category,
        amount: transactionToEdit.amount,
        date: transactionToEdit.date,
      });
      if (data.success) {
        alert("Transaction updated successfully!");
        setEditTransactionModal(false); // Close the modal
        fetchTransactions(); // Refresh transactions
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("An error occurred while updating the transaction.");
    }
  };

  // Fetch transactions and initialize AOS animations
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 2000); // Poll every 2 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [fetchTransactions]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Filter and sort transactions based on search and type
  const filteredTransactions = searchCategory
    ? transactions
        .filter(
          (t) =>
            t.category.toLowerCase().includes(searchCategory.toLowerCase()) &&
            (t.type !== "expense" || t.status === "unpaid") // Include only unpaid expenses
        )
        .sort((a, b) => {
          if (a.type === "expense" && b.type === "income") return -1;
          if (a.type === "income" && b.type === "expense") return 1;
          return 0;
        })
    : transactions
        .filter((t) => t.type !== "expense" || t.status === "unpaid")
        .sort((a, b) => {
          if (a.type === "expense" && b.type === "income") return -1;
          if (a.type === "income" && b.type === "expense") return 1;
          return 0;
        });

  return (
    <div className="bg-white p-4 rounded shadow">
      <h1 className="text-2xl font-bold" data-aos="fade-up">
        Budget Tracker
      </h1>
      <div className="flex justify-between mt-4" data-aos="fade-left">
        <p className="text-green-500">Total Income: ₱{totals.totalIncome.toFixed(2)}</p>
        <p className="text-red-500">Total Expenses: ₱{totals.totalExpenses.toFixed(2)}</p>
        <p className="text-blue-500">
          Remaining Balance: ₱{totals.remainingBalance.toFixed(2)}
        </p>
      </div>
      <div className="mt-6" data-aos="fade-right">
        <h2 className="text-xl font-bold">Add Transaction</h2>
        <form className="flex flex-wrap gap-4 mt-4" onSubmit={addTransaction}>
          <select
            className="border p-2 rounded"
            value={newTransaction.type}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, type: e.target.value })
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            className="border p-2 rounded flex-1"
            type="text"
            placeholder="Category"
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, category: e.target.value })
            }
          />
          <input
            className="border p-2 rounded flex-1"
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />
          <input
            className="border p-2 rounded flex-1"
            type="date"
            value={newTransaction.date}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, date: e.target.value })
            }
          />
          <button
            className="bg-blue-500 text-white p-2 rounded transition-all duration-300 ease-in-out hover:bg-blue-400 hover:shadow-md active:scale-95"
            type="submit"
          >
            Add Transaction
          </button>
        </form>
      </div>
      <div className="mt-6">
        <input
          className="border p-2 rounded mb-4 w-full"
          type="text"
          placeholder="Search by Category"
          onChange={(e) => setSearchCategory(e.target.value)}
        />
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t, index) => (
              <tr key={index} data-aos="fade-up">
                <td className="border px-4 py-2">{t.category}</td>
                <td className="border px-4 py-2">₱{parseFloat(t.amount).toFixed(2)}</td>
                <td className="border px-4 py-2">{t.date}</td>
                <td className="border px-4 py-2">
                  {t.type === "income" ? "Income" : "Expense"}
                </td>
                <td className="border px-4 py-3 flex gap-2 justify-center">
                  <button onClick={() => editTransaction(t.id)} className="text-blue-500">
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="text-red-500"
                  >
                    <FaTrashAlt />
                  </button>
                  {/* Conditionally render FaCheckCircle only for expenses */}
                  {t.type === "expense" && (
                    <button onClick={() => markAsPaid(t.id)} className="text-green-500">
                      <FaCheckCircle />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
            <form onSubmit={updateTransaction}>
              <input
                className="border p-2 rounded mb-4 w-full"
                type="text"
                value={transactionToEdit.category}
                onChange={(e) =>
                  setTransactionToEdit({ ...transactionToEdit, category: e.target.value })
                }
                placeholder="Category"
              />
              <input
                className="border p-2 rounded mb-4 w-full"
                type="number"
                value={transactionToEdit.amount}
                onChange={(e) =>
                  setTransactionToEdit({ ...transactionToEdit, amount: e.target.value })
                }
                placeholder="Amount"
              />
              <input
                className="border p-2 rounded mb-4 w-full"
                type="date"
                value={transactionToEdit.date}
                onChange={(e) =>
                  setTransactionToEdit({ ...transactionToEdit, date: e.target.value })
                }
              />
              <div className="flex justify-between items-center">
                <button className="bg-blue-500 text-white p-2 rounded" type="submit">
                  Update Transaction
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  type="button"
                  onClick={() => setEditTransactionModal(false)}
                >
                  close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Modal isOpen={modalIsOpen} message={modalMessage} onClose={closeModal} />
    </div>
  );
};

export default Dashboard;
