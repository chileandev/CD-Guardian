const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('luck')
        .setDescription('Descubre tu suerte para hoy.'),

    async execute(interaction) {
        // Definir respuestas de suerte para diferentes idiomas
        const luckAnswers = {
            en: ['Good luck today!', 'You might face some challenges today.', 'It will be a lucky day!', 'You should take a chance!', 'It seems like today is your day!', 'Be careful today, luck is not on your side.'],
            es: ['¡Buena suerte hoy!', 'Hoy podrías enfrentar algunos desafíos.', '¡Será un día afortunado!', '¡Deberías arriesgarte!', 'Parece que hoy es tu día!', 'Ten cuidado hoy, la suerte no está de tu lado.'],
            br: ['Boa sorte hoje!', 'Você pode enfrentar alguns desafios hoje.', 'Será um dia de sorte!', 'Você deve tentar a sorte!', 'Parece que hoje é seu dia!', 'Cuidado hoje, a sorte não está do seu lado.']
        };

        // Cargar la configuración del idioma del servidor
        let botConf = { language: 'es' };  // Valor por defecto 'es'
        try {
            const guildConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
            botConf = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
        } catch (error) {
            console.error('Error al cargar los idiomas:', error);
        }

        // Obtener el idioma del servidor, o 'es' como predeterminado
        const language = botConf.language || 'es';

        // Verificar que el idioma sea válido en el objeto 'luckAnswers'
        const localizedLuckAnswers = luckAnswers[language] || luckAnswers['es'];

        // Seleccionar una respuesta aleatoria
        const randomAnswer = localizedLuckAnswers[Math.floor(Math.random() * localizedLuckAnswers.length)];

        // Crear el embed de la suerte
        const embedMessage = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === 'en' ? 'Your Luck' : language === 'br' ? 'Sua Sorte' : 'Tu Suerte')
            .setDescription(`${language === 'en' ? 'Today, the fortune says:' : language === 'br' ? 'Hoje, a sorte diz:' : 'Hoy, la suerte dice:'} ${randomAnswer}`)
            // .setImage('https://example.com/luck-image.jpg'); // Cambia la URL de la imagen si quieres

        // Responder con el embed
        await interaction.reply({ embeds: [embedMessage] });
    }
};
