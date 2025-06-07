import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { title, description, completed, datePosted, timePosted, important } = req.body;

        if (!title || !datePosted) {
            return res.status(400).json({ error: 'Title and Date is required.' });
        }

        const newTodo = new Todo({
            title,
            description,
            completed: completed || false,
            datePosted,
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

router.get('/', async (req, res) => {
    try {
        const { date } = req.query;

        let query = {};
        
        if (date) {
            // Create start and end of the specified date
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.datePosted = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const todos = await Todo.find(query).sort({ timePosted: 1 });
        res.status(200).json(todos);
    } catch (error) {
        console.log("Error fetching todos:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//fetch data and filtering
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
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.log("Error deleting todo:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;