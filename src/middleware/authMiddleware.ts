/**********************************************************
 * Componente: authMiddleware
 * Description: este middleware se utiliza para verificar si 
 * el token del usuario es válido
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { validateTokenResolver } from "../resolvers/queries/userQueries";

const ExcludeMethods = ['createUser', 'changePassword', 'loginUser']  // Métodos que no requieren autenticación

/**
 * Middleware para verificar si el token del usuario es válido
 * @param resolverFn 
 * @returns 
 */
export function withAuth(resolverFn: Function) {
  return async (parent: any, args: any, context: any, info: any) => {
    if (process.env.TOKEN_VALIDATION === 'true' && !ExcludeMethods.includes(info.fieldName))
    {
      //const userCheckClaims = await userCheckVerification(context.headers.token);
      const userCheckClaims = await validateTokenResolver(parent = null, { token: context.headers.token }, context);
      if (!userCheckClaims  || userCheckClaims.isValid === false || context.headers.token == null) {
        throw new Error("user_not_found");
      }
    }
    return resolverFn(parent, args, context, info);
  };
} 