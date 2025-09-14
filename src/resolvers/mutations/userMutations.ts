/**********************************************************
 * Componente: userMutations
 * Description: Se encarga de resolver las mutaciones de usuario
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { first, last, uid } from "radashi";
import { withAuth } from "../../middleware/authMiddleware";
import Logger from "../../utils/Logger"
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import * as argon2 from "argon2"
import { v4 as uuidv4 } from 'uuid';
/**
 * Almacena info del perfil del usuario
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function setUserResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {username, fName, lName, countryCode, phoneNumber, gender, languageCode} : any = args
    let result: boolean = false
    try {

        const langId = await context.db.language.findUnique({
            where: {
                code: languageCode
            }
        })

        const countryId = await context.db.country.findUnique({
            select : {
                id: true
            },
            where: {
                code: countryCode ?? 'CO'
            }
        })

        const user = await context.db.user.update({
            data: {
                first_name: fName,
                last_name: lName,
                country_id: countryId?.id ?? null,
                phone_number: phoneNumber,
                gender: gender == '' ? 'UNKNOWN' : gender,
                language_id: langId.id
            },
            where: {
                username: username
            }
        });
        result = user == null ? false : true
        
    } 
    catch (error) {
        log.error("Error in getUserInfoResolver:", error)
    }
    return result;
}

/**
 * Almacena info de la foto del usuario
 * @param parent 
 * @param args 
 * @param context 
 * @returns 
 */
async function setPictureResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {username, url, mime} : any = args
    //let result: boolean = false
    let result: any = null
    try {

        await context.db.user.update({
            data: {
                photo_url: url,
                photo_mime_type: mime
            },
            where: {
                username: username
            }
        });
        
        const userData = await context.db.user.findUnique({
            where: {
                username: username
            }
        })
        result = {
            id: userData?.id ?? -1,
            uid: userData?.uid ?? "",
            email: userData?.email ?? "" ,
            firstName: userData?.first_name ?? "",
            photoUrl: userData?.photo_url
        }

        //result = user == null ? false : true
        
    } 
    catch (error) {
        log.error("Error in setPictureResolver:", error)
    }
    return result;
}

async function setUsernameResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {username, uid} : any = args
    //let result: boolean = false
    let result: any = null
    try {

        await context.db.user.update({
            data: {
                username: username
            },
            where: {
                uid: uid
            }
        });
        
        const userData = await context.db.user.findUnique({
            select: {
                id: true,
                uid: true,
                username: true
            },
            where: {
                uid: uid
            }
        })
        result = userData == null ? false : true
        
    } 
    catch (error) {
        log.error("Error in setUsernameResolver:", error)
    }
    return result;
}

async function createUserResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {username, password, email} : any = args

    let result: any = { success: false, message: "" };
    try {

        const oldUserData = await context.db.user.findUnique({
            select: {
                id: true
            },
            where: {
                username: username
            }
        })
        
        if(!oldUserData){
            let token : string = uuidv4();
            await context.db.user.create({
                data: {
                    username: username,
                    password: await argon2.hash(password),
                    email: email,
                    last_login: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    first_name: username,
                    token: token,
                    role_id: 1,
                    language_id: 1
                }
            });

            const userData = await context.db.user.findUnique({
                where: {
                    username: username
                }
            })
            result.success = userData ? true : false
        }
    }
    catch (error) {
        log.error("Error in createUserResolver:", error)
    }
    return result;
}

async function changePasswordResolver(parent, args, context) : Promise<any> {
    const log = Logger.getInstance()
    const {oldPassword, newPassword, username} : any = args

    let result: any = { success: false, message: "" }
    try {

        const userData = await context.db.user.findUnique({
            select: {
                password: true
            },

            where: {
                username: username
            }
        })

        if(!userData){
            result.success = false
        }
        else {
            if(!userData.password){
                result.success = false
            }
            else {
                const isMatch = await argon2.verify(userData.password, oldPassword);
                if(!isMatch){
                    result.success = false
                    result.message = "OLD_PASSWORD_INCORRECT"

                }
                else {
                    let newPasswordHash = await argon2.hash(newPassword)
                    await context.db.user.update({
                        data: {
                            password: newPasswordHash,
                            updated_at: new Date().toISOString()
                        },
                        where: {
                            username: username
                        }
                    });
                    result = { success: true, message: "Password changed successfully" }
                }
            }
        }
    }
    catch (error) {
        log.error("Error in changePasswordResolver:", error)
    }
    return result;
}



const setUser = withAuth(setUserResolver);
const setPicture = withAuth(setPictureResolver);
const setUsername = withAuth(setUsernameResolver);
const createUser = withAuth(createUserResolver);
const changePassword = withAuth(changePasswordResolver);
export default {
    setUser,
    setPicture,
    setUsername,
    createUser,
    changePassword
}