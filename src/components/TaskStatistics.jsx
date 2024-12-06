// components/TaskStatistics.jsx
import React, { useState, useEffect } from "react";

const TaskStatistics = () => {
  const [tasks, setTasks] = useState([]); // State to store the list of tasks
  const [completedTasks, setCompletedTasks] = useState(0); // State to store the count of completed tasks
  const [totalTasks, setTotalTasks] = useState(0); // State to store the total count of tasks

  useEffect(() => {
    // Fetch task data from the server (replace with the actual API endpoint)
    fetch("http://localhost/budget-tracker_backend/Backend/api/get_transactions.php")
      .then((res) => res.json()) // Parse the response JSON
      .then((data) => {
        setTasks(data); // Update tasks state with fetched data
        const completed = data.filter((task) => task.status === "completed").length; // Count completed tasks
        setCompletedTasks(completed); // Update the completed tasks count state
        setTotalTasks(data.length); // Update the total tasks count state
      });
  }, []); // Runs once after the component mounts

  // Calculate the progress percentage for the tasks
  const progressPercentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0; // Avoid division by zero

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-4">Task Statistics</h2>
      <div className="mb-4">
        <p>Total Tasks: {totalTasks}</p>
        <p>Completed Tasks: {completedTasks}</p>
        <p>Remaining Tasks: {totalTasks - completedTasks}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-green-500 h-4 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-center">{Math.round(progressPercentage)}% Completed</p>
    </div>
  );
};

export default TaskStatistics;
