const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Cambia el idioma del bot.')
        .addStringOption(option =>
            option.setName('lang')
                .setDescription('Selecciona')
                .setRequired(true)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Spanish', value: 'es' },
                    { name: 'Brazilian', value: 'br' }
                )),
    async execute(interaction) {
        const selectedLanguage = interaction.options.getString('lang');
        const configPath = path.join(__dirname, '../../config');
        const serverConfigPath = path.join(configPath, `${interaction.guild.id}.json`);

        // Default language
        let serverConfig = { language: 'es' };

        if (fs.existsSync(serverConfigPath)) {
            serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
        }

        serverConfig.language = selectedLanguage;
        fs.writeFileSync(serverConfigPath, JSON.stringify(serverConfig, null, 4));

        // Message content based on language
        const messages = {
            en: 'Language has been set to English.',
            es: 'El idioma ha sido configurado a Español.',
            br: 'O idioma foi configurado para o Português.'
        };

        const msg = messages[selectedLanguage] || messages['es'];

        // Send the response
        await interaction.reply(msg);
    }
};