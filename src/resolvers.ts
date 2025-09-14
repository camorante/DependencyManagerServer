/**********************************************************
 * Componente: resolvers
 * Description: Se encarga de resolver las consultas y mutaciones
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import querys from './resolvers/Queries'
import mutations from './resolvers/Mutations'

let resolvers = {
    Query: {
        ...querys
    }, 
    Mutation: {
        ...mutations
    }
}

export default resolvers;