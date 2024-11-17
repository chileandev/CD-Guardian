const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Asegúrate de importar 'path'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gay')
        .setDescription('Ver qué porcentaje de gay eres.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario para comprobar').setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;

        // Cargar la lista de administradores desde el archivo JSON
        let botAdmins = [];
        try {
            const adminFilePath = path.join(__dirname, '../../config', 'bot_admins.json');
            botAdmins = JSON.parse(fs.readFileSync(adminFilePath, 'utf8'));
        } catch (error) {
            console.error('Error al cargar los administradores:', error);
        }

        // Comprobar si el usuario es un administrador
        const isBotAdmin = botAdmins.admins.includes(interaction.user.id);

        // Generar el porcentaje de gay
        let gayPercentage = Math.floor(Math.random() * 101);
        if (isBotAdmin) gayPercentage = 0; // Si es un admin, el porcentaje es 0 (hetero)

        // Cargar la configuración del idioma del servidor
        let botConf = { language: 'es' };  // Valor por defecto 'es'
        try {
            const guildConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
            botConf = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
        } catch (error) {
            console.error('Error al cargar los idiomas:', error);
        }

        // Detectar el idioma preferido del servidor
        const language = botConf.language || 'es';

        // Definir los mensajes de acuerdo al idioma
        let title, description;
        let embedColor = 0x03b6fc;  // Azul (por defecto)

        if (language === 'en') {
            title = 'How Gay Are You?';
            description = `${targetUser.tag} is ${gayPercentage}% gay.`;
        } else if (language === 'br') {
            title = 'Quão Gay Você é?';
            description = `${targetUser.tag} é ${gayPercentage}% gay.`;
        } else {
            // Español es el idioma por defecto
            title = '¿Qué tan Gay Eres?';
            description = `${targetUser.tag} es ${gayPercentage}% gay.`;
        }

        // Cambiar el color del embed dependiendo del porcentaje
        if (gayPercentage < 30) embedColor = 0x00FF00;  // Verde para menos gay
        else if (gayPercentage > 70) embedColor = 0xFF0000;  // Rojo para más gay

        // Definir la URL de la imagen basada en el porcentaje
        const gifUrl = gayPercentage < 30 
            ? 'https://chileandev.github.io/Images/Bot/hetero.gif' 
            : 'https://chileandev.github.io/Images/Bot/gay.gif';

        // Crear el embed con los datos
        const embedMessage = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(title)
            .setDescription(description)
            .setImage(gifUrl);

        // Responder con el embed
        await interaction.reply({ embeds: [embedMessage] });
    }
};
