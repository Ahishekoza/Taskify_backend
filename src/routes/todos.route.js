import express from "express";
import { createSubTodo, createTodo, deleteSubTodo, getAllTodos, getMonthlyTodosCount, getSingleTodo, getYearlyTodosCount, updateSubTodoToCompletion } from "../controllers/todos.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const todoRoute = express.Router()


// POST :--- create a new Todo
todoRoute.post('/',verifyToken,createTodo)
// POST :--- create a new subTodo
todoRoute.post('/:todoId/subTodo',createSubTodo)

// GET :-- All the Todos for specific user
todoRoute.get('/',verifyToken,getAllTodos)

// GET :-- Get Single Todo
todoRoute.get('/:todoId',verifyToken,getSingleTodo)

// GET :- All the completed and non-completed Todos for specific month
todoRoute.get("/monthly/count/:year/:month",verifyToken,getMonthlyTodosCount)

// GET: All the completed and non-completed Todos for whole year

todoRoute.get("/wholeYear/count/:year",verifyToken,getYearlyTodosCount)

// PUT :- Update the subtodo status if the todo is completed
todoRoute.put('/:todoId/subTodo/:subTodoId?',updateSubTodoToCompletion)


// DELETE:- delete the subtodo
todoRoute.delete('/:todoId/delete_subTodo/:subTodoId',verifyToken,deleteSubTodo)


export {todoRoute}