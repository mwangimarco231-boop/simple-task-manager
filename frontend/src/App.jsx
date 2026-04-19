import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import { taskAPI } from './services/api';
import { CheckCircle, Circle, Trash2, LogOut, Plus, Calendar, FolderOpen, User, TrendingUp, X, Edit2, Save, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const [showLogin, setShowLogin] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
    const [projects, setProjects] = useState([
        { id: 1, name: 'Banking app', description: 'Create a design and development', members: 5, progress: 40 },
        { id: 2, name: 'Cambo website', description: 'Design of 5 pages for website', members: 5, progress: 100 },
    ]);
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Personal' });
    const [newProject, setNewProject] = useState({ name: '', description: '', members: 1 });
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(['Study', 'Design', 'Studying', 'Work', 'Personal']);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
            // Get username from localStorage if stored during login
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) setUsername(storedUsername);
        }
    }, [isAuthenticated]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await taskAPI.getTasks();
            // Add category to tasks if not exists
            const tasksWithCategory = response.data.map(task => ({
                ...task,
                category: task.category || 'Personal'
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
        if (!newTask.title.trim()) return;

        try {
            const response = await taskAPI.createTask({
                title: newTask.title,
                description: newTask.description
            });
            const taskWithCategory = {
                ...response.data,
                category: newTask.category
            };
            setTasks([taskWithCategory, ...tasks]);
            setNewTask({ title: '', description: '', category: 'Personal' });
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleComplete = async (taskId, completed) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            await taskAPI.updateTask(taskId, { ...task, completed: !completed });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Delete this task?')) {
            try {
                await taskAPI.deleteTask(taskId);
                setTasks(tasks.filter(t => t.id !== taskId));
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleAddProject = () => {
        if (!newProject.name.trim()) return;
        setProjects([...projects, {
            id: projects.length + 1,
            ...newProject,
            progress: 0
        }]);
        setNewProject({ name: '', description: '', members: 1 });
        setShowProjectForm(false);
    };

    const updateProjectProgress = (projectId, newProgress) => {
        setProjects(projects.map(p =>
            p.id === projectId ? { ...p, progress: Math.min(100, Math.max(0, newProgress)) } : p
        ));
    };

    const deleteProject = (projectId) => {
        if (window.confirm('Delete this project?')) {
            setProjects(projects.filter(p => p.id !== projectId));
        }
    };

    const addCategory = () => {
        const newCategory = prompt('Enter new category name:');
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    };

    const removeCategory = (categoryToRemove) => {
        if (categoryToRemove === 'Personal') {
            alert("Cannot remove 'Personal' category");
            return;
        }
        if (confirm(`Remove "${categoryToRemove}" category? Tasks in this category will be moved to "Personal".`)) {
            // Move tasks from this category to Personal
            setTasks(tasks.map(task =>
                task.category === categoryToRemove
                    ? { ...task, category: 'Personal' }
                    : task
            ));
            // Remove category
            setCategories(categories.filter(c => c !== categoryToRemove));
            if (selectedCategory === categoryToRemove) {
                setSelectedCategory('all');
            }
        }
    };

    const updateTaskCategory = (taskId, newCategory) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, category: newCategory } : task
        ));
    };

    const getFilteredTasks = () => {
        if (selectedCategory === 'all') return tasks;
        return tasks.filter(task => task.category === selectedCategory);
    };

    const getTasksByCategory = (category) => {
        return tasks.filter(task => task.category === category && !task.completed);
    };

    // Calendar functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(i);
        }

        return days;
    };

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const getTasksForDate = (date) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        return tasks.filter(task => {
            const taskDate = new Date(task.created_at).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
    };


    if (!isAuthenticated) {
        return (
            <div>
                {showLogin ? (
                    <Login onSwitchToRegister={() => setShowLogin(false)} />
                ) : (
                    <Register onSwitchToLogin={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    const daysInMonth = getDaysInMonth(currentDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ProTask
                        </h1>
                        <p className="text-purple-200 mt-1">Today</p>
                        <p className="text-sm text-purple-300/60">
                            {currentDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition border border-white/20"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Calendar & Projects */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Calendar Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={20} className="text-purple-300" />
                                    <h3 className="font-semibold text-white">Calendar</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => changeMonth(-1)} className="text-purple-300 hover:text-white p-1">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-white text-sm font-medium">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                    <button onClick={() => changeMonth(1)} className="text-purple-300 hover:text-white p-1">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="text-purple-300 text-xs font-medium py-1">{day}</div>
                                ))}
                                {daysInMonth.map((date, i) => (
                                    <div key={i} className="py-1">
                                        {date && (
                                            <button
                                                onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                                                className={`text-xs rounded-lg w-8 h-8 flex items-center justify-center mx-auto transition cursor-pointer
                                                    ${date === 17 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' :
                                                        getTasksForDate(date).length > 0 ? 'bg-purple-500/30 text-white font-bold' :
                                                            'text-purple-200 hover:bg-white/10'}`}
                                            >
                                                {date}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {selectedDate && getTasksForDate(selectedDate).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-purple-300 mb-2">Tasks for {selectedDate}:</p>
                                    {getTasksForDate(selectedDate).map(task => (
                                        <p key={task.id} className="text-sm text-white">{task.title}</p>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 space-y-2 pt-4 border-t border-white/10">
                                <p className="text-sm text-purple-200">🎂 <span className="font-medium">Father's Happy birthday</span></p>
                                <p className="text-sm text-purple-200">📝 <span className="font-medium">Exam consultation</span></p>
                            </div>
                        </div>

                        {/* Projects Card */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FolderOpen size={20} className="text-purple-300" />
                                    <h3 className="font-semibold text-white">Projects</h3>
                                </div>
                                <button
                                    onClick={() => setShowProjectForm(!showProjectForm)}
                                    className="text-purple-300 hover:text-white text-sm"
                                >
                                    + Add
                                </button>
                            </div>

                            {showProjectForm && (
                                <div className="mb-4 p-4 bg-white/5 rounded-xl space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Project name"
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-purple-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-purple-500"
                                    />
                                    <button
                                        onClick={handleAddProject}
                                        className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {projects.map(project => (
                                    <div key={project.id}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-white">{project.name}</span>
                                            <div className="flex gap-2">
                                                <span className="text-purple-300 text-xs">{project.progress}%</span>
                                                <button onClick={() => deleteProject(project.id)} className="text-red-400 hover:text-red-300 text-xs">×</button>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-purple-300/60 mt-1">{project.description} · {project.members} members</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => updateProjectProgress(project.id, project.progress - 10)} className="text-xs text-purple-300 hover:text-white">-10%</button>
                                            <button onClick={() => updateProjectProgress(project.id, project.progress + 10)} className="text-xs text-purple-300 hover:text-white">+10%</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Tasks */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Hi, {username}!</h2>
                                        <p className="text-purple-100 mt-1">You have {pendingTasks.length} pending tasks</p>
                                    </div>
                                    <User size={48} className="text-white/80" />
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <div className="bg-white/20 rounded-lg px-3 py-1">
                                        <p className="text-xs">Completed</p>
                                        <p className="text-xl font-bold">{completedTasks.length}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-3 py-1">
                                        <p className="text-xs">Pending</p>
                                        <p className="text-xl font-bold">{pendingTasks.length}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-3 py-1">
                                        <p className="text-xs">Total</p>
                                        <p className="text-xl font-bold">{tasks.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">Categories</h3>
                                <button onClick={addCategory} className="text-purple-300 hover:text-white text-sm">+ Add</button>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-4 py-2 rounded-xl transition ${selectedCategory === 'all'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                                        }`}
                                >
                                    All ({tasks.length})
                                </button>
                                {categories.map(cat => (
                                    <div key={cat} className="relative group">
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-xl transition ${selectedCategory === cat
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-white/10 text-purple-200 hover:bg-white/20'
                                                }`}
                                        >
                                            {cat} ({getTasksByCategory(cat).length})
                                        </button>
                                        {cat !== 'Personal' && (
                                            <button
                                                onClick={() => removeCategory(cat)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Tasks Display */}
                        {selectedCategory !== 'all' && (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                                <h3 className="font-semibold text-white mb-4">{selectedCategory} Tasks</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {tasks.filter(t => t.category === selectedCategory && !t.completed).length === 0 ? (
                                        <p className="text-center text-purple-300/60 py-4">No pending tasks in {selectedCategory}</p>
                                    ) : (
                                        tasks.filter(t => t.category === selectedCategory && !t.completed).map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <button onClick={() => handleToggleComplete(task.id, task.completed)}>
                                                        <Circle size={20} className="text-purple-300" />
                                                    </button>
                                                    <div>
                                                        <p className="font-medium text-white">{task.title}</p>
                                                        {task.description && <p className="text-sm text-purple-300/60">{task.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={task.category}
                                                        onChange={(e) => updateTaskCategory(task.id, e.target.value)}
                                                        className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20"
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat} value={cat} className="bg-purple-900">{cat}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => handleDeleteTask(task.id)} className="text-purple-300/50 hover:text-red-400">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Today's Tasks */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                            <h3 className="font-semibold text-white mb-4">Add New Task</h3>

                            {/* Add Task Form */}
                            <form onSubmit={handleAddTask} className="mb-6">
                                <div className="flex gap-3 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Task title..."
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="flex-1 px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:border-purple-500 placeholder-purple-300/50"
                                        required
                                    />
                                    <select
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                        className="px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-purple-900">{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:border-purple-500 placeholder-purple-300/50"
                                />
                            </form>

                            <h3 className="font-semibold text-white mb-4 mt-6">All Tasks</h3>

                            {/* Task List */}
                            {loading ? (
                                <div className="text-center py-8 text-purple-200">Loading...</div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {getFilteredTasks().map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                                            <div className="flex items-center gap-3 flex-1">
                                                <button onClick={() => handleToggleComplete(task.id, task.completed)}>
                                                    {task.completed ? (
                                                        <CheckCircle size={20} className="text-green-400" />
                                                    ) : (
                                                        <Circle size={20} className="text-purple-300" />
                                                    )}
                                                </button>
                                                <div>
                                                    <p className={`font-medium ${task.completed ? 'line-through text-purple-300/50' : 'text-white'}`}>
                                                        {task.title}
                                                    </p>
                                                    {task.description && (
                                                        <p className="text-sm text-purple-300/60">{task.description}</p>
                                                    )}
                                                    <span className="text-xs text-purple-400">{task.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={task.category}
                                                    onChange={(e) => updateTaskCategory(task.id, e.target.value)}
                                                    className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat} className="bg-purple-900">{cat}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleDeleteTask(task.id)} className="text-purple-300/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {getFilteredTasks().length === 0 && (
                                        <p className="text-center text-purple-300/60 py-8">No tasks yet. Add your first task!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default App;