/**********************************************************
 * Componente: typeDefs
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/**
 * @description: Se encarga de leer el archivo schema.graphql
 */
const typeDefs = fs.readFileSync(
    
    path.join(__dirname, 'schema.graphql'),
    'utf8'
);

export default typeDefs;