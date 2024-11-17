const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');  // Usamos node-fetch para hacer peticiones a la API externa
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Te muestra una imagen de un perro tierno.'),

    async execute(interaction) {
        // Definir respuestas para diferentes idiomas
        const dogResponses = {
            en: 'Here is a cute dog for you!',
            es: '¡Aquí tienes un perro tierno para ti!',
            br: 'Aqui está um cachorro fofo para você!'
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

        // Verificar que el idioma sea válido en el objeto 'dogResponses'
        const localizedResponse = dogResponses[language] || dogResponses['es'];

        // Obtener una imagen de un perro aleatorio usando una API pública
        const dogAPIUrl = 'https://dog.ceo/api/breeds/image/random';
        let dogImageUrl;
        try {
            const response = await fetch(dogAPIUrl);
            const data = await response.json();
            dogImageUrl = data.message;
        } catch (error) {
            console.error('Error al obtener la imagen del perro:', error);
            dogImageUrl = 'https://example.com/fallback-dog-image.jpg';  // Imagen de respaldo en caso de error
        }

        // Crear el embed con la imagen del perro
        const embedMessage = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === 'en' ? 'Cute Dog' : language === 'br' ? 'Cachorro Fofo' : 'Perro Tierno')
            .setDescription(localizedResponse)
      .setImage(dogImageUrl);

        // Responder con el embed
        await interaction.reply({ embeds: [embedMessage] });
    }
};
