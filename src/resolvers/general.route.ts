import { Router } from "express"
import { prisma } from "../database/db"

const router = Router()

router.get('general/version', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            //include: { Permission : true }
        })
        res.json(users)
    } 
    catch (error) {
        console.error(error)
    }

})