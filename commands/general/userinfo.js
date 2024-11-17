const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Selecciona un usuario para obtener información.')),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user; // Usuario objetivo
        const member = interaction.guild.members.cache.get(user.id);
        const configPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
        let language = 'es'; // Idioma por defecto

        // Idiomas disponibles
        const messages = {
            es: {
                title: '📜 Información del Usuario',
                description: 'Detalles sobre el usuario seleccionado.',
                id: 'ID',
                name: 'Nombre',
                color: 'Color',
                badges: 'Insignias',
                discordTime: 'Tiempo en Discord',
                membershipTime: 'Membresía en',
                roles: 'Roles',
                permissions: 'Permisos',
                isBotAdmin: 'Es Admin del Bot',
                error: 'Error',
                errorMessage: 'No se pudo obtener la información del usuario.',
                icon: 'Ver Icono',
                banner: 'Ver Banner',
                perms: 'Ver Permisos',
                noIcon: '⚠️ Este usuario no tiene un icono definido.',
                noBanner: '⚠️ Este usuario no tiene un banner.',
                noPerms: '⚠️ No se pudieron cargar los permisos del usuario.',
                viewing: 'Mostrando'
            },
            en: {
                title: '📜 User Information',
                description: 'Details about the selected user.',
                id: 'ID',
                name: 'Name',
                color: 'Color',
                badges: 'Badges',
                discordTime: 'Time in Discord',
                membershipTime: 'Membership in',
                roles: 'Roles',
                permissions: 'Permissions',
                isBotAdmin: 'Is Bot Admin',
                error: 'Error',
                errorMessage: 'Could not retrieve user information.',
                icon: 'View Icon',
                banner: 'View Banner',
                perms: 'View Permissions',
                noIcon: '⚠️ This user does not have an icon.',
                noBanner: '⚠️ This user does not have a banner.',
                noPerms: '⚠️ Could not load user permissions.',
                viewing: 'Displaying'
            },
            br: {
                title: '📜 Informações do Usuário',
                description: 'Detalhes sobre o usuário selecionado.',
                id: 'ID',
                name: 'Nome',
                color: 'Cor',
                badges: 'Distintivos',
                discordTime: 'Tempo no Discord',
                membershipTime: 'Membro em',
                roles: 'Cargos',
                permissions: 'Permissões',
                isBotAdmin: 'É Admin do Bot',
                error: 'Erro',
                errorMessage: 'Não foi possível obter as informações do usuário.',
                icon: 'Ver Ícone',
                banner: 'Ver Banner',
                perms: 'Ver Permissões',
                noIcon: '⚠️ Este usuário não possui um ícone.',
                noBanner: '⚠️ Este usuário não possui um banner.',
                noPerms: '⚠️ Não foi possível carregar as permissões do usuário.',
                viewing: 'Exibindo'
            }
        };

        // Configuración del idioma
        try {
            if (fs.existsSync(configPath)) {
                const serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                language = serverConfig.language || 'es';
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }

        const msg = messages[language] || messages['es'];

        try {
            const roles = member.roles.cache.map(role => role.toString()).join(', ') || 'Sin roles';

            // Embed principal
            const userInfoEmbed = new EmbedBuilder()
                .setColor('#03b6fc')
                .setTitle(msg.title)
                .setDescription(msg.description)
                .addFields(
                    { name: msg.id, value: user.id, inline: true },
                    { name: msg.name, value: user.tag, inline: true },
                    { name: msg.color, value: `#${member.displayHexColor.slice(1)}`, inline: true },
                    { name: msg.discordTime, value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: msg.membershipTime, value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: msg.roles, value: roles, inline: false }
                )
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setTimestamp();

            // Botones
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('view_icon')
                        .setLabel(msg.icon)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('view_banner')
                        .setLabel(msg.banner)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('view_perms')
                        .setLabel(msg.perms)
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ embeds: [userInfoEmbed], components: [row] });

            // Manejo de botones
            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'view_icon') {
                    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });
                    if (avatarUrl) {
                        await i.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#03b6fc')
                                    .setTitle(`${msg.viewing} ${msg.icon}`)
                                    .setImage(avatarUrl)
                                    .setFooter({ text: user.tag })
                            ]
                        });
                    } else {
                        await i.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle(msg.error)
                                    .setDescription(msg.noIcon)
                            ]
                        });
                    }
                } else if (i.customId === 'view_banner') {
                    const bannerUrl = user.bannerURL({ dynamic: true, size: 4096 });
                    if (bannerUrl) {
                        await i.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#03b6fc')
                                    .setTitle(`${msg.viewing} ${msg.banner}`)
                                    .setImage(bannerUrl)
                                    .setFooter({ text: user.tag })
                            ]
                        });
                    } else {
                        await i.update({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle(msg.error)
                                    .setDescription(msg.noBanner)
                            ]
                        });
                    }
                } else if (i.customId === 'view_perms') {
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#03b6fc')
                                .setTitle(`${msg.viewing} ${msg.permissions}`)
                                .setDescription(member.permissions.toArray().join(', ') || msg.noPerms)
                                .setFooter({ text: user.tag })
                        ]
                    });
                }
            });

            collector.on('end', () => interaction.editReply({ components: [] }));
        } catch (error) {
            console.error('Error al ejecutar el comando /userinfo:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(msg.error)
                .setDescription(msg.errorMessage);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
