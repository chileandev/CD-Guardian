const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // Asegúrate de cargar el archivo .env

// Configuración de variables de entorno
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID; // Opcional, solo si estás trabajando con un servidor específico

// Función que enciende el bot y el servidor
const startApp = async () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.commands = new Collection();
    const commands = [];

    client.on('ready', async () => {
        console.log(`Bot iniciado como ${client.user.tag}`);

        // Configuración de presencia (Rich Presence)
        client.user.setActivity('CD Guardian', {
            type: ActivityType.Playing,
            details: 'Developing',
            state: 'Developing',
            startTimestamp: new Date(),
            largeImageKey: 'icon',
            largeImageText: 'Logo',
            smallImageKey: 'icon',
            smallImageText: 'Logo',
            partySize: 1,
            partyMax: 5,
            joinSecret: "MTI4NzM0OjFpMmhuZToxMjMxMjM=",
            partyId: "ae488379-351d-4a4f-ad32-2b9b01c91657"
        });

        client.user.setPresence({
            status: 'idle'
        });

        // Registro de comandos
        const commandsPath = path.join(__dirname, 'commands');

        // Cargar comandos de la carpeta 'commands'
        const loadCommands = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            entries.forEach(entry => {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    loadCommands(fullPath);  // Si es un directorio, busca recursivamente
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    const command = require(fullPath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        commands.push(command.data.toJSON());
                        console.log(`Comando cargado: ${command.data.name}`);
                    } else {
                        console.warn(`[WARNING] El archivo ${fullPath} no tiene "data" o "execute".`);
                    }
                }
            });
        };

        loadCommands(commandsPath);

        // Registrar los comandos en Discord
        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.log('Iniciando registro de comandos de aplicación...');
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log('Comandos registrados con éxito.');
        } catch (error) {
            console.error('Error al registrar los comandos:', error);
        }
    });

    // Manejar interacciones de comandos
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    });

    // Iniciar sesión con el token
    await client.login(token);

    // Configuración del servidor Express
    const app = express();
    const PORT = process.env.PORT || 3009;

    // Archivos estáticos (HTML, CSS, JS)
    app.use(express.static(path.join(__dirname, 'Page')));

    // Iniciar servidor Express
    app.listen(PORT, () => {
        console.log(`Servidor activo en http://localhost:${PORT}`);
    });
};

// Llamar a la función para iniciar el bot y el servidor
startApp();  // Esto arranca tanto el bot como el servidor Express

// Exportar la función startApp para uso en otros archivos (si es necesario)
module.exports = { startApp };
