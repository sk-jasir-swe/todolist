import { createContext, useContext } from "react";

export const todoContext = createContext({
    todos : [
        {
            id : 1,
            todo: "Todo First Message",
            completed : false
        }
    ],
    addTodo : ()=>{},
    updateTodo : ()=>{},
    deleteTodo : ()=>{},
    toggleComplete : ()=>{},
    moveTodo : ()=>{}
})

export const useTodo = ()=>{
    return useContext(todoContext)
}

export const todoProvider = todoContext.Provider