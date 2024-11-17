const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Soporte de idiomas
const translations = {
    en: {
        noWarnings: "This member has no warnings.",
        warnings: "Warnings",
        userWarnings: (member) => `${member} has the following warnings:`,
        warnedBy: "Warned by",
        reason: "Reason",
        date: "Date",
        time: "Time",
    },
    es: {
        noWarnings: "Este miembro no tiene advertencias.",
        warnings: "Advertencias",
        userWarnings: (member) => `${member} tiene las siguientes advertencias:`,
        warnedBy: "Advertido por",
        reason: "Razón",
        date: "Fecha",
        time: "Hora",
    },
    br: {
        noWarnings: "Este membro não tem advertências.",
        warnings: "Advertências",
        userWarnings: (member) => `${member} tem as seguintes advertências:`,
        warnedBy: "Advertido por",
        reason: "Razão",
        date: "Data",
        time: "Hora",
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Muestra las advertencias de un miembro.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Miembro para ver las advertencias.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Verificar si estamos en un servidor (guild)
        if (!interaction.guild) {
            return interaction.reply({
                content: 'Este comando solo se puede usar en un servidor.',
                ephemeral: true
            });
        }

        // Obtener el miembro, usando fetch en caso de que no esté disponible directamente
        const member = await interaction.guild.members.fetch(interaction.options.getUser('member').id).catch(error => {
            console.error("Error al obtener el miembro:", error);
            return null; // En caso de error, devolvemos null
        });

        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Miembro no encontrado')
                        .setDescription('No se pudo encontrar al miembro solicitado.')
                ],
                ephemeral: true
            });
        }

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

        // Configurar idioma de respuesta
        const lang = translations[language];

        // Verificar y leer las advertencias del servidor
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

        // Filtrar las advertencias del miembro
        const memberWarnings = serverWarnings.filter(warning => warning.userId === member.id);

        if (memberWarnings.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle(lang.noWarnings)
                ],
                ephemeral: true,
            });
        }

        // Crear un embed con las advertencias del miembro
        const warningsEmbed = new EmbedBuilder()
            .setColor('#03b6fc')
            .setTitle(lang.userWarnings(member.user.tag));

        // Añadir los fields con la información de las advertencias
        memberWarnings.forEach((warning, index) => {
            warningsEmbed.addFields(
                {
                    name: `${lang.warnings} #${index + 1}`,
                    value: `${lang.reason}: ${warning.reason}\n${lang.date}: ${warning.date}\n${lang.time}: ${warning.time}\n${lang.warnedBy}: <@${warning.warnedBy}>`,
                    inline: false,
                }
            );
        });

        return interaction.reply({
            embeds: [warningsEmbed],
        });
    },
};
