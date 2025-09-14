/**********************************************************
 * Componente: firebase
 * Description: Verificaciones de usuario y tokens con firebase
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { getAppCheck } from "firebase-admin/app-check";
import admin from 'firebase-admin';

export const appCheckVerification = async (token: string) => {
    let result : any = {}
    try {
        const appCheckClaims = await getAppCheck().verifyToken(token);
        console.log(appCheckClaims)
        result = appCheckClaims
    } catch (err) {
        console.log(err)
    }
    return result
}
 
export const userCheckVerification = async (token: string) => {
    let result : any = null
    try {
        const userCheckClaims = await admin.auth().verifyIdToken(token);
        console.log(userCheckClaims)
        result = userCheckClaims
    } catch (err) {
        console.log(err)
    }
    return result
}
