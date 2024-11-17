const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Soporte de idiomas
const translations = {
    en: {
        noWarnings: "This member has no warnings.",
        unwarnSuccess: (member, index) => `Warning #${index} was successfully removed for ${member}.`,
        invalidWarning: "Invalid warning number.",
        unwarnFail: "Failed to remove the warning.",
        noPermission: "You do not have permission to use this command.",
    },
    es: {
        noWarnings: "Este miembro no tiene advertencias.",
        unwarnSuccess: (member, index) => `La advertencia #${index} fue eliminada exitosamente para ${member}.`,
        invalidWarning: "Número de advertencia no válido.",
        unwarnFail: "No se pudo eliminar la advertencia.",
        noPermission: "No tienes permiso para usar este comando.",
    },
    br: {
        noWarnings: "Este membro não tem advertências.",
        unwarnSuccess: (member, index) => `Advertência #${index} removida com sucesso para ${member}.`,
        invalidWarning: "Número de advertência inválido.",
        unwarnFail: "Falha ao remover a advertência.",
        noPermission: "Você não tem permissão para usar este comando.",
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove a warning from a member.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Member whose warning will be removed.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('warn')
                .setDescription('Warning number to remove.')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Ruta al archivo de configuración del servidor
        const serverConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let serverConfig = { language: 'es' }; // Idioma por defecto

        // Leer configuración del servidor
        if (fs.existsSync(serverConfigPath)) {
            try {
                serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf-8'));
            } catch (error) {
                console.error("Error al leer el archivo de configuración del servidor", error);
            }
        }

        // Detectar el idioma del servidor
        const language = serverConfig.language || 'es';

        // Verificar permisos
        const adminsPath = path.join(__dirname, '../../config/bot_admins.json');
        let botAdmins = [];

        if (fs.existsSync(adminsPath)) {
            try {
                botAdmins = JSON.parse(fs.readFileSync(adminsPath, 'utf-8'));
            } catch (error) {
                console.error("Error al leer el archivo de administradores", error);
            }
        }

        if (
            !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers) &&
            !botAdmins.admins.includes(interaction.user.id) &&
            interaction.user.id !== interaction.guild.ownerId &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(translations[language].noPermission)
                ],
                ephemeral: true,
            });
        }

        const member = interaction.options.getMember('member');
        const warnIndex = interaction.options.getInteger('warn') - 1; // Convertir a índice basado en 0

        // Ruta al archivo de advertencias del servidor
        const warningsPath = path.join(__dirname, '../../warnings');
        const warningsFilePath = path.join(warningsPath, `${interaction.guild.id}.json`);

        let serverWarnings = [];

        if (fs.existsSync(warningsFilePath)) {
            try {
                serverWarnings = JSON.parse(fs.readFileSync(warningsFilePath, 'utf-8'));
            } catch (error) {
                console.error("Error al leer el archivo de advertencias", error);
            }
        }

        const memberWarnings = serverWarnings.filter(warning => warning.userId === member.id);

        if (memberWarnings.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#03b6fc')
                        .setTitle(translations[language].noWarnings)
                ],
                ephemeral: true,
            });
        }

        if (warnIndex < 0 || warnIndex >= memberWarnings.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(translations[language].invalidWarning)
                ],
                ephemeral: true,
            });
        }

        const removedWarning = serverWarnings.find(warning => warning.userId === member.id && serverWarnings.indexOf(warning) === warnIndex);

        if (removedWarning) {
            serverWarnings = serverWarnings.filter(warning => !(warning.userId === member.id && serverWarnings.indexOf(warning) === warnIndex));

            try {
                fs.writeFileSync(warningsFilePath, JSON.stringify(serverWarnings, null, 4));
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#03b6fc')
                            .setTitle(translations[language].unwarnSuccess(member.user.tag, warnIndex + 1))
                    ],
                });
            } catch (error) {
                console.error("Error al guardar las advertencias", error);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle(translations[language].unwarnFail)
                    ],
                    ephemeral: true,
                });
            }
        }
    },
};
