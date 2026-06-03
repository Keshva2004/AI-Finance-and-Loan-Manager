import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";


const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  // Removed 'role' field as per request
});

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;


