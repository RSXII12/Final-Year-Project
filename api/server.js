import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey123";

// ---- MongoDB ----
const MONGO_URI =
  "mongodb+srv://endorchase_db_user:t5loyZDEUdtZgO6r@cluster0.o2sq3vk.mongodb.net/workouts?retryWrites=true&w=majority";

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB Atlas");

// ---- Schemas ----
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
});

const User = mongoose.model("User", UserSchema);

const SetSchema = new mongoose.Schema({
  exerciseName: String,
  reps: Number,
  weight: Number,
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Set = mongoose.model("Set", SetSchema);

// ---- GraphQL Schema ----
const typeDefs = fs.readFileSync("./index.graphql", "utf-8");

// ---- Auth Helper ----
async function getUserFromReq(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- Resolvers ----
const resolvers = {
  Query: {
    exercises: async (_, { muscle, name }) => {
      try {
        let url = "https://api.api-ninjas.com/v1/exercises";
        const params = new URLSearchParams();

        if (muscle) params.append("muscle", muscle);
        if (name) params.append("name", name);

        if (params.toString()) url += "?" + params.toString();

        const res = await fetch(url, {
          headers: { "X-API-KEY": "eChQVc6qCSiftntC9Bms6A==TOXcKlKrN0d2E3Oc" },
        });

        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("❌ Exercise API Error:", err);
        return [];
      }
    },

    sets: async (_, { exerciseName }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const filter = { userId: user.userId };
      if (exerciseName) filter.exerciseName = exerciseName;

      const results = await Set.find(filter).sort({ date: -1 });

      return results.map((s) => ({
        _id: s._id.toString(),
        exerciseName: s.exerciseName,
        reps: s.reps,
        weight: s.weight,
        userId: s.userId.toString(),
        date: s.date?.toISOString() ?? null,
      }));
    },

    workouts: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const results = await Set.find({ userId: user.userId }).sort({ date: -1 });

      return results.map((s) => ({
        _id: s._id.toString(),
        exerciseName: s.exerciseName,
        reps: s.reps,
        weight: s.weight,
        userId: s.userId.toString(),
        date: s.date?.toISOString() ?? null,
      }));
    },
  },

  Mutation: {
    signup: async (_, { email, password }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already in use");

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash });

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password");

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    addWorkout: async (_, { exerciseName, reps, weight }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const s = await Set.create({
        exerciseName,
        reps,
        weight,
        userId: user.userId,
      });

      return {
        _id: s._id.toString(),
        exerciseName: s.exerciseName,
        reps: s.reps,
        weight: s.weight,
        userId: s.userId.toString(),
        date: s.date?.toISOString() ?? null,
      };
    },
  },
};

// ---- Apollo Server v3 ----
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUserFromReq(req),
  }),
});

// ---- Express App ----
const app = express();

// FIX: Apollo does NOT auto-parse JSON, add this:
app.use(cors());
app.use(bodyParser.json());

// Start Apollo
await server.start();
server.applyMiddleware({ app, path: "/graphql" });

// Railway required port
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
