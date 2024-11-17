const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');  // Usamos node-fetch para hacer peticiones a la API externa
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Te muestra una imagen de un gato tierno.'),

    async execute(interaction) {
        // Definir respuestas para diferentes idiomas
        const catResponses = {
            en: 'Here is a cute cat for you!',
            es: '¡Aquí tienes un gato tierno para ti!',
            br: 'Aqui está um gato fofo para você!'
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

        // Verificar que el idioma sea válido en el objeto 'catResponses'
        const localizedResponse = catResponses[language] || catResponses['es'];

        // Obtener una imagen de un gato aleatorio usando una API pública
        const catAPIUrl = 'https://api.thecatapi.com/v1/images/search';  // API para obtener imágenes de gatos
        let catImageUrl;
        try {
            const response = await fetch(catAPIUrl);
            const data = await response.json();
            catImageUrl = data[0].url;  // Extrae la URL de la imagen del gato
        } catch (error) {
            console.error('Error al obtener la imagen del gato:', error);
            catImageUrl = 'https://example.com/fallback-cat-image.jpg';  // Imagen de respaldo en caso de error
        }

        // Crear el embed con la imagen del gato
        const embedMessage = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === 'en' ? 'Cute Cat' : language === 'br' ? 'Gato Fofo' : 'Gato Tierno')
            .setDescription(localizedResponse)
         .setImage(catImageUrl);

        // Responder con el embed
        await interaction.reply({ embeds: [embedMessage] });
    }
};
