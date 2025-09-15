/**********************************************************
 * Componente: userQueries
 * Description: Se encarga de resolver las consultas de usuario
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { last, tryit } from "radashi";
import { withAuth } from "../../middleware/authMiddleware"
import Logger from "../../utils/Logger"
import * as argon2 from "argon2"
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtiene info del perfil de usuario para el sistema de autenticacion
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function getUserInfoResolver(parent, args, context) : Promise<any> {
    let result : any = null
    try {
        const { username } = args

        let user = await context.db.user.findUnique({
            where: {
                username: username
            },
            include: {
                country: {
                    select: {
                        code: true
                    }
                }
            }
        })
        
        result = {
            id: user?.id ?? -1,
            uid: user?.uid ?? "",
            email: user?.email ?? "" ,
            username: user?.username ?? "",
            token: user?.token ?? "",
            tokenExpiry: user?.token_expiry ?? null,
            firstName: user?.first_name ?? "",
            lastName: user?.last_name,
            photoUrl: user?.photo_url,
            phoneNumber: user?.phone_number,
            authType: user?.auth_type,
            lastLogin: user?.last_login,
            createdAt: user?.created_at,
            updatedAt: user?.updated_at,
            gender: user?.gender  == '' ? 'UNKNOWN' : user?.gender ,
            countryCode: user?.country ? user?.country.code : ''
        }
        const langCode = await context.db.language.findUnique({
            where: {
                id: user?.language_id ?? 2
            }
        })
        result.language = langCode?.code ?? "en"

        context.log.log("userInfo: ", result)
        
    } catch (error) {
        context.log.error("Error in getUserInfoResolver:", error)
    }
    return result
}

/**
 * Obtiene info del perfil de usuario para el modulo de perfil
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function getAllUserInfoResolver(parent, args, context) : Promise<any> {
    const { username } = args
    let result : any = null
    try {
        const user = await context.db.user.findUnique({
            where: {
                username: username
            },
            include: {
                country: {
                    select: {
                        code: true,
                        area_code: true
                    }
                }
            }
        })
        result = {
            id: user?.id ?? -1,
            uid: user?.uid ?? "",
            email: user?.email ?? "" ,
            firstName: user?.first_name ?? "",
            lastName: user?.last_name,
            photoUrl: user?.photo_url,
            phoneNumber: user?.phone_number,
            authType: user?.auth_type,
            gender: user?.gender,
            lastLogin: user?.last_login,
            createdAt: user?.created_at,
            updatedAt: user?.updated_at,
            areaCode: user?.country?.area_code,
            username: user?.username,
            countryCode: user?.country ? user?.country.code : ''
        }
        const langCode = await context.db.language.findUnique({
            where: {
                id: user?.language_id
            }
        })
        result.language = langCode?.code ?? "en"

        context.log.log("userInfo: ", result)
    } catch (error) {
        context.log.error("Error in getAllUserInfo:", error)
    }
    return result
}   

/**
 * Obtiene info del rol de usuario
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function getRoleDataResolver(parent, args, context) : Promise<any> {

    const { username } = args
    let result : any = null
    try {
        result = await context.db.user.findFirst({
            where: {
                username: username
            },
            select: {
                username: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            select: {
                                permission: {
                                    select : {
                                        key: true
                                    }   
                                },
                                section: {
                                    select : {
                                        code: true
                                    }
                                }

                            }
                        },
                        menu: {
                            include: {
                                menu : {
                                    select: {
                                        id: true,
                                        name: true,
                                        visible: true,
                                        type: true,
                                        lang_code: true,
                                        icon: true,
                                        template: true,
                                        parent: true,
                                        page: true,
                                        position: true
                                    }
                                    
                                }
                            }    
                        }
                    }
                }
            }
        })
        result.role.menu = result.role.menu.map(e => e.menu)
        result.role.menu = result.role.menu.sort((a, b) => a.id - b.id)
        context.log.log("userInfo: ", result)
        context.log.log("userInfo: ", result.role.menu)
    } 
    catch (error) {
        context.log.error("Error in getRolData:", error)
    }
    return result
}

/**
 * Obtiene el username de un usuario
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function getUsernameResolver(parent, args, context) : Promise<any> {
    const { username } = args
    let result : any = null
    try {
        const user = await context.db.user.findUnique({
            select: {
                id: true,
                uid: true,
                username: true
            },
            where: {
                username: username
            }
        })
        result = {
            id: user?.id ?? -1,
            uid: user?.uid ?? "",
            username: user?.username,
        }

        context.log.log("getUsernameResolver: ", result)
    } catch (error) {
        context.log.error("Error in getUsernameResolver:", error)
    }
    return result
}   

async function loginUserResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {username, password} : any = args
    let result: any = null
    try {
       
        const userData = await context.db.user.findUnique({
            select: {
                id: true,
                token: true,
                username: true,
                password: true,
                token_expiry: true,
                email: true
            },
            where: {
                username: username
            }
        })
        
        if(userData){
            const isMatch = await argon2.verify(userData.password, password);
            if(isMatch){
                result = {
                    id: userData?.id ?? -1,
                    token: userData?.token ?? "",
                    username: userData?.username ?? "",
                    email: userData?.email ?? ""
                }

                if(userData.token_expiry < new Date()) {
                    let uuid: string = uuidv4();
                    let expiryDate = new Date();
                    expiryDate.setHours(expiryDate.getHours() + 168); // Token valido por 7 dias
                    await context.db.user.update({
                        data: {
                            token: uuid,
                            token_expiry: expiryDate,
                            last_login: new Date()
                        },
                        where: {
                            username: username
                        }
                    });
                    result.token = uuid;                  
                }
                else {
                    await context.db.user.update({
                        data: {
                            last_login: new Date(),
                            
                        },
                        where: {
                            username: username
                        }
                    });
                }
                
            }
            else{
                result = {
                    id: -1,
                    token: "",  
                    username: "",
                    email: ""
                }
            }
        }
        else{
            result = {
                    id: -1,
                    token: "",  
                    username: "",
                    email: ""
                }
        }
    } 
    catch (error) {
        log.error("Error in setUsernameResolver:", error)
    }
    return result;
}

async function validateTokenResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {token} : any = args
    let result: any = null
    try {
       
        const userData = await context.db.user.findFirst({
            select: {
                id: true,
                token: true,
                username: true,
                token_expiry: true
            },
            where: {
                token: token
            }
        })     

        if(userData){
            let isValid: boolean = false;
            if(userData.token === token && userData.token_expiry > new Date()) {
                isValid = true;
            }

            if(isValid){
                let expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 168); // Token valido por 7 dias
                await context.db.user.update({
                    data: {
                        token_expiry: expiryDate,
                        last_login: new Date()
                    },
                    where: {
                        username: userData?.username
                    }
                });
            }
            result = {
                isValid: isValid,
                token: userData?.token ?? "",
                username: userData?.username ?? ""
            }


        }
    } 
    catch (error) {
        log.error("Error in setUsernameResolver:", error)
    }
    return result;
}

async function getUserByTokenResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance();
    const { token } : any = args;
    let result: any = null;
    try {
        result = await context.db.user.findFirst({
            select: {
                id: true,
                username: true,
                email: true,
                token: true,
            },
            where: {
                token: token
            }
        });


    } catch (error) {
        log.error("Error in getUserByTokenResolver:", error)
    }
    return result;
}

const getUserInfo = withAuth(getUserInfoResolver);
const getAllUserInfo = withAuth(getAllUserInfoResolver);
const getRoleData = withAuth(getRoleDataResolver);
const getUsername = withAuth(getUsernameResolver);
const loginUser = withAuth(loginUserResolver);
const validateToken = withAuth(validateTokenResolver);
const getUserByToken = withAuth(getUserByTokenResolver);

export default {
    getUserInfo,
    getAllUserInfo,
    getRoleData,
    getUsername,
    loginUser,
    validateToken,
    getUserByToken
}

export {
    getUserInfoResolver,
    getAllUserInfoResolver,
    getRoleDataResolver,
    getUsernameResolver,
    loginUserResolver,
    validateTokenResolver,
    getUserByTokenResolver
}