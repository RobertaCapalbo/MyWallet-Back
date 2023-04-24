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

  const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})
const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})
const transactionSchema = joi.object({
    value: joi.number().precision(2).positive().required(),
    description: joi.string().required(),
    type: joi.string().valid("in", "out").required()
})


app.post("/sign-up", async (req, res) => {
    const { name, email, password} = req.body
    const validation = signUpSchema.validate(req.body, { abortEarly: false })
    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(erros)
    }
    try {
        const searchEmail = await db.collection("users").findOne({ email })
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

app.post("/newTransaction/:type", async (req, res) => {
    const { value, description, type } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.sendStatus(401)
    const validation = transactionSchema.validate(req.body)
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }
    try {
        const session = await db.collection("sessions").findOne({ token })
        if (!session) return res.sendStatus(401)
        await db.collection("records").insertOne({ value, description, type, date: dayjs().format('DD/MM'), userId: session.userId })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})


app.get("/records", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(401).send("Token inexistente: registre-se e tente novamente!")
    const session = await db.collection("sessions").findOne({ token })
    if (!session) return res.status(401).send("Token inválido: tente novamente.")
    try {
        const registration = await db.collection("records").find({ userId: session.userId }).toArray()
        res.status(200).send(registration)
    }
    catch (err) {
        return res.status(500).send(err.message)
    }
})

const PORT = process.env.PORT || 5000 

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});