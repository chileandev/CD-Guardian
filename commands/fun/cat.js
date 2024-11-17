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
        // Verificar si el comando se está ejecutando en un servidor
        if (!interaction.guild) {
            return await interaction.reply('Este comando solo puede ser ejecutado en un servidor.');
        }

        // Definir respuestas para diferentes idiomas
        const catResponses = {
            en: 'Here is a cute cat for you!',
            es: '¡Aquí tienes un gato tierno para ti!',
            br: 'Aqui está um gato fofo para você!'
        };

        // Cargar la configuración del idioma del servidor
        let botConf = { language: 'es' };  // Valor por defecto 'es'

        // Ruta del archivo de configuración del servidor
        const guildConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);

        try {
            // Verificar si el archivo de configuración existe
            if (fs.existsSync(guildConfigPath)) {
                botConf = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
            } else {
                console.log(`Archivo de configuración no encontrado para el servidor ${interaction.guild.id}. Usando configuración por defecto.`);
            }
        } catch (error) {
            console.error('Error al cargar el archivo de configuración:', error);
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
            catImageUrl = data[0]?.url || 'https://example.com/fallback-cat-image.jpg';  // Usar una URL de respaldo si no se encuentra la imagen
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

        try {
            // Responder con el embed
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Error al enviar la respuesta del embed:', error);
        }
    }
};
