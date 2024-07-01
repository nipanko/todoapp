import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateTask from './CreateTask.js';
import Task from './Task.js';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/tasks`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const createTask = async (taskData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/tasks`, taskData);
            setTasks([...tasks, response.data]);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/tasks/${taskId}`);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    return (
        <div>
            <h1>To Do List</h1>
            <h3>Tasks</h3>
            <ul>
                {tasks.map(task => (
                    <Task key={task.id} taskId={task.id} taskName={task.name} taskCompleted={task.completed} deleteTask={deleteTask} />
                ))}
            </ul>
            <CreateTask createTask={createTask} />
        </div>
    );
};

export default Tasks;
