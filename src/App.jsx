import { useEffect, useRef, useState } from "react"
import { todoProvider as TodoProvider } from "./context/todoContext"
import TodoForm from "./components/TodoForm"
import TodoItem from "./components/TodoItem"

const APP_VERSION = "2026.08.24.2"
const APP_VERSION_STORAGE_KEY = "todo-app-version"
const TODOS_STORAGE_KEY = "todos"
const TODOS_BACKUP_KEY = "todos-backup"

const loadSavedTodos = () => {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY) || "[]")
    const backupTodos = JSON.parse(localStorage.getItem(TODOS_BACKUP_KEY) || "[]")
    const mainList = Array.isArray(savedTodos) ? savedTodos : []
    const backupList = Array.isArray(backupTodos) ? backupTodos : []
    const todosToLoad = mainList.length > 0 ? mainList : backupList
    const normalizedTodos = savedTodos.map((todo) => ({
      ...todo,
      category: todo.category || "Personal",
      priority: todo.priority || "Medium",
      dueDate: todo.dueDate || ""
    }))
    if (todosToLoad !== mainList) {
      return backupList.map((todo) => ({
        ...todo,
        category: todo.category || "Personal",
        priority: todo.priority || "Medium",
        dueDate: todo.dueDate || ""
      }))
    }
    if (normalizedTodos.length > 0) localStorage.setItem(TODOS_BACKUP_KEY, JSON.stringify(normalizedTodos))
    return normalizedTodos
  } catch {
    return []
  }
}

function App() {
  const [todos,setTodos]=useState(loadSavedTodos)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [filter, setFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [theme, setTheme] = useState(() => localStorage.getItem("todo-theme") || "dark")
  const [deletedTodo, setDeletedTodo] = useState(null)
  const [completionNotice, setCompletionNotice] = useState(null)
  const searchRef = useRef(null)
  const [showUpdateNotice, setShowUpdateNotice] = useState(() => {
    const previousVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY)
    return Boolean((previousVersion && previousVersion !== APP_VERSION) || (!previousVersion && todos.length > 0))
  })

  const addTodo =(todo)=>{
    setTodos ((prev)=> [{id : Date.now(),...todo},...prev])
  }

  const updateTodo = (id, todo)=>{setTodos((prev)=> prev.map((prevTodo)=>(prevTodo.id === id ? todo:prevTodo)))}

const deleteTodo = (id )=>{
  const deletedIndex = todos.findIndex((todo) => todo.id === id)
  const deleted = todos[deletedIndex]
  if (!deleted) return
  setDeletedTodo({todo: deleted, index: deletedIndex})
  window.setTimeout(() => setDeletedTodo(null), 4500)
  setTodos((prev)=> prev.filter((todo)=>todo.id !== id))
}

const undoDelete = () => {
  if (!deletedTodo) return
  setTodos((prev) => {
    const restored = [...prev]
    restored.splice(Math.min(deletedTodo.index, restored.length), 0, deletedTodo.todo)
    return restored
  })
  setDeletedTodo(null)
}

const clearCompleted = () => setTodos((prev) => prev.filter((todo) => !todo.completed))

const toggleComplete = (id)=>{
  const selectedTodo = todos.find((todo) => todo.id === id)
  if (selectedTodo && !selectedTodo.completed) {
    setCompletionNotice({task: selectedTodo.todo})
    window.setTimeout(() => setCompletionNotice(null), 3200)
  }
  setTodos((prev)=> prev.map((prevTodo)=> prevTodo.id === id  ? {...prevTodo, completed :!prevTodo.completed }: prevTodo  ) )
}

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
  const serializedTodos = JSON.stringify(todos)
  localStorage.setItem(TODOS_STORAGE_KEY, serializedTodos)
  localStorage.setItem(TODOS_BACKUP_KEY, serializedTodos)
},[todos])

  useEffect(() => {
    localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION)
    const noticeTimer = window.setTimeout(() => setShowUpdateNotice(false), 5000)
    return () => window.clearTimeout(noticeTimer)
  }, [])

    useEffect(() => {
      localStorage.setItem("todo-theme", theme)
    }, [theme])

    useEffect(() => {
      const handleShortcut = (event) => {
        if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
          event.preventDefault()
          searchRef.current?.focus()
        }
        if (event.key === "Escape" && document.activeElement === searchRef.current) {
          setSearchQuery("")
          searchRef.current.blur()
        }
      }
      window.addEventListener("keydown", handleShortcut)
      return () => window.removeEventListener("keydown", handleShortcut)
    }, [])

  const visibleTodos = [...todos]
    .filter((todo) => {
      const matchesSearch = todo.todo.toLowerCase().includes(searchQuery.trim().toLowerCase())
      const matchesFilter = filter === "all" || (filter === "active" && !todo.completed) || (filter === "completed" && todo.completed)
      const matchesCategory = categoryFilter === "All categories" || todo.category === categoryFilter
      return matchesSearch && matchesFilter && matchesCategory
    })
    .sort((firstTodo, secondTodo) => sortOrder === "manual" ? 0 : sortOrder === "newest"
      ? secondTodo.id - firstTodo.id
      : firstTodo.id - secondTodo.id)
  const today = new Date().toISOString().slice(0, 10)
  const dueTodayCount = todos.filter((todo) => todo.dueDate === today && !todo.completed).length

  return (
  <TodoProvider value ={{todos,addTodo, updateTodo,deleteTodo,toggleComplete,moveTodo}}>
   <main className={`app-shell ${theme === "light" ? "app-shell-light" : ""}`}>
     <div className="app-noise" aria-hidden="true" />
     {showUpdateNotice && (
       <div className="update-notice" role="status">
         <span className="update-spark" aria-hidden="true">+</span>
         <div>
           <strong>Website improved!</strong>
           <span>Your tasks are safe and ready to go.</span>
         </div>
         <button type="button" className="update-close" aria-label="Close update message" onClick={() => setShowUpdateNotice(false)}>Close</button>
       </div>
     )}
     {completionNotice && (
       <div className="completion-notice" role="status">
         <span className="completion-mark" aria-hidden="true">OK</span>
         <div>
           <strong>Great work!</strong>
           <span>{completionNotice.task} is complete.</span>
         </div>
         <button type="button" className="update-close" aria-label="Close congratulations message" onClick={() => setCompletionNotice(null)}>Close</button>
       </div>
     )}
     <section className="todo-board">
       <header className="board-header">
         <div>
           <p className="eyebrow">Daily command center</p>
           <h1>Make room for what matters.</h1>
           <p className="board-subtitle">A small, calm list for the things worth finishing today.</p>
         </div>
         <div className="date-chip"><span className="date-dot" /> Focus mode</div>
         <button type="button" className="theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
           {theme === "dark" ? "Light" : "Dark"}
         </button>
       </header>

       <div className="stats-row" aria-label="Todo summary">
         <div className="stat-card"><strong>{todos.length}</strong><span>Total tasks</span></div>
         <div className="stat-card"><strong>{todos.filter((todo) => todo.completed).length}</strong><span>Completed</span></div>
         <div className="stat-card stat-card-accent"><strong>{todos.filter((todo) => !todo.completed).length}</strong><span>Still to do</span></div>
       </div>
       <div className="progress-wrap">
         <div className="progress-label"><span>Daily progress</span><strong>{todos.length ? Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100) : 0}%</strong></div>
         <div className="progress-track"><span style={{width: `${todos.length ? (todos.filter((todo) => todo.completed).length / todos.length) * 100 : 0}%`}} /></div>
       </div>
      {dueTodayCount > 0 && <div className="reminder-banner" role="status"><strong>{dueTodayCount} task{dueTodayCount === 1 ? "" : "s"} due today</strong><span>Keep your momentum going.</span></div>}

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
             ref={searchRef}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </label>
         <div className="filter-controls" aria-label="Filter tasks">
           {[["all", "All"], ["active", "Active"], ["completed", "Done"]].map(([value, label]) => (
             <button key={value} type="button" className={`filter-button ${filter === value ? "filter-button-active" : ""}`} onClick={() => setFilter(value)}>{label}</button>
           ))}
         </div>
         <select className="category-filter" aria-label="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
           <option>All categories</option>
           <option>Personal</option>
           <option>Work</option>
           <option>Study</option>
           <option>Other</option>
         </select>
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
      {deletedTodo && <div className="undo-bar" role="status"><span>Task deleted</span><button type="button" onClick={undoDelete}>Undo</button></div>}
      {todos.some((todo) => todo.completed) && <button type="button" className="clear-completed" onClick={clearCompleted}>Clear completed tasks</button>}
       <footer className="made-by">Made by <strong>The Jasir</strong> <span className="heart-mark" aria-label="with love">&#9829;</span></footer>
     </section>
   </main>
            </TodoProvider>
  )
}

export default App
