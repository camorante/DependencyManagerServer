/**********************************************************
 * Componente: Logger
 * Description: Usado para imprimir mensajes en consola
 * Desarrolador: Carlos Morante
 * Feha: 18 Diciembre 2024
***********************************************************/
/**
 * @description: Clase que se encarga de imprimir mensajes en consola
 */
class Logger {
    private static instance: Logger;
    private isEnabled: boolean = process.env.LOG_ENABLED === 'true';
    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Metodo para imprimir mensajes en consola
     * @param message 
     * @param options 
     */
    log(message?: any, options?: any): void {
        if(this.isEnabled)
            console.log(message, options);
    }

    /**
     * Metodo para imprimir errores de consola
     * @param message 
     * @param options 
     */
    error(message?: any, options?: any): void {
        console.error(message, options);
    }
}

export default Logger;