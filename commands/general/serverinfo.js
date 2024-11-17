const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información sobre el servidor.'),
    async execute(interaction) {
        const configPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let language = 'es'; // Idioma por defecto

        let premium = 'No'; // Estado premium por defecto
        let adminStatus = 'No'; // Estado de Admin por defecto
        let partnerStatus = 'No'; // Estado de Partner por defecto

        try {
            // Verifica si el archivo de configuración del servidor existe
            if (fs.existsSync(configPath)) {
                const serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

                // Asigna la configuración del servidor
                language = serverConfig.language || 'es';
                premium = serverConfig.premium ? 'Sí' : 'No';
                adminStatus = serverConfig.admin ? 'Sí' : 'No';
                partnerStatus = serverConfig.partner ? 'Sí' : 'No';
            }

            // Mensajes en diferentes idiomas
            const messages = {
                es: {
                    title: '🏰 Información del Servidor',
                    createdAt: '📅 Fecha de creación',
                    members: '👥 Miembros',
                    channels: '💬 Canales',
                    region: '🏜️ Región',
                    verificationLevel: '🔒 Verificación',
                    owner: '👑 Dueño/a',
                    language: '🌐 Idioma del bot',
                    premiumStatus: '💎 Estado Premium',
                    adminStatus: '🛠️ Es Admin',
                    partnerStatus: '🤝 Es Partner',
                    roles: '⚔️ Roles',
                    emojis: '😀 Emojis',
                    boosts: '🚀 Mejoras',
                    noBanner: 'No hay banner disponible para este servidor.',
                    noIcon: 'No hay icono disponible para este servidor.',
                    error: 'Error',
                    errorMessage: 'Hubo un error al intentar obtener la información del servidor.',
                    bannerButton: 'Ver Banner',
                    iconButton: 'Ver Icono'
                },
                en: {
                    title: '🏰 Server Information',
                    createdAt: '📅 Created on',
                    members: '👥 Members',
                    channels: '💬 Channels',
                    region: '🏜️ Region',
                    verificationLevel: '🔒 Verification Level',
                    owner: '👑 Owner',
                    language: '🌐 Bot Language',
                    premiumStatus: '💎 Premium Status',
                    adminStatus: '🛠️ Is Admin',
                    partnerStatus: '🤝 Is Partner',
                    roles: '⚔️ Roles',
                    emojis: '😀 Emojis',
                    boosts: '🚀 Boosts',
                    noBanner: 'No banner available for this server.',
                    noIcon: 'No icon available for this server.',
                    error: 'Error',
                    errorMessage: 'There was an error retrieving the server information.',
                    bannerButton: 'View Banner',
                    iconButton: 'View Icon'
                }
            };

            const msg = messages[language] || messages['es'];

            // Recoge la información del servidor
            const createdAt = `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`; // Timestamp formateado
            const memberCount = interaction.guild.memberCount;
            const channelCount = interaction.guild.channels.cache.size;
            const region = interaction.guild.region;
            const verificationLevel = interaction.guild.verificationLevel;
            const roleCount = interaction.guild.roles.cache.size;
            const emojiCount = interaction.guild.emojis.cache.size;
            const boostCount = interaction.guild.premiumSubscriptionCount;

            // Asegurándose de que el bot pueda obtener el propietario
            let owner;
            try {
                owner = await interaction.guild.fetchOwner();
            } catch (error) {
                console.error('Error al obtener el propietario del servidor:', error);
                owner = `Error: ${error.message}`;
            }

            // Asegurándonos de que todos los valores sean cadenas
            const safeOwner = owner.user ? owner.user.tag : String(owner);
            const safeRegion = region ? String(region) : 'Unknown';
            const safeVerificationLevel = verificationLevel ? String(verificationLevel) : 'Unknown';

            // Crea el embed con estilo compacto y color #03b6fc
            const embed = new EmbedBuilder()
                .setColor('#03b6fc') // Color azul claro
                .setTitle(interaction.guild.name) // Nombre del servidor como título
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() }) // Nombre y logo del servidor
                .addFields(
                    { name: msg.createdAt, value: createdAt, inline: true },
                    { name: msg.members, value: String(memberCount), inline: true },
                    { name: msg.channels, value: String(channelCount), inline: true },
                    { name: msg.region, value: safeRegion, inline: true },
                    { name: msg.verificationLevel, value: safeVerificationLevel, inline: true },
                    { name: msg.owner, value: `<@${interaction.guild.ownerId}>`, inline: true },
                    { name: msg.language, value: language, inline: true },
                    { name: msg.premiumStatus, value: premium, inline: true },
                    { name: msg.adminStatus, value: adminStatus, inline: true },
                    { name: msg.partnerStatus, value: partnerStatus, inline: true },
                    { name: msg.roles, value: String(roleCount), inline: true },
                    { name: msg.emojis, value: String(emojiCount), inline: true },
                    { name: msg.boosts, value: String(boostCount), inline: true }
                )
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setTimestamp();

            // Botones para el banner e icono del servidor
            const bannerButton = new ButtonBuilder()
                .setLabel(msg.bannerButton)
                .setStyle(ButtonStyle.Secondary) // Botón gris
                .setCustomId('show_banner');

            const iconButton = new ButtonBuilder()
                .setLabel(msg.iconButton)
                .setStyle(ButtonStyle.Secondary) // Botón gris
                .setCustomId('show_icon');

            // Responde con el embed y los botones
            await interaction.reply({ embeds: [embed], components: [{ type: 1, components: [bannerButton, iconButton] }] });

            // Reaccionamos al evento de interacción de botón
            const filter = i => i.user.id === interaction.user.id; // Filtrar interacciones del usuario que solicitó el comando

            const collector = interaction.channel.createMessageComponentCollector({ filter });

            collector.on('collect', async i => {
                if (i.customId === 'show_banner') {
                    const bannerUrl = interaction.guild.bannerURL({ size: 1024 });
                    if (bannerUrl) {
                        const embedWithBanner = new EmbedBuilder()
                            .setColor('#03b6fc') // Color azul claro
                            .setTitle(interaction.guild.name) // Nombre del servidor como título
                            .setImage(bannerUrl)
                            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                            .setTimestamp();

                        await i.update({ embeds: [embedWithBanner] });
                    } else {
                        const noBannerEmbed = new EmbedBuilder()
                            .setColor('#FF0000') // Rojo para error
                            .setTitle(msg.error)
                            .setDescription(msg.noBanner);
                        await i.update({ embeds: [noBannerEmbed] });
                    }
                } else if (i.customId === 'show_icon') {
                    const iconUrl = interaction.guild.iconURL({ size: 1024 });
                    if (iconUrl) {
                        const embedWithIcon = new EmbedBuilder()
                            .setColor('#03b6fc') // Color azul claro
                            .setTitle(interaction.guild.name) // Nombre del servidor como título
                            .setImage(iconUrl)
                            .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                            .setTimestamp();

                        await i.update({ embeds: [embedWithIcon] });
                    } else {
                        const noIconEmbed = new EmbedBuilder()
                            .setColor('#FF0000') // Rojo para error
                            .setTitle(msg.error)
                            .setDescription(msg.noIcon);
                        await i.update({ embeds: [noIconEmbed] });
                    }
                }
            });
        } catch (error) {
            console.error('Error al ejecutar el comando /serverinfo:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Rojo para error
                .setTitle(msg.error)
                .setDescription(msg.errorMessage);
            await interaction.reply({ embeds: [errorEmbed] });
        }
    }
};