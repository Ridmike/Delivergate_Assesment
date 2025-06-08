import express from 'express';
import Todo from '../models/Todo.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

router.post('/', auth, async (req, res) => {
    try {        const { title, description, completed, datePosted, timePosted, important } = req.body;

        if (!title || !datePosted) {
            return res.status(400).json({ error: 'Title and Date is required.' });
        }

        // Ensure datePosted is in YYYY-MM-DD format
        const formattedDate = datePosted;
        console.log('Creating todo with date:', formattedDate);

        const newTodo = new Todo({
            userId: req.userId,
            title,
            description,
            completed: completed || false,
            datePosted: formattedDate,
            timePosted,
            important: important || false
        })
        await newTodo.save();
        res.status(201).json({ message: 'Todo created successfully', todo: newTodo });
    } catch (error) {
        console.log("Error creating todo:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//fetch data and filtering
router.get('/', auth, async (req, res) => {    try {
        const { date } = req.query;
        let query = { userId: req.userId };
        if (date) {
            // Log the incoming date and query parameters
            console.log('Querying for date:', date);
            console.log('Sample task dates:', await Todo.distinct('datePosted'));
            
            // Use exact match for the date
            query.datePosted = date;
            
            // Log the final query for debugging
            console.log('Final query:', query);
        }

        const todos = await Todo.find(query).sort({ timePosted: 1 });
        res.status(200).json(todos);
    } catch (error) {
        console.log("Error fetching todos:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// edit todo's
router.get('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json(todo);
    } catch (error) {
        console.log("Error fetching todo:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//delete todo's 
router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        await Todo.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.log("Error deleting todo:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update todo completion status
router.patch('/:id', auth, async (req, res) => {
    try {
        const { completed } = req.body;
        
        const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        todo.completed = completed;
        await todo.save();

        res.status(200).json({ 
            message: 'Todo updated successfully',
            todo 
        });
    } catch (error) {
        console.log("Error updating todo:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;