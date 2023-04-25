import joi from "joi"

export const signInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})

export const transactionSchema = joi.object({
    value: joi.number().precision(2).positive().required(),
    description: joi.string().required(),
    type: joi.string().valid("in", "out").required()
})

export const signUpSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().min(3)
})