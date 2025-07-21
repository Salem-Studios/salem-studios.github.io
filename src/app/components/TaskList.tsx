'use client';
import { useState } from 'react';

export default function TaskList() {
    const [tasks, setTasks] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [checked, setChecked] = useState<boolean[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAddTask = () => {
        if (!input.trim()) return;
        if (tasks.length >= 50) {
            setError("You've reached maximum number of tasks");
            return;
        }
        setTasks([...tasks, input]);
        setChecked([...checked, false]); // Initialize checkbox state
        setInput('');
        setError('');

    };

    const handleDeleteTask = (index: number) => {
        const newTasks = [...tasks];
        const newChecked = [...checked];
        newTasks.splice(index, 1);
        newChecked.splice(index, 1);
        setTasks(newTasks);
        setChecked(newChecked);
        setError('');
    };

    const handleCheck = (index: number) => {
        const newChecked = [...checked];
        newChecked[index] = !newChecked[index];
        setChecked(newChecked);
    };
    const handleEditTask = (index: number) => {
        setEditingIndex(index);
        setEditingValue(tasks[index]);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingValue(e.target.value);
    };

    const handleEditSubmit = (index: number) => {
        if (!editingValue.trim()) return;
        const newTasks = [...tasks];
        newTasks[index] = editingValue;
        setTasks(newTasks);
        setEditingIndex(null);
        setEditingValue('');
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            handleEditSubmit(index);
        } else if (e.key === 'Escape') {
            setEditingIndex(null);
            setEditingValue('');
        }
    };
    return (
        <div className="flex flex-col items-center space-y-4">
            <h2 className="text-4xl mb-4">Tasks</h2>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-64 p-2 border border-[#bfa77a] bg-[#3e2a1e] text-white"
                    placeholder="Add a new task ..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask();
                    }}
                    disabled={tasks.length >= 50}
                />
                <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-[#654532] border border-[#bfa77a] hover:bg-[#7b5b43] text-white"
                    disabled={tasks.length >= 50}
                >
                    Add
                </button>
            </div>
            {error && <div className="text-red-400">{error}</div>}
            <ul className="w-full max-w-md space-y-2 max-h-32 overflow-y-auto">
                {tasks.map((task, index) => (
                    <li key={index} className="flex justify-between items-center bg-[#462a1f] p-3 ">
                        <div className="flex items-center space-x-2">
                            <label className="relative flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checked[index] || false}
                                    onChange={() => handleCheck(index)}
                                    className="peer appearance-none h-4 w-4 border border-[#bfa77a] bg-[#3e2a1e] checked:bg-[#bfa77a] checked:border-[#bfa77a] transition-colors"
                                    style={{
                                        minWidth: '1rem',
                                        minHeight: '1rem',
                                    }}
                                />
                                <span
                                    className="pointer-events-none absolute left-0 top-0 h-4 w-4 border border-[#bfa77a] bg-[#3e2a1e] peer-checked:bg-[#bfa77a] flex items-center justify-center"
                                >
                                    {/* Checkmark SVG */}
                                    <svg
                                        className={`peer-checked:block text-[#3e2a1e] ${checked[index] ? '' : 'hidden'}`}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M4 8.5L7 11.5L12 6.5"
                                            stroke="#3e2a1e"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </label>
                            {editingIndex === index ? (
                                <input
                                    type="text"
                                    value={editingValue}
                                    onChange={handleEditChange}
                                    onBlur={() => handleEditSubmit(index)}
                                    onKeyDown={(e) => handleEditKeyDown(e, index)}
                                    autoFocus
                                    className="ml-1 px-1 py-0.5 bg-[#3e2a1e] border border-[#bfa77a] text-white w-40"
                                />
                            ) : (
                                <span
                                    className={`ml-1 transition-all duration-200 ${checked[index] ? 'line-through text-[#bfa77a]/50' : ''
                                        }`}
                                    onDoubleClick={() => handleEditTask(index)}
                                    title="Double-click to edit"
                                    tabIndex={0}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {task}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => handleDeleteTask(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            x
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}