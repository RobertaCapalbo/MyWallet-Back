import {transactionSchema} from "../Schemas/Schemas.js"


export function validateSchema(schema){
const validation = transactionSchema.validate(schema)
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message)
        return errors
    }
}