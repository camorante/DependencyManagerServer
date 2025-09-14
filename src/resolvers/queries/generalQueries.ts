/**********************************************************
 * Componente: generalQueries
 * Description: Se encarga de resolver las consultas generales
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import Logger from "../../utils/Logger"
import { prisma } from "../../database/db"
import { withAuth } from "../../middleware/authMiddleware"

const log = Logger.getInstance()

function getApp(parent, args, context) : any {
    return {name : 'zehnda', version : '1.0.0'}
}

/**
 * Obtiene info de los paises
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function getCountriesResolver(parent, args, context) : Promise<any> {
    const { code } = args
    let result = []
    try {
        const langId = await prisma.language.findUnique({
            where: {
                code: code
            }
        })

        let countries = await prisma.country.findMany({
            select: {
                id: true,
                code: true,
                area_code: true,
                translations: {
                    where: {
                        language_id: langId.id, // Asegúrate de traer solo la traducción para el idioma solicitado
                    },
                    select: {
                        name: true,
                        language_id: true
                    }
                }
            }
        })

        result = countries.map((country) => {
            return {
                id: country.id,
                name: country.translations[0].name,
                code: country.code,
                areaCode: country.area_code
            }
        })
        
    } 
    catch (error) {
        log.error('getCountries: ', error)
    }
    return result
}

const getCountries = withAuth(getCountriesResolver);

export default {
    getApp,
    getCountries
}