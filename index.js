const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // Asegúrate de cargar el archivo .env
const clientId = process.env.CLIENT_ID;

// Configuración del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    client.commands = new Collection();

    // Función recursiva para cargar comandos
    const loadCommands = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                loadCommands(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const command = require(fullPath);
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON()); // Para registrar en Discord
                    console.log(`Cargado comando: ${command.data.name}`);
                } else {
                    console.warn(`[WARNING] El archivo en ${fullPath} no tiene "data" o "execute".`);
                }
            }
        });
    };

    loadCommands(commandsPath);

    // Registrar comandos en Discord
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Iniciando registro de comandos de aplicación...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log('Comandos registrados con éxito.');
    } catch (error) {
        console.error('Error al registrar los comandos:', error);
    }
});

// Manejo de interacciones
client.on('interactionCreate', async interaction => {
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

// Inicia sesión en Discord
client.login(process.env.TOKEN);

// Configuración del servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para datos dinámicos del bot
app.get('/api/status', (req, res) => {
    const ping = client.ws.ping;
    const active = client.uptime > 0;
    const guilds = client.guilds.cache.size;
    const users = client.users.cache.size;
    const uptime = client.uptime ? Math.floor(client.uptime / 1000) : 0;

    res.json({ active, ping, guilds, users, uptime });
});

// Inicia el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
