const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Cargar la lista de administradores del bot
const botAdminsPath = path.join(__dirname, '../../config/bot_admins.json');
let botAdmins = [];
if (fs.existsSync(botAdminsPath)) {
    try {
        botAdmins = JSON.parse(fs.readFileSync(botAdminsPath, 'utf-8')).admins || [];
    } catch (error) {
        console.error("Error al leer o analizar el archivo bot_admin.json", error);
        botAdmins = []; // Establece un valor por defecto en caso de error
    }
} else {
    console.warn('El archivo bot_admin.json no se encuentra en la ruta especificada.');
}

// Soporte de idiomas
const translations = {
    en: {
        noPermission: "You don't have permission to use this command.",
        botAdmin: "You need to be a bot admin to use this command.",
        invalidMember: "Please mention a valid member to kick.",
        cannotKick: "I cannot kick this member.",
        cannotKickSelf: "You cannot kick yourself.",
        success: (member) => `${member} has been kicked successfully.`,
    },
    es: {
        noPermission: "No tienes permisos para usar este comando.",
        botAdmin: "Necesitas ser un administrador del bot para usar este comando.",
        invalidMember: "Por favor, menciona un miembro válido para expulsar.",
        cannotKick: "No puedo expulsar a este miembro.",
        cannotKickSelf: "No puedes expulsarte a ti mismo.",
        success: (member) => `${member} ha sido expulsado con éxito.`,
    },
    br: {
        noPermission: "Você não tem permissão para usar este comando.",
        botAdmin: "Você precisa ser um administrador do bot para usar este comando.",
        invalidMember: "Mencione um membro válido para expulsar.",
        cannotKick: "Não consigo expulsar este membro.",
        cannotKickSelf: "Você não pode se expulsar.",
        success: (member) => `${member} foi expulso com sucesso.`,
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a alguien del server.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Miembro a expulsar.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('member');

        // Ruta al archivo de configuración del servidor
        const configPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let language = 'es'; // Idioma por defecto

        // Leer configuración de idioma del servidor, si existe
        if (fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                language = config.language || 'es'; // Si no está configurado, usamos 'es' por defecto
            } catch (error) {
                console.error("Error al leer o analizar el archivo de configuración del servidor", error);
            }
        }

        const lang = translations[language];

        // Verificar si el usuario está intentando expulsarse a sí mismo
        if (member.id === interaction.user.id) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(lang.cannotKickSelf)
                ],
                ephemeral: true,
            });
        }

        // Verificar permisos
        if (!interaction.member.permissions.has('KickMembers') && !botAdmins.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(lang.noPermission)
                        .setDescription(lang.botAdmin)
                ],
                ephemeral: true,
            });
        }

        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle(lang.invalidMember)
                ],
                ephemeral: true,
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle(lang.cannotKick)
                ],
                ephemeral: true,
            });
        }

        try {
            await member.kick();
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#03b6fc')
                        .setTitle(lang.success(member.user.tag))
                ],
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('An error occurred while trying to kick the member.')
                ],
                ephemeral: true,
            });
        }
    },
};
