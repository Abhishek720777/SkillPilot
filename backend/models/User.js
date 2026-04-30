const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profileId: { type: String, unique: true },
    username: { type: String, unique: true, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    avatarColor: { type: String, default: "#4F46E5" },
    exp: { type: Number, default: 0 },
    expHistory: [{ date: { type: String }, exp: { type: Number }, source: { type: String } }],
    activityLog: [{
      date: { type: String },
      count: { type: Number, default: 1 }
    }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resetCode: { type: String }, // Hashed reset code
    resetCodeExpires: { type: Date }, // Expiry for the reset code
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.profileId) {
    let id, exists;
    do {
      id = String(Math.floor(10000 + Math.random() * 90000));
      exists = await mongoose.model("User").findOne({ profileId: id });
    } while (exists);
    this.profileId = id;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
