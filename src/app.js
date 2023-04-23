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
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})
const signInSchema = Joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})
const transactionSchema = Joi.object({
    value: joi.number().precision(2).positive().required(),
    description: joi.string().required(),
    type: joi.string().valid("in", "out").required()
})


app.post("/sign-up", async (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body
    const validation = signUpSchema.validate(req.body, { abortEarly: false })
    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(erros)
    }
    try {
        const searchEmail = await db.collection("users").findOne({ email })
        console.log(searchEmail)
        if (searchEmail) return res.status(409).send("E-mail já registrado")
        const hash = bcrypt.hashSync(password, 10)
        await db.collection("users").insertOne({ name, email, password: hash })
        res.sendStatus(201)
    }
    catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body
    const validation = signInSchema.validate(req.body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
        const searchEmail = await db.collection("users").findOne({ email })
        if (!searchEmail) return res.status(404).send("E-mail não cadastrado. Faça o registro e tente novamente.")

        const searchPassword = bcrypt.compareSync(password, searchEmail.password)
        if (!searchPassword) return res.status(401).send("Senha incorreta")

        const token = uuid()

        await db.collection("sessions").insertOne({ token, userId: searchEmail._id })

        res.status(200).send(token)
})