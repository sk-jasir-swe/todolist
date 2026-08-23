import { useEffect, useState } from "react"
import { todoProvider as TodoProvider } from "./context/todoContext"
import TodoForm from "./components/TodoForm"
import TodoItem from "./components/TodoItem"
function App() {
  const [todos,setTodos]=useState (() => JSON.parse(localStorage.getItem("todos") || "[]"))
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")

  const addTodo =(todo)=>{
    setTodos ((prev)=> [{id : Date.now(),...todo},...prev])
  }

  const updateTodo = (id, todo)=>{setTodos((prev)=> prev.map((prevTodo)=>(prevTodo.id === id ? todo:prevTodo)))}

const deleteTodo = (id )=>{
  setTodos((prev)=> prev.filter((todo)=>todo.id !=id))
}

const toggleComplete = (id)=>{setTodos((prev)=>  prev.map((prevTodo)=> prevTodo.id === id  ? {...prevTodo, completed :!prevTodo.completed }: prevTodo  ) )}

const moveTodo = (id, direction, visibleIds) => {
  setTodos((prev) => {
    const currentVisibleIndex = visibleIds.indexOf(id)
    const targetVisibleIndex = currentVisibleIndex + direction
    if (currentVisibleIndex < 0 || targetVisibleIndex < 0 || targetVisibleIndex >= visibleIds.length) return prev

    const targetId = visibleIds[targetVisibleIndex]
    const currentIndex = prev.findIndex((todo) => todo.id === id)
    const targetIndex = prev.findIndex((todo) => todo.id === targetId)
    const reordered = [...prev]
    ;[reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]]
    return reordered
  })
  setSortOrder("manual")
}


useEffect(()=>{
  localStorage.setItem("todos", JSON.stringify(todos))
},[todos])

  const visibleTodos = [...todos]
    .filter((todo) => todo.todo.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .sort((firstTodo, secondTodo) => sortOrder === "manual" ? 0 : sortOrder === "newest"
      ? secondTodo.id - firstTodo.id
      : firstTodo.id - secondTodo.id)

  return (
  <TodoProvider value ={{todos,addTodo, updateTodo,deleteTodo,toggleComplete,moveTodo}}>
   <main className="app-shell">
     <div className="app-noise" aria-hidden="true" />
     <section className="todo-board">
       <header className="board-header">
         <div>
           <p className="eyebrow">Daily command center</p>
           <h1>Make room for what matters.</h1>
           <p className="board-subtitle">A small, calm list for the things worth finishing today.</p>
         </div>
         <div className="date-chip"><span className="date-dot" /> Focus mode</div>
       </header>

       <div className="stats-row" aria-label="Todo summary">
         <div className="stat-card"><strong>{todos.length}</strong><span>Total tasks</span></div>
         <div className="stat-card"><strong>{todos.filter((todo) => todo.completed).length}</strong><span>Completed</span></div>
         <div className="stat-card stat-card-accent"><strong>{todos.filter((todo) => !todo.completed).length}</strong><span>Still to do</span></div>
       </div>

       <div className="composer-wrap">
         <p className="section-label">Add a task</p>
         <TodoForm />
       </div>

       <div className="list-tools">
         <label className="search-box">
           <input
             type="search"
             placeholder="Search your tasks"
             aria-label="Search your tasks"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </label>
         <div className="sort-controls" aria-label="Sort tasks">
           <button
             type="button"
             className={`sort-button ${sortOrder === "newest" ? "sort-button-active" : ""}`}
             onClick={() => setSortOrder("newest")}
           >
             Newest
           </button>
           <button
             type="button"
             className={`sort-button ${sortOrder === "oldest" ? "sort-button-active" : ""}`}
             onClick={() => setSortOrder("oldest")}
           >
             Oldest
           </button>
           <button
             type="button"
             className={`sort-button ${sortOrder === "manual" ? "sort-button-active" : ""}`}
             onClick={() => setSortOrder("manual")}
           >
             Custom
           </button>
         </div>
       </div>
       <div className="list-heading">
         <p className="section-label">Your list</p>
         <span>{visibleTodos.length === 0
           ? (searchQuery ? "No matches" : "A clean slate")
           : `${visibleTodos.length} ${visibleTodos.length === 1 ? "task" : "tasks"}`}</span>
       </div>
       <div className="todo-list">
         {visibleTodos.length === 0 ? (
           <div className="empty-state">
             <div className="empty-mark">+</div>
             <strong>{searchQuery ? "No task found" : "Nothing here yet"}</strong>
             <span>{searchQuery ? "Try another word or check the spelling." : "Capture the first thing on your mind above."}</span>
           </div>
         ) : visibleTodos.map((todo, index) => (
           <TodoItem
             key={todo.id}
             todo={todo}
             canMoveUp={index > 0}
             canMoveDown={index < visibleTodos.length - 1}
             onMove={(direction) => moveTodo(todo.id, direction, visibleTodos.map((item) => item.id))}
           />
         ))}
       </div>
       <footer className="made-by">Made by <strong>The Jasir</strong> <span className="heart-mark" aria-label="with love">&#9829;</span></footer>
     </section>
   </main>
            </TodoProvider>
  )
}

export default App
