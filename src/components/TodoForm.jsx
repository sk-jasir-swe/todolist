import { useState } from 'react'
import { useTodo } from '../context/todoContext';

function TodoForm() {
    const [todo, setTodo]= useState("")
    const {addTodo} =useTodo()
    const add =(e)=>{
        e.preventDefault()

        if (!todo.trim()) return
        addTodo({todo, completed: false})
        setTodo("")
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
            <button type="submit" className="add-button">
                Add task <span aria-hidden="true">+</span>
            </button>
        </form>
    );
}

export default TodoForm;

