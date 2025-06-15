import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { upsertStreamUser } from '../lib/stream.js';

export async function signup(req,res){
    const {email,fullName,password} = req.body;
    if(!email || !fullName || !password){
        return res.status(400).json({message:"Please fill all the fields"})
    }
    if(password.length < 6){
        return res.status(400).json({message:"Password must be at least 6 characters long"})
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({message:"Please enter a valid email address"})
    }
    try {
        // Check if user already exists
        const existingUser = await User.find({ email });
        console.log(existingUser);
        
        if (existingUser.length) {
            return res.status(400).json({ message: "User already exists" });
        }
        const idx = Math.floor(Math.random() * 100)+1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
        const newUser = new User({
            fullName,
            email,
            password,
            profilePic: randomAvatar
        });
    
        // CREATE USER IN STREAM AS WELL 
        await newUser.save();
        try {
            await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic||""
        });
        console.log("User upserted in Stream successfully",newUser.fullName);
        
        } catch (error) {
            console.log(`Error upserting user in Stream: ${error.message}`);
            
        }
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict' 
        });
        res.status(201).json({
            success: true,
            user:newUser,
        });
    }
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export async function login(req,res){
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"Please fill all the fields"})
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict' 
        });
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}
export async function logout(req,res){
    res.clearCookie('token');
    res.status(200).json({ success:true,message: "Logged out successfully" });
}

export async function onboard(req,res){
    try{
        const userId = req.user._id;
        const {fullName, bio, nativeLanguage, learningLanguage, location,profilePic } = req.body;
        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location || !profilePic) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        console.log(fullName,profilePic);
        
        const updatedUser = await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded: true       
        },{new:true})
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update user in Stream as well
        try {
            await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || ""
        });
        console.log("User upserted in Stream successfully", updatedUser.fullName);
        } catch (error) {
            console.log(`Error upserting user in Stream: ${error.message}`);
            return res.status(500).json({ message: "Internal server error while updating Stream user" });
            
        }
    
        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Onboarding completed successfully"
        });
    }
    catch(error){
        console.error("Error during onboarding:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
}