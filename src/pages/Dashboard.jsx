
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null); 
  const [filter, setFilter] = useState(''); 
  const [sortOrder, setSortOrder] = useState(''); 
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'Pending',
    assignee: '',
    startDate: '',
    dueDate: '',
    timeSpent: 0, 
  });
  const [timer, setTimer] = useState({}); 

  const addOrUpdateTask = () => {
    if (isEditing !== null) {
      setTasks(tasks.map((task, index) => (index === isEditing ? { ...newTask } : task)));
      setIsEditing(null);
    } else {
      const task = { ...newTask, id: tasks.length + 1 };
      setTasks([...tasks, task]);
    }
    setIsModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'Low',
      status: 'Pending',
      assignee: '',
      startDate: '',
      dueDate: '',
      timeSpent: 0,
    });
  };

  const editTask = (index) => {
    setIsEditing(index);
    setNewTask(tasks[index]);
    setIsModalOpen(true);
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const startStopTimer = (index) => {
    if (timer[index]) {
      clearInterval(timer[index]);
      setTimer((prevTimer) => {
        const newTimer = { ...prevTimer };
        delete newTimer[index];
        return newTimer;
      });
    } else {
      const interval = setInterval(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task, i) =>
            i === index ? { ...task, timeSpent: task.timeSpent + 1 } : task
          )
        );
      }, 60000); 
      setTimer((prevTimer) => ({ ...prevTimer, [index]: interval }));
    }
  };

  const applyFilter = (criteria) => setFilter(criteria);
  const applySort = (order) => setSortOrder(order);

  const sortedFilteredTasks = tasks
    .filter((task) => (filter ? task.priority === filter || task.status === filter : true))
    .sort((a, b) => {
      if (sortOrder === 'priority') return a.priority.localeCompare(b.priority);
      if (sortOrder === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const trendData = {
    labels: ['Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30'],
    datasets: [
      {
        label: 'Concurrent Tasks',
        data: [2, 3, 1, 4, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add Task/Bug
      </button>

      {}
      <div className="mb-6 flex gap-4">
        <button onClick={() => applyFilter('Low')} className="bg-gray-200 p-2 rounded">Low Priority</button>
        <button onClick={() => applyFilter('High')} className="bg-gray-200 p-2 rounded">High Priority</button>
        <button onClick={() => applyFilter('In Progress')} className="bg-gray-200 p-2 rounded">In Progress</button>
        <button onClick={() => applySort('priority')} className="bg-gray-200 p-2 rounded">Sort by Priority</button>
        <button onClick={() => applySort('status')} className="bg-gray-200 p-2 rounded">Sort by Status</button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tasks/Bugs</h2>
        <div className="bg-white shadow-md rounded-lg p-4">
          {sortedFilteredTasks.map((task, index) => (
            <div key={task.id} className="mb-4 border-b pb-2">
              <h3 className="text-xl font-bold">{task.title}</h3>
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">Priority: {task.priority}</p>
              <p className="text-sm text-gray-500">Status: {task.status}</p>
              <p className="text-sm text-gray-500">Assignee: {task.assignee}</p>
              <p className="text-sm text-gray-500">Start Date: {task.startDate}</p>
              <p className="text-sm text-gray-500">Due Date: {task.dueDate}</p>
              <p className="text-sm text-gray-500">Time Spent: {task.timeSpent} min</p>
              <button onClick={() => startStopTimer(index)} className="mr-2 text-blue-500">
                {timer[index] ? 'Stop Timer' : 'Start Timer'}
              </button>
              <button onClick={() => editTask(index)} className="mr-2 text-green-500">Edit</button>
              <button onClick={() => deleteTask(index)} className="flex items-center text-red-500 hover:text-red-700"> Delete</button>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Task Trends</h2>
        <div className="bg-white shadow-md rounded-lg p-4">
          <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-semibold mb-4">{isEditing !== null ? 'Edit Task/Bug' : 'Add New Task/Bug'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); addOrUpdateTask(); }}>
              <input type="text" name="title" placeholder="Title" value={newTask.title} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500" required />
              <textarea name="description" placeholder="Description" value={newTask.description} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500" required></textarea>
              <select name="priority" value={newTask.priority} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select name="status" value={newTask.status} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input type="text" name="assignee" placeholder="Assignee" value={newTask.assignee} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500" required />
              <input type="date" name="startDate" placeholder="Start Date" value={newTask.startDate} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500" required />
              <input type="date" name="dueDate" placeholder="Due Date" value={newTask.dueDate} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:border-blue-500" required />
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">{isEditing !== null ? 'Update Task' : 'Add Task'}</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full bg-red-500 text-white p-2 mt-2 rounded-lg hover:bg-red-600">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

