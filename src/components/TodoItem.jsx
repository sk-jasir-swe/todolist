import { useState } from 'react'
import { useTodo } from '../context/todoContext';

function TodoItem({ todo, canMoveUp, canMoveDown, onMove }) {
  const [isTodoEditable, setIsTodoEditable] = useState(false)

  const [todoMessage, setTodoMessage] = useState(todo.todo)
    const { updateTodo, deleteTodo, toggleComplete} = useTodo()
    

  const editTodo =()=>{
    updateTodo(todo.id, {...todo, todo: todoMessage})
    setIsTodoEditable(false)
  }
  const toggleCompleted = ()=>{
    toggleComplete(todo.id)
  }

    const isOverdue = todo.dueDate && !todo.completed && new Date(`${todo.dueDate}T23:59:59`) < new Date()
    const dueLabel = todo.dueDate ? new Date(`${todo.dueDate}T00:00:00`).toLocaleDateString(undefined, {month: "short", day: "numeric"}) : ""










    return (
        <div className={`todo-item ${todo.completed ? "todo-item-complete" : ""}`}>
            <input
                type="checkbox"
                className="todo-check"
                aria-label={`Mark ${todo.todo} as complete`}
                checked={todo.completed}
                onChange={toggleCompleted}
            />
            <div className="todo-details">
                <input
                    type="text"
                    className={`todo-text ${isTodoEditable ? "todo-text-editing" : ""}`}
                    aria-label="Todo text"
                    value={todoMessage}
                    onChange={(e) => setTodoMessage(e.target.value)}
                    readOnly={!isTodoEditable}
                />
                <div className="todo-meta">
                    <span className="category-tag">{todo.category}</span>
                    <span className={`priority-tag priority-${todo.priority.toLowerCase()}`}>{todo.priority}</span>
                    {dueLabel && <span className={isOverdue ? "due-tag due-overdue" : "due-tag"}>{isOverdue ? "Overdue" : `Due ${dueLabel}`}</span>}
                </div>
            </div>
            <button
                type="button"
                className="item-button"
                aria-label={isTodoEditable ? "Save todo" : "Edit todo"}
                onClick={() => {
                    if (todo.completed) return;

                    if (isTodoEditable) {
                        editTodo();
                    } else setIsTodoEditable((prev) => !prev);
                }}
                disabled={todo.completed}
            >
                {isTodoEditable ? "Save" : "Edit"}
            </button>
            <button
                type="button"
                className="item-button delete-button"
                aria-label="Delete todo"
                onClick={() => deleteTodo(todo.id)}
            >
                Delete
            </button>
                        <div className="move-controls" aria-label="Move task">
                            <button type="button" className="move-button" aria-label="Move task up" onClick={() => onMove(-1)} disabled={!canMoveUp}>
                                Up
                            </button>
                            <button type="button" className="move-button" aria-label="Move task down" onClick={() => onMove(1)} disabled={!canMoveDown}>
                                Down
                            </button>
                        </div>
        </div>
    );
}

export default TodoItem;
