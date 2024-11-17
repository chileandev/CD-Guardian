const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Soporte de idiomas
const translations = {
    en: {
        noPermission: "You don't have permission to use this command.",
        botAdmin: "You need to be a bot admin to use this command.",
        invalidMember: "Please mention a valid member to warn.",
        success: (member) => `${member} has been warned.`,
        reason: "Reason", // Traducción para "Razón"
    },
    es: {
        noPermission: "No tienes permisos para usar este comando.",
        botAdmin: "Necesitas ser un administrador del bot para usar este comando.",
        invalidMember: "Por favor, menciona un miembro válido para advertir.",
        success: (member) => `${member} ha sido advertido.`,
        reason: "Razón", // Traducción para "Razón"
    },
    br: {
        noPermission: "Você não tem permissão para usar este comando.",
        botAdmin: "Você precisa ser um administrador do bot para usar este comando.",
        invalidMember: "Mencione um membro válido para advertir.",
        success: (member) => `${member} foi advertido.`,
        reason: "Razão", // Traducción para "Razão"
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un miembro.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Miembro a advertir.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Razón de la advertencia.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'No reason provided'; // Razón por defecto

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

        // Verificar si el miembro es válido
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

        // Verificar si el usuario tiene permiso para usar el comando
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const botAdminsPath = path.join(__dirname, '../../config', 'bot_admins.json');
            let botAdmins = [];

            // Leer archivo bot_admins.json para obtener los administradores
            if (fs.existsSync(botAdminsPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(botAdminsPath, 'utf-8'));

                    // Asegurar que 'admins' sea un arreglo
                    botAdmins = Array.isArray(config.admins) ? config.admins : [];
                } catch (error) {
                    console.error("Error al leer el archivo de administradores de bots", error);
                }
            }

            // Verificar si el usuario está en la lista de administradores de bots
            if (!botAdmins.includes(interaction.user.id)) {
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
        }

        // Verificar y crear carpeta de warnings si no existe
        const warningsPath = path.join(__dirname, '../../warnings');
        if (!fs.existsSync(warningsPath)) {
            fs.mkdirSync(warningsPath);
            console.log("Carpeta 'warnings' creada.");
        }

        // Ruta al archivo de advertencias del servidor
        const warningsFilePath = path.join(warningsPath, `${interaction.guild.id}.json`);
        let serverWarnings = [];

        // Si el archivo de advertencias del servidor ya existe, leerlo
        if (fs.existsSync(warningsFilePath)) {
            try {
                serverWarnings = JSON.parse(fs.readFileSync(warningsFilePath, 'utf-8'));
            } catch (error) {
                console.error("Error al leer el archivo de advertencias", error);
            }
        }

        // Crear la nueva advertencia
        const warning = {
            userId: member.id,
            warnedBy: interaction.user.id,
            reason: reason,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        };

        // Añadir la nueva advertencia al arreglo de advertencias del servidor
        serverWarnings.push(warning);

        // Escribir las advertencias actualizadas en el archivo
        try {
            fs.writeFileSync(warningsFilePath, JSON.stringify(serverWarnings, null, 4));
            console.log(`Advertencia registrada para el miembro ${member.user.tag}`);
        } catch (error) {
            console.error("Error al guardar las advertencias", error);
        }

        // Responder con mensaje de éxito
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#03b6fc')
                    .setTitle(lang.success(member.user.tag))
                    .setDescription(`${lang.reason}: ${reason}`)
            ],
        });
    },
};
