// database/models/client.js
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: Number,
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // Update for international if needed
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    employment_status: {
      type: String,
      enum: [
        "Salaried",
        "Self-Employed",
        "Freelancer",
        "Business",
        "Unemployed",
      ],
      default: "Salaried",
    },
    credit_score: {
      type: Number,
      min: 300,
      max: 900,
    },
    date_of_birth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return (
            value < new Date() &&
            new Date().getFullYear() - value.getFullYear() >= 18
          );
        },
        message:
          "Date of birth must be in the past and user must be at least 18 years old",
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Documents reference
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true }
);

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ clientId: 1 });

// Virtuals
clientSchema.virtual("documentCount").get(function () {
  return this.documents ? this.documents.length : 0;
});
clientSchema.virtual("documentStatus").get(function () {
  const count = this.documentCount;
  if (count >= 10) return "Approved";
  return "Pending";
});

clientSchema.set("toJSON", { virtuals: true });
clientSchema.set("toObject", { virtuals: true });

export default mongoose.model("Client", clientSchema);
