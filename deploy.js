const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Variables de configuración
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const commands = [];

// Ruta para los comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Cargar los comandos de todas las carpetas
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    // Verifica que la carpeta es un directorio
    if (fs.statSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            try {
                const command = require(filePath);

                // Validación de los comandos
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    throw new Error(`El archivo ${filePath} no tiene "data" o "execute"`);
                }
            } catch (error) {
                console.error(`Error al cargar el comando ${filePath}:`, error);
            }
        }
    }
}

// Verifica que hay comandos para registrar
if (commands.length === 0) {
    console.warn('No se encontraron comandos para registrar.');
    process.exit(1); // Termina el proceso si no hay comandos
}

const rest = new REST({ version: '10' }).setToken(token);

// Desplegar los comandos en la API de Discord
(async () => {
    try {
        console.log(`Refrescando ${commands.length} comandos de aplicación.`);

        // Si necesitas comandos globales o por servidor, cambia la URL de Routes.applicationCommands() a Routes.guildCommands(clientId, guildId)
        await rest.put(
            Routes.applicationCommands(clientId), // Cambiar a Routes.guildCommands(clientId, guildId) si son comandos de servidor
            { body: commands }
        );

        console.log('¡Comandos registrados con éxito!');
    } catch (error) {
        console.error('Error al registrar comandos:', error);
        process.exit(1); // Termina el proceso si hay un error crítico
    }
})();
