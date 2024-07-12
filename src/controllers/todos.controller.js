import mongoose from "mongoose";
import { compareDates } from "../conf/compare.dates.js";
import { TodoSchema } from "../models/todos.model.js";

// create a Todo
export const createTodo = async (req, res) => {
  // get the parameters from the request body
  // create a todo
  // return the response

  try {
    const { userId } = req;
    const { content, dueDate, completed } = req.body;

  

    // if task is completed then remove the dueDate attribute
    let todo = {};
    if (dueDate === undefined) {
      todo = new TodoSchema({
        content: content,
        user: userId,
        completed: completed,
      });
    } else {
      todo = new TodoSchema({
        content: content,
        user: userId,
        dueDate: dueDate,
        completed: completed,
      });
    }

    await todo.save();
    res.status(200).json(todo);
  } catch (error) {
    throw new Error(error);
  }
};

// Get all todos with pagination enabled
export const getAllTodos = async (req, res) => {
  // get the userId from the parameters
  // use the userId to retrieve all the todos
  // now check for the dueDate of the current task/todo
  // whether it has pass the dueDate or not
  // if yes the remove the item from the todo list
  // if not the keep the item in the todo list and display the remaining days to complete the task
  // after validating perform the pagination
  // for pagination we require 3* things
  // page number
  // number of items to display on the page
  // total number of items to  present

  try {
    const { userId } = req;
    let totalTodos = 0;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    // Fetch all todos for the user without pagination
    const allTodos = await TodoSchema.find({ user: userId })
      .populate("user", "-password -createdAt -updatedAt  -name -__v")
      .sort({ updatedAt: -1 });

    // Filter todos to remove overdue ones and calculate days remaining
    const validTodos = [];
    const today_date = new Date();

    for (let todo of allTodos) {
      const days_remaining = compareDates(today_date, todo.dueDate);

      // working of the below function :-  it will check the number of days remaining and completed attribute of todo
      // 1. if days_remaining < 0 and todo.completed is false then delete
      // 2. if todo.completed is true then push in the validateTodos
      // 3. and if todo.completed is false and days_remaining > 0 then add no_of_days_remaining field to the object
      if (days_remaining < 0 && !todo.completed) {
        // Delete overdue todos
        await TodoSchema.findByIdAndDelete(todo._id);
      } else if (todo.completed) {
        validTodos.push(todo);
      } else {
        // Add days remaining to the todo object
        todo = todo.toObject(); // Convert Mongoose document to plain JavaScript object
        todo.no_of_days_remaining = days_remaining;
        validTodos.push(todo);
      }
    }

    // Apply pagination on the filtered todos
    const paginatedTodos = validTodos.slice(skip, skip + pageSize);

    totalTodos = validTodos.length;

    res.status(200).json({
      data: paginatedTodos,
      pagination: {
        totalTodos,
        page,
        totalPages: Math.ceil(totalTodos / pageSize),
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};

// Get Single Todo
export const getSingleTodo = async (req, res) => {
  try {
    const { todoId } = req.params;

    const todo = await TodoSchema.findById(todoId);

    if (!todo) res.status(404).send("Todo not found");

    res.status(200).json(todo);
  } catch (error) {
    throw new Error(error);
  }
};

// create a SubTodo
export const createSubTodo = async (req, res) => {
  // get the todo id from the params where you want to create a subTodo
  // get the todo and and push the subTodo Info
  // and then save and send the response
  try {
    const { todoId } = req.params;
    const { content, completed } = req.body;

    const todo = await TodoSchema.findById({ _id: todoId });
    todo.subTodos.push({ content: content, completed: completed });
    await todo.save();

    res.status(201).json(todo);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteSubTodo = async (req, res) => {
  try {
    const { todoId, subTodoId } = req.params;

    const updatedTodo = await TodoSchema.findByIdAndUpdate(
      todoId,
      { $pull: { subTodos: { _id: subTodoId } } },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).send("Todo not found!");
    }

    res.status(200).send("Deleted successfully!");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Update a Todo
const updateTodo = async (todoId, completed, content, dueDate) => {
  try {
    const updatedTodo = await TodoSchema.findByIdAndUpdate(
      { _id: todoId },
      { $set: { completed: completed, content: content, dueDate: dueDate } },
      { new: true }
    );

    return { updatedTodo };
  } catch (error) {
    throw new Error(error);
  }
};

// Update the SubTodo
export const updateSubTodoToCompletion = async (req, res) => {
  // get the todo and subTodo Id from the params
  // get the completion parameter from the body
  // upadate the subtodo
  // check whether all the subtodos in the todo has been updated
  // if yes the update the completion parameter of todo
  // return the response

  try {
    const { todoId, subTodoId = "0" } = req.params;
    const { completed, content, dueDate } = req.body;

    if (subTodoId === "0") {
      const { updatedTodo } = await updateTodo(
        todoId,
        completed,
        content,
        dueDate
      );
      return res.status(200).json(updatedTodo);
    }

    const updatedSubtodo = await TodoSchema.findOneAndUpdate(
      { _id: todoId, "subTodos._id": subTodoId },
      {
        $set: {
          "subTodos.$.completed": completed,
          "subTodos.$.content": content,
        },
      },
      { new: true }
    );

    if (updatedSubtodo.subTodos.every((st) => st.completed)) {
      // .every return me the boolean value after evey check
      updatedSubtodo.completed = true;
    } else {
      updatedSubtodo.completed = false;
    }

    await updatedSubtodo.save();

    res.status(200).json(updatedSubtodo);
  } catch (error) {
    throw new Error(error);
  }
};

// @TODO: create a function which will give me the count of  completed and non-completed task in a month

const getTodoCountForMonth = async (userId, year, month) => {
  try {
    const startDate = new Date(year, month - 1, 0);
    const endDate = new Date(year, month, 0);

    // convert userId to ObjectId to match the userId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await TodoSchema.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$completed",
          count: { $sum: 1 },
        },
      },
    ]);

    let completed = 0;
    let nonCompleted = 0;

    result.forEach((item) => {
      // @Output of attribute item : {_id:valueofCompleted,count:1}
      if (item._id) {
        completed = item.count;
      } else {
        nonCompleted = item.count;
      }
    });

    return { completed, nonCompleted };
  } catch (error) {
    throw new Error(error);
  }
};

export const getMonthlyTodosCount = async (req, res) => {
  // get the Monthly Todos for the specified User and Month
  // get the year and month from the request params
  // after that  create two variables start and end date
  // create a pipleline in which you will use $match to see $gte>startend and $lt<endDate
  // and on the basis of completed attribute create a variable called count and use $sum to add the value in completed and non-completed
  //

  // @TODO: userId coming from params will be replaced by userId comping after verification of JWT token

  try {
    const { year, month } = req.params;
    const { userId } = req;

    const { completed, nonCompleted } = await getTodoCountForMonth(
      userId,
      year,
      month
    );



    

    res.status(200).json({ completed, nonCompleted });
  } catch (error) {
    throw new Error(error);
  }
};

// Get Todos completed and non-completed for a year
export const getYearlyTodosCount = async (req, res) => {
  try {
    const { year } = req.params;
    const { userId } = req;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const todos = await TodoSchema.aggregate([
      {
        $match: {
          user: userObjectId,
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          completed: 1,
        },
      },
      { $match: { year: parseInt(year) } },
      {
        $group: {
          _id: { month: "$month", completed: "$completed" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyCounts = Array.from({ length: 12 }, () => ({
      completed: 0,
      nonCompleted: 0,
    }));

    todos.forEach((todo) => {
      const monthIndex = todo._id.month - 1;
      if (todo._id.completed) {
        monthlyCounts[monthIndex].completed += todo.count;
      } else {
        monthlyCounts[monthIndex].nonCompleted += todo.count;
      }
    });

    res.status(200).json(monthlyCounts);
  } catch (error) {
    throw new Error(error);
  }
};
