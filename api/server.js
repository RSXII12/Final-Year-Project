import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import fs from "fs";
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

const JWT_SECRET = process.env.JWT_SECRET;

// ==== MongoDB ====
const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

// ==== Schemas ====
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

// ==== Load GraphQL schema ====
const typeDefs = fs.readFileSync("./index.graphql", "utf-8");

// ==== Auth ====
async function getUserFromReq(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;

  const token = header.replace("Bearer ", "").trim();

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ==== Resolvers ====
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
      } catch (e) {
        console.error(e);
        return [];
      }
    },

    sets: async (_, { exerciseName }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const filter = { userId: user.userId };
      if (exerciseName) filter.exerciseName = exerciseName;

      const rows = await Set.find(filter).sort({ date: -1 });
      return rows.map((s) => ({
        ...s.toObject(),
        _id: s._id.toString(),
        date: s.date.toISOString(),
      }));
    },
  },

  Mutation: {
    signup: async (_, { email, password }) => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error("Email already used");

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({ email, passwordHash });

      const token = jwt.sign(
        { userId: user._id.toString(), email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error("Invalid credentials");

      const token = jwt.sign(
        { userId: user._id.toString(), email },
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
        ...s.toObject(),
        _id: s._id.toString(),
        date: s.date.toISOString(),
      };
    },
  },
};

// ==== Apollo v4 Server ====
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
await server.start();

// ==== Express App ====
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Bind Apollo middleware
app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        user: await getUserFromReq(req),
      };
    },
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
