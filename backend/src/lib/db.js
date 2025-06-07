import mongoose from 'mongoose';


export const connectDB = async () => {

    try {
        const connec = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connec.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
}