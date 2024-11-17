const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bandland')
        .setDescription('Muestra los miembros baneados del servidor.'),
    async execute(interaction) {
        // Load server config
        const serverConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let serverConfig = { language: 'es' };

        if (fs.existsSync(serverConfigPath)) {
            serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf-8'));
        }

        const language = serverConfig.language || 'es';

        // Translations
        const translations = {
            en: {
                titles: {
                    bannedMembers: 'Banned Members',
                    noBans: 'No bans found'
                },
                messages: {
                    noBans: 'There are no banned members in this server.'
                }
            },
            es: {
                titles: {
                    bannedMembers: 'Miembros Baneados',
                    noBans: 'No hay baneos'
                },
                messages: {
                    noBans: 'No hay miembros baneados en este servidor.'
                }
            }
        };

        const t = translations[language];

        try {
            // Get banned members
            const bans = await interaction.guild.bans.fetch();

            if (bans.size === 0) {
                const embed = new EmbedBuilder()
                    .setTitle(t.titles.noBans)
                    .setDescription(t.messages.noBans)
                    .setColor('#FF0000'); // Red
                return interaction.reply({ embeds: [embed] });
            }

            // Format the banned members list
            const bannedList = bans.map(ban => `**${ban.user.tag}** - ${ban.reason || 'Sin razón'}`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(t.titles.bannedMembers)
                .setDescription(bannedList)
                .setColor('#03b6fc'); // Green

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error ejecutando el comando 'bandland':", error);
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('Hubo un error al obtener los baneos.')
                .setColor('#FF0000'); // Red
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
