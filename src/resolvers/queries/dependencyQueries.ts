/**********************************************************
 * Componente: dependencyQueries
 * Description: Se encarga de resolver las consultas de dependencias
 * Desarrolador: Carlos Morante
 * Fecha: 14 Septiembre 2025
***********************************************************/
import Logger from "../../utils/Logger"
import { prisma } from "../../database/db"
import { withAuth } from "../../middleware/authMiddleware"

const log = Logger.getInstance()

async function getDependenciesResolver(parent, args, context) : Promise<any> {
    const { start_date, end_date } = args
    let result = []
    try {
        result = await prisma.dependencies.findMany({
            where: {
                created_at: {
                    gte: new Date(start_date),
                    lte: new Date(end_date)
                }
            },
            select: {
                id: true,
                title: true,
                team: true,
                area: true,
                state: true,
                iterationPath: true,
                assignedTo: true,
                created_at: true,
                updated_at: true,
                expiration_date: true,
                type: true,
                description: true,
                user_id: true
            }
        })
    } catch (error) {
        log.error("Error fetching dependencies:", error)
    }
    return result
}

const getDependencies = withAuth(getDependenciesResolver);

export default {
    getDependencies
}

export {
    getDependenciesResolver
}