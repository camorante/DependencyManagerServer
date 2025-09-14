/**********************************************************
 * Componente: index
 * Description: Se encarga de iniciar el servidor
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
//import { expressMiddleware } from '@apollo/server/express4'
import { prisma } from "./database/db"
import express from 'express';
import { expressMiddleware } from "@as-integrations/express5"
import axios from 'axios';
import http from 'http';
import cors from 'cors';
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import {generalRouters} from './routes/routes'
import typeDefs from './typedefs'
import resolvers from './resolvers'
import { appCheckVerification } from './utils/firebase';
import Logger from './utils/Logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

//credenciales de firebase
var serviceAccount = readFileSync(new URL('./credentials/lotusy-dev-firebase-adminsdk.json', import.meta.url))

//inicializar firebase
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccount.toString()))
});

//server http
const httpServer = http.createServer(app);

//apollo server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

//cargar el midleware de graphql y apollo
app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: [process.env.API_URL, process.env.API_URL_LOCAL, process.env.WEB_URL ],
      //credentials: true
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log(req.headers)
        return { db: prisma, headers: req.headers, log : Logger.getInstance() };
      },
    }),
); 

//cargar el midleware de rest
app.use(
  '/api',
  cors<cors.CorsRequest>({
    origin: [process.env.API_URL, process.env.API_URL_LOCAL, process.env.WEB_URL],
    //credentials: true
  }),
  generalRouters
);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Si /uploads está en el raíz del proyecto:
const uploadsDir = path.resolve(process.cwd(), 'uploads');
  
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, 'uploads'), { maxAge: '1h' })
);

//arranca el server
await new Promise<void>((resolve) => httpServer.listen({ port: 4000, host : "0.0.0.0" }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);