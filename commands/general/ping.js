const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Dynamic description'), // Placeholder
    async execute(interaction) {
        // Ruta del archivo de configuración del servidor
        const configPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let language = 'es'; // Idioma por defecto

        try {
            // Lee el archivo de configuración para obtener el idioma
            if (fs.existsSync(configPath)) {
                const serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                language = serverConfig.language || 'es'; // Usa el idioma configurado o 'es' por defecto
            }

            // Mensajes en diferentes idiomas
            const messages = {
                en: {
                    description: "Check the bot's latency.",
                    title: '🏓 Bot Latency',
                    websocket: 'WebSocket Latency',
                    roundtrip: 'Round-trip Time',
                    footer: 'Latency test completed'
                },
                es: {
                    description: 'Verifica la latencia del bot.',
                    title: '🏓 Latencia del Bot',
                    websocket: 'Latencia de WebSocket',
                    roundtrip: 'Tiempo de ida y vuelta',
                    footer: 'Prueba de latencia completada'
                },
                br: {
                    description: 'Verifique a latência do bot.',
                    title: '🏓 Latência do Bot',
                    websocket: 'Latência WebSocket',
                    roundtrip: 'Tempo de ida e volta',
                    footer: 'Teste de latência concluído'
                }
            };

            const msg = messages[language] || messages.en;

            // Mide la latencia
            const latency = Date.now() - interaction.createdTimestamp;
            const websocketPing = interaction.client.ws.ping;

            // Crea el embed con estilo
            const embed = new EmbedBuilder()
                .setColor('#03b6fc') // Verde brillante
                .setTitle(msg.title)
                .setDescription(msg.description)  // Agregar descripción dinámica
                .addFields(
                    { name: msg.websocket, value: `${websocketPing}ms`, inline: true },
                    { name: msg.roundtrip, value: `${latency}ms`, inline: true }
                )
                .setFooter({ text: msg.footer })
                .setTimestamp();

            // Responde con el embed
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error ejecutando el comando 'ping':", error);
            await interaction.reply("There was an error processing your request.");
        }
    }
};