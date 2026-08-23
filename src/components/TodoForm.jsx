import { useState } from 'react'
import { useTodo } from '../context/todoContext';

function TodoForm() {
    const [todo, setTodo] = useState("")
    const [category, setCategory] = useState("Personal")
    const [priority, setPriority] = useState("Medium")
    const [dueDate, setDueDate] = useState("")
    const {addTodo} =useTodo()
    const add =(e)=>{
        e.preventDefault()

        if (!todo.trim()) return
        addTodo({todo: todo.trim(), category, priority, dueDate, completed: false})
        setTodo("")
        setCategory("Personal")
        setPriority("Medium")
        setDueDate("")
    }









    return (
        <form onSubmit={add} className="todo-form">
            <input
                type="text"
                placeholder="What needs your attention?"
                aria-label="New todo"
                className="todo-input"
                value={todo}
                onChange={(e)=>setTodo(e.target.value)}
            />
            <div className="todo-options">
                <select aria-label="Task category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Personal</option>
                    <option>Work</option>
                    <option>Study</option>
                    <option>Other</option>
                </select>
                <select aria-label="Task priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
                <input type="date" aria-label="Task due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <button type="submit" className="add-button">
                Add task <span aria-hidden="true">+</span>
            </button>
        </form>
    );
}

export default TodoForm;

