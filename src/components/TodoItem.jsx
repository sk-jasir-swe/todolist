import { useState } from 'react'
import { useTodo } from '../context/todoContext';

function TodoItem({ todo }) {
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










    return (
        <div className={`todo-item ${todo.completed ? "todo-item-complete" : ""}`}>
            <input
                type="checkbox"
                className="todo-check"
                aria-label={`Mark ${todo.todo} as complete`}
                checked={todo.completed}
                onChange={toggleCompleted}
            />
            <input
                type="text"
                className={`todo-text ${isTodoEditable ? "todo-text-editing" : ""}`}
                aria-label="Todo text"
                value={todoMessage}
                onChange={(e) => setTodoMessage(e.target.value)}
                readOnly={!isTodoEditable}
            />
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
        </div>
    );
}

export default TodoItem;
