const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Cargar las variables de entorno

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Puedes especificar un servidor para pruebas
const token = process.env.TOKEN;

// Configuración del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commands = [];

// Cargar todos los comandos desde las carpetas
const loadCommands = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            loadCommands(fullPath); // Si es un directorio, buscar recursivamente
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const command = require(fullPath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`Cargado comando: ${command.data.name}`);
            } else {
                console.warn(`[WARNING] El archivo ${fullPath} no tiene "data" o "execute".`);
            }
        }
    });
};

// Cargar los comandos
const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

// No registrar los comandos en Discord si solo queremos probarlos localmente
const registerCommands = async () => {
    // Aquí no registramos comandos, ya que solo estamos probándolos localmente
    console.log('Comandos cargados localmente, no registrados en Discord.');
};

// Verificar si los comandos funcionan correctamente
const testCommands = async (commandName = null) => {
    client.on('ready', () => {
        console.log(`Bot ${client.user.tag} está listo para probar comandos`);

        if (commandName) {
            // Si se pasa un nombre de comando, probamos solo ese comando
            const command = client.commands.get(commandName);
            if (command) {
                executeCommand(command);
            } else {
                console.error(`Comando ${commandName} no encontrado.`);
            }
        } else {
            // Si no se pasa un nombre, probamos todos los comandos
            client.commands.forEach(executeCommand);
        }
    });
};

// Función para ejecutar un comando
const executeCommand = async (command) => {
    try {
        // Crear un objeto de prueba de interacción
        const interaction = {
            isCommand: () => true,
            commandName: command.data.name,
            reply: async (message) => console.log(`Comando ${command.data.name}: ${message}`)
        };

        // Ejecutar el comando
        await command.execute(interaction);
        console.log(`Comando ${command.data.name} ejecutado correctamente.`);
    } catch (error) {
        console.error(`Error al ejecutar el comando ${command.data.name}:`, error);
    }
};

// Iniciar todo
const start = async () => {
    await registerCommands();  // No registrar comandos en Discord
    await client.login(token);

    const commandArg = process.argv[2];  // Obtener el tercer argumento (nombre del comando)

    if (commandArg) {
        // Si se pasa un nombre de comando, probar ese comando
        await testCommands(commandArg);
    }
};

start();
