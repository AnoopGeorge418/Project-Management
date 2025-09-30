import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({
    path: join(__dirname, '../../.env')
});

async function fixUsernameIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get the users collection
        const usersCollection = mongoose.connection.collection('users');

        // Drop the existing userName index if it exists
        try {
            await usersCollection.dropIndex('userName_1');
            console.log('Successfully dropped the old userName index');
        } catch (error) {
            if (error.code !== 27) { // 27 is the error code for index not found
                throw error;
            }
            console.log('Old userName index not found, proceeding...');
        }

        // Create the new username index
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        console.log('Successfully created new username index');

        console.log('Index fix completed successfully');
    } catch (error) {
        console.error('Error fixing index:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the fix
fixUsernameIndex();