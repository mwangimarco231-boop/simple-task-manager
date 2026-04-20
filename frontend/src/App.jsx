import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import { taskAPI } from './services/api';
import { CheckCircle, Circle, Trash2, LogOut, Plus, Calendar, FolderOpen, User } from 'lucide-react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const [showLogin, setShowLogin] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Personal' });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories] = useState(['Study', 'Design', 'Studying', 'Work', 'Personal']);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
        }
    }, [isAuthenticated]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await taskAPI.getTasks();
            const tasksWithCategory = response.data.map((task) => ({
                ...task,
                category: task.category || 'Personal',
            }));
            setTasks(tasksWithCategory);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setTasks([]);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();

        if (!newTask.title.trim()) {
            return;
        }

        try {
            const response = await taskAPI.createTask({
                title: newTask.title,
                description: newTask.description,
            });

            const taskWithCategory = {
                ...response.data,
                category: newTask.category,
            };

            setTasks([taskWithCategory, ...tasks]);
            setNewTask({ title: '', description: '', category: 'Personal' });
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleComplete = async (taskId, completed) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
            return;
        }

        try {
            await taskAPI.updateTask(taskId, { ...task, completed: !completed });
            setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t)));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) {
            return;
        }

        try {
            await taskAPI.deleteTask(taskId);
            setTasks(tasks.filter((t) => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const updateTaskCategory = (taskId, newCategory) => {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, category: newCategory } : task)));
    };

    const getFilteredTasks = () => {
        if (selectedCategory === 'all') {
            return tasks;
        }
        return tasks.filter((task) => task.category === selectedCategory);
    };

    const getTasksByCategory = (cat) => tasks.filter((task) => task.category === cat && !task.completed).length;
    const completedTasks = tasks.filter((task) => task.completed);
    const pendingTasks = tasks.filter((task) => !task.completed);

    if (!isAuthenticated) {
        return showLogin ? (
            <Login onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
            <Register onSwitchToLogin={() => setShowLogin(true)} />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="lg:hidden fixed top-4 right-4 z-50">
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-white/10 backdrop-blur-lg p-2 rounded-xl text-white"
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            <div
                className={`fixed lg:relative z-40 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 ease-in-out w-80 lg:w-80 h-full lg:h-auto bg-white/10 backdrop-blur-lg border-r border-white/20 overflow-y-auto`}
            >
                <div className="p-6">
                    <div className="bg-white/10 rounded-2xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-purple-300" />
                            <h3 className="font-semibold text-white">Calendar</h3>
                        </div>
                        <div className="text-center mb-4">
                            <p className="text-purple-200 text-sm">April 2026</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                                <div key={day} className="text-purple-300 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {Array.from({ length: 30 }, (_, index) => {
                                const date = index + 1;
                                return (
                                    <div
                                        key={date}
                                        className={`py-1 rounded-lg ${date === 17 ? 'bg-purple-500 text-white' : 'text-purple-200'}`}
                                    >
                                        {date}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FolderOpen size={20} className="text-purple-300" />
                            <h3 className="font-semibold text-white">Projects</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white">Banking app</span>
                                    <span className="text-purple-300">40%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '40%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white">Cambo website</span>
                                    <span className="text-green-400">Completed</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:ml-80">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Task Manager
                            </h1>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition text-sm"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-xl mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Hi, {username}!</h2>
                                <p className="text-purple-100 text-sm mt-1">You have {pendingTasks.length} pending tasks</p>
                            </div>
                            <User size={40} className="text-white/80" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                                <p className="text-xs">Completed</p>
                                <p className="text-xl font-bold">{completedTasks.length}</p>
                            </div>
                            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                                <p className="text-xs">Pending</p>
                                <p className="text-xl font-bold">{pendingTasks.length}</p>
                            </div>
                            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                                <p className="text-xs">Total</p>
                                <p className="text-xl font-bold">{tasks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 mb-6 overflow-x-auto">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h3 className="font-semibold text-white text-sm">Categories</h3>
                            <button type="button" className="text-purple-300 text-xs">
                                + Add
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs transition ${selectedCategory === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200'}`}
                            >
                                All ({tasks.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs transition ${selectedCategory === cat ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-200'}`}
                                >
                                    {cat} ({getTasksByCategory(cat)})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 mb-6">
                        <h3 className="font-semibold text-white mb-3 text-sm">Add New Task</h3>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Task title..."
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none text-sm"
                                    required
                                />
                                <select
                                    value={newTask.category}
                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                    className="px-3 py-2 bg-white/10 text-white rounded-xl border border-white/20 text-sm"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm flex items-center justify-center gap-1"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 text-sm"
                            />
                        </form>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5">
                        <h3 className="font-semibold text-white mb-3 text-sm">
                            {selectedCategory === 'all' ? 'All Tasks' : `${selectedCategory} Tasks`}
                        </h3>
                        {loading ? (
                            <div className="text-center py-8 text-purple-200 text-sm">Loading...</div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {getFilteredTasks().slice(0, 10).map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleComplete(task.id, task.completed)}
                                                className="shrink-0"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle size={18} className="text-green-400" />
                                                ) : (
                                                    <Circle size={18} className="text-purple-300" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm truncate ${task.completed ? 'line-through text-purple-300/50' : 'text-white'}`}>
                                                    {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-xs text-purple-300/60 truncate">{task.description}</p>
                                                )}
                                                <span className="text-xs text-purple-400">{task.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0 items-center">
                                            <select
                                                value={task.category}
                                                onChange={(e) => updateTaskCategory(task.id, e.target.value)}
                                                className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="text-purple-300/50 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {getFilteredTasks().length === 0 && (
                                    <p className="text-center text-purple-300/60 py-8 text-sm">No tasks yet. Add your first task!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;