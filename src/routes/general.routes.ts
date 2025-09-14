/**********************************************************
 * Componente: general.routes
 * Description: Rutas rest generales de la app
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { Router } from "express"
import { prisma } from "../database/db"
import multer from 'multer';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { userCheckVerification } from "../utils/firebase";
import { validateTokenResolver } from "../resolvers/queries/userQueries";
import fs from 'fs';

const router = Router()

/**
 * Version de la app
 */
router.get('/version', async (req, res) => {
    try {
        let result : any = {'version' : '1.0.0'}
        res.json(result)
    } 
    catch (error) {
        console.error(error)
    }
})
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

/**
 * Subir imagen de perfil
 */
router.post('/upload', upload.single('pictureUpload'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const username = req.body.username;
        const token = req.body.token;

        const userCheckClaims = await validateTokenResolver( null, { token: token }, { db: prisma, log : null } )

        if (!userCheckClaims || userCheckClaims.isValid === false || token == null) {
            return res.status(400).send('User not found.');
        }
        else {
            const mimeType = req.file.mimetype;
                let fileExt = ''
                switch(mimeType){
                    case 'image/jpeg':
                        fileExt = 'jpg'
                        break;
                    case 'image/png':
                        fileExt = 'png'
                        break;
                    case 'image/gif':
                        fileExt = 'gif'
                        break;
                    case 'image/svg+xml':
                        fileExt = 'svg'
                        break;
                    default:
                        return res.status(400).send('Invalid file type. Only SVG, JPG, PNG, and GIF files are allowed.');
                }
            let filePath = `${username}.${fileExt}`

            // Actualizar la ruta de la imagen en la base de datos
            // await prisma.user.update({
            //     where: { username: username },
            //     data: { profilePicture: filePath }
            // });

            //si no hay carpeta uploads, crearla pero haz que cuando este en modo debug la cree en la raiz del proyecto
            let uploadsDir = '';
            if (process.env.NODE_ENV === 'development') {
                uploadsDir = './src/uploads';
                if (!fs.existsSync(uploadsDir)){
                    fs.mkdirSync(uploadsDir);
                }
            }
            else {
                uploadsDir = './src/uploads';
                if (!fs.existsSync(uploadsDir)){
                    fs.mkdirSync(uploadsDir);
                }
            }

            //Guardar el archivo al disco donde se ejecuta el servidor
            let dateNow = Date.now();
            fs.writeFileSync(`${uploadsDir}/${dateNow}-${filePath}`, req.file.buffer);

            //obtener la url completa de la imagen
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${dateNow}-${filePath}`;
            return res.status(200).send({message: 'File uploaded successfully.', fileUrl: fileUrl});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});

export default router;