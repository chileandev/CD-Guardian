const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)),
    async execute(interaction) {
        // Load server config
        const serverConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let serverConfig = { language: 'es', admins: [] };

        if (fs.existsSync(serverConfigPath)) {
            serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf-8'));
        }

        const AdminsConfigPath = path.join(__dirname, '../../config/bot_admins.json');
        let AdminsConfig = [];

        if (fs.existsSync(AdminsConfigPath)) {
                AdminsConfig = JSON.parse(fs.readFileSync(AdminsConfigPath, 'utf-8'));
        }

        const language = serverConfig.language || 'es';
        const botAdmins = AdminsConfig.admins || [];

        // Translations
        const translations = {
            en: {
                titles: {
                    noPermission: 'Permission Denied',
                    cannotBan: 'Action Denied',
                    banned: 'Member Banned',
                    error: 'Error'
                },
                messages: {
                    noPermission: 'You do not have permission to use this command.',
                    cannotBan: 'I cannot ban this member.',
                    banned: (user, reason) => `${user} has been banned. Reason: ${reason || 'No reason provided.'}`,
                    error: 'An error occurred while executing this command.'
                }
            },
            es: {
                titles: {
                    noPermission: 'Permiso Denegado',
                    cannotBan: 'Acción Denegada',
                    banned: 'Miembro Baneado',
                    error: 'Error'
                },
                messages: {
                    noPermission: 'No tienes permiso para usar este comando.',
                    cannotBan: 'No puedo banear a este miembro.',
                    banned: (user, reason) => `${user} ha sido baneado. Razón: ${reason || 'Sin razón proporcionada.'}`,
                    error: 'Hubo un error al ejecutar este comando.'
                }
            }
        };

        const t = translations[language];

        try {
            const member = interaction.options.getMember('member');
            const reason = interaction.options.getString('reason');

            // Check permissions
            if (
                !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers) &&
                !botAdmins.includes(interaction.user.id) &&
                interaction.user.id !== interaction.guild.ownerId &&
                !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
            ) {
                const embed = new EmbedBuilder()
                    .setTitle(t.titles.noPermission)
                    .setDescription(t.messages.noPermission)
                    .setColor('#FF0000'); // Red
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                const embed = new EmbedBuilder()
                    .setTitle(t.titles.cannotBan)
                    .setDescription(t.messages.cannotBan)
                    .setColor('#FF0000'); // Red
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (!member.bannable) {
                const embed = new EmbedBuilder()
                    .setTitle(t.titles.cannotBan)
                    .setDescription(t.messages.cannotBan)
                    .setColor('#FF0000'); // Red
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Ban the user
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setTitle(t.titles.banned)
                .setDescription(t.messages.banned(member.user.tag, reason))
                .setColor('#03b6fc'); // Green
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error ejecutando el comando 'ban':", error);
            const embed = new EmbedBuilder()
                .setTitle(t.titles.error)
                .setDescription(t.messages.error)
                .setColor('#FF0000'); // Red
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }
        }
    }
};
