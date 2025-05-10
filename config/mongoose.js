import mongoose from "mongoose";

const uri = "mongodb+srv://soumyadeepsp:<password>@hms.ku2litf.mongodb.net/?retryWrites=true&w=majority&appName=hms";

mongoose.connect(uri).
    then(() => console.log("MongoDB connected successfully")).
    catch(err => console.log("MongoDB connection error:", err));
