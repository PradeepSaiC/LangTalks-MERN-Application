import {StreamChat} from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
if (!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY or STREAM_API_SECRET is not set in the environment variables.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.log(`Error upserting user in Stream: ${error.message}`);
        
    }
}

export const generateStreamToken = async (userId) => { 
    try{
        //ensure userId is a string
        const userIdString = userId.toString();
        return streamClient.createToken(userIdString);
    }catch (error) {
        console.error(`Error generating Stream token for user ${userId}:`, error);
    }
}

    