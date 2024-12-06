import React, { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import Dashboard from "../components/Dashboard";
import TransactionList from "../components/TransactionList";
import SpendingAnalysis from "../components/SpendingAnalysis";
import TransactionOverview from "../components/TransactionOverview";
import axios from "axios";
import { FaExchangeAlt, FaCheckCircle, FaChartPie, FaHistory } from "react-icons/fa";

// Modal Component
const Modal = ({ isOpen, message, onClose, onConfirm, isConfirmation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{message}</h2>
        <div className="flex justify-end space-x-4">
          {isConfirmation ? (
            <>
              <button
                onClick={onConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition duration-300"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition duration-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Home Component
const Home = () => {
  const dashboardRef = useRef(null);
  const transactionListRef = useRef(null);

  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmation, setIsConfirmation] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState(null);

  const API_BASE_URL = "http://localhost/budget-tracker_backend/Backend/api";

  const openModal = (message, isConfirmation = false, onConfirm = null) => {
    setModalMessage(message);
    setIsConfirmation(isConfirmation);
    setModalOnConfirm(() => onConfirm);
    setModalIsOpen(true);
  };

  const eraseAllTransactions = () => {
    openModal("Are you sure you want to erase all transactions?", true, async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/erase_all_transactions.php`);
        if (data.success) {
          openModal("All transactions have been erased successfully!");
        } else {
          openModal(`Error: ${data.message || "Failed to erase transactions."}`);
        }
      } catch (error) {
        console.error("Error erasing transactions:", error);
        openModal("An unexpected error occurred. Please try again.");
      } finally {
        setModalIsOpen(false);
      }
    });
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-2xl transform translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <h1
          className="text-6xl font-extrabold text-center mb-12 text-gray-800 drop-shadow-md"
          data-aos="fade-down"
        >
          <i>Budget Tracker</i>
        </h1>

        <Modal
          isOpen={modalIsOpen}
          message={modalMessage}
          onClose={() => setModalIsOpen(false)}
          onConfirm={modalOnConfirm}
          isConfirmation={isConfirmation}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Dashboard Section */}
          <div
            ref={dashboardRef}
            className="lg:col-span-7 bg-white rounded-2xl shadow-md p-10 border-l-8 border-blue-600 hover:shadow-2xl hover:border-blue-700 transition-all duration-300 hover:scale-105 relative"
            data-aos="fade-right"
          >
            <div className="absolute top-4 right-4 text-blue-600">
              <FaExchangeAlt size={28} />
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4 relative">
              Transactions
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-600 rounded-full animate-pulse"></span>
            </h2>
            <p className="text-gray-600 mb-6">
              <i>Manage your daily expenses efficiently.</i>
            </p>

            {/* Start Over Button */}
            <div className="flex justify-end">
              <button
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 transition-transform duration-300 hover:scale-105"
                onClick={eraseAllTransactions}
              >
                <FaCheckCircle size={18} /> Start Over
              </button>
            </div>

            <Dashboard />
          </div>

          {/* Right Section */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            {/* Paid Overview */}
            <div
              className="bg-white rounded-2xl shadow-md p-10 border-l-8 border-green-600 hover:shadow-2xl hover:border-green-700 transition-all duration-300 hover:scale-105 relative"
              data-aos="fade-up"
            >
              <div className="absolute top-4 right-4 text-green-600">
                <FaCheckCircle size={28} />
              </div>
              <h2 className="text-3xl font-bold text-green-700 mb-4 relative">
                Paid Overview
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-green-600 rounded-full animate-pulse"></span>
              </h2>
              <TransactionOverview />
            </div>

            {/* Spending Analysis */}
            <div
              className="bg-white rounded-2xl shadow-md p-10 border-l-8 border-yellow-600 hover:shadow-2xl hover:border-yellow-700 transition-all duration-300 hover:scale-105 relative"
              data-aos="fade-left"
            >
              <div className="absolute top-4 right-4 text-yellow-600">
                <FaChartPie size={28} />
              </div>
              <h2 className="text-3xl font-bold text-yellow-700 mb-4 relative">
                Spending Analysis
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-yellow-600 rounded-full animate-pulse"></span>
              </h2>
              <SpendingAnalysis />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div
          ref={transactionListRef}
          className="mt-12 bg-white rounded-2xl shadow-md p-10 border-l-8 border-purple-600 hover:shadow-2xl hover:border-purple-700 transition-all duration-300 hover:scale-105 relative"
          data-aos="fade-up"
        >
          <div className="absolute top-4 right-4 text-purple-600">
            <FaHistory size={28} />
          </div>
          <h2 className="text-3xl font-bold text-purple-700 mb-4 relative">
            History
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-purple-600 rounded-full animate-pulse"></span>
          </h2>
          <p className="text-gray-600 mb-6">
            <i>View all your transactions.</i>
          </p>
          <TransactionList />
        </div>
      </div>
    </div>
  );
};

export default Home;
