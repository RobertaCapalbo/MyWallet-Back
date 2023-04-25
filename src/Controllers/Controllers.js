//funções => controllers
import { db } from "../Database/Database.js"
import {signInSchema} from "../Schemas/Schemas.js"
import {transactionSchema} from "../Schemas/Schemas.js"


export async function one (req, res){
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
}

export async function two (req, res) {
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

        res.status(200).send({token, name : searchEmail.name})
}

export async function three (req, res) {
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
}

export async function four (req, res) {
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
}