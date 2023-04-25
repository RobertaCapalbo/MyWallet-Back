import { Router } from "express"
import { one, two, three, four } from "../Controllers/Controllers.js"

const expressRouter = Router()

expressRouter.post("/sign-up", one)

expressRouter.post("/sign-in", two)

expressRouter.post("/newTransaction/:type", three)

expressRouter.get("/records", four)

export default expressRouter