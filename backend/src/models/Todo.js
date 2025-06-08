import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    completed: {
        type: Boolean, 
        default: false
    },    datePosted: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v); // Validates YYYY-MM-DD format
            },
            message: props => `${props.value} is not a valid date format! Use YYYY-MM-DD`
        }
    },
    timePosted: {
        type: String,
        required: true
    },
    important: {
        type: Boolean,
        default: false
    }
});

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;