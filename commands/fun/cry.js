const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cry')
        .setDescription('Llora :\'C.'),

    async execute(interaction) {
        // Lista de animes y sus respectivos GIFs
        const animeGIFs = {
            'clannad': [
                'https://i.imgur.com/pWVDSh4.gifhttps://giffiles.alphacoders.com/363/36324.gif',
                'https://giffiles.alphacoders.com/363/36324.gif'
            ],
            'angel_beats': [
                'https://i.pinimg.com/originals/73/54/b6/7354b67cc09e56b8cdbfbb3b8d686923.gif',
                'https://i.gifer.com/C4hO.gif'
            ],
            'violet_evergarden': [
                'https://64.media.tumblr.com/7dc4b6f35b585580cdb3adb8159b6028/e625317011f96088-68/s540x810/2d2e38203003ac026836a6f2cea9d7f02a5037f1.gif',
                'https://64.media.tumblr.com/fb58648e9f5893923357ea61cba06518/tumblr_p6ohtuz5K41usc9y9o3_540.gifv'
            ],
            'toradora': [
                'https://i.pinimg.com/originals/ed/ca/f8/edcaf87cbe17885304c1c5fb9585090d.gif',
                'https://c.tenor.com/QWbapCaUJ3MAAAAd/tenor.gif',
                "https://animesher.com/orig/0/8/81/814/animesher.com_draw-toradora-black-and-white-81477.gif"
            ],
            'naruto': [
                'https://i.pinimg.com/originals/c1/4d/1d/c14d1ddf7331ac4177cb535390f9e75a.gif',
                'https://64.media.tumblr.com/cf368fe56c0bf8ab4ba8f26e2ee1b2e2/aa3b030b86bc8377-75/s640x960/374aa4131fe8e3520568ea8b4a48ca62548c3f4f.gif',
                "https://media.tenor.com/vcancYPIgOMAAAAC/sad-cry.gif"      
            ]
        };

        // Función para hacer un nombre más amigable (sin guiones bajos)
        function formatAnimeName(name) {
            return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        // Escoger un anime aleatorio
        const randomAnime = Object.keys(animeGIFs)[Math.floor(Math.random() * Object.keys(animeGIFs).length)];
        const gifArray = animeGIFs[randomAnime];
        const randomGif = gifArray[Math.floor(Math.random() * gifArray.length)];

        // Crear embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')  // Color azul claro
            .setTitle(`${interaction.user.username} está llorando...`)
            .setImage(randomGif)
            .setFooter({ text: `Anime: ${formatAnimeName(randomAnime)}` });

        // Enviar el embed al canal
        await interaction.reply({ embeds: [embed] });
    },
};