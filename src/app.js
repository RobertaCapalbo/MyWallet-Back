import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import dayjs from "dayjs"

const app = express()

app.use(express.json());
app.use(cors());
dotenv.config();

let db;

const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient
  .connect()
  .then(() => (db = mongoClient.db()))
  .catch((err) => console.log(err.message));

  const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(3)
})
const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(3)
})
const transactionSchema = Joi.object({
    value: Joi.number().precision(2).positive().required(),
    description: Joi.string().required(),
    type: Joi.string().valid("in", "out").required()
})