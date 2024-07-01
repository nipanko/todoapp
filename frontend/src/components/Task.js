import React, { useState } from 'react';
import axios from 'axios';

const Task = ({ taskId, taskName, taskCompleted, deleteTask }) => {
    const [taskCurrentCompleted, setTaskCompleted] = useState(taskCompleted);

    const markComplete = async (taskId) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}/complete`);
            setTaskCompleted("true");
        } catch (error) {
            console.error('Error marking task complete:', error);
        }
    }

    const markIncomplete = async (taskId) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}/uncomplete`);
            setTaskCompleted("false");
        } catch (error) {
            console.error('Error marking task incomplete:', error);
        }
    }

    return (
        <li key={taskId} className="task d-flex align-items-center gap">
            <input
                className="check-input"
                type="checkbox"
                checked={taskCurrentCompleted === "true"}
                onChange={() => taskCurrentCompleted === "true" ? markIncomplete(taskId) : markComplete(taskId)}
            />
            <div className={taskCurrentCompleted === "true" ? "task-success" : "task-danger"}>
                {taskName}
            </div>
            <button className="btn btn-danger" onClick={() => deleteTask(taskId)}>Delete Task</button>
        </li>
    );
};

export default Task;
