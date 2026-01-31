const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        const dbName = conn.connection.db?.databaseName || conn.connection.name;
        console.log(`MongoDB Connected: ${conn.connection.host} | Database: ${dbName}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
