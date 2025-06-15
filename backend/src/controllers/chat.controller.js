import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
    try {
        
        const token = generateStreamToken(req.user.id).then((token) => {
            if (!token) {
                throw new Error("Failed to generate Stream token");
            }
            
            
        res.status(200).json({token})
            
        })
    } catch (error) {
        console.error("Error getting Stream token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}