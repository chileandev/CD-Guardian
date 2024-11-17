const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Asegúrate de importar 'path'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hazle una pregunta a la bola mágica.')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('La pregunta que le quieres hacer a la bola mágica')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('pregunta');

        // Definir respuestas para los diferentes idiomas
        const answers = {
            en: ['Yes', 'No', 'Maybe', 'Definitely', 'Not sure', 'I don’t think so', 'I see yes', 'Definitely not', 'Ask again'],
            es: ['Sí', 'No', 'Tal vez', 'Definitivamente', 'No estoy seguro', 'No lo creo', 'Puedo ver que sí', 'Claro que no', 'Pregunta de nuevo'],
            br: ['Sim', 'Não', 'Talvez', 'Definitivamente', 'Não tenho certeza', 'Eu não acho', 'Eu vejo sim', 'Definitivamente não', 'Pergunte novamente']
        };

        // Cargar la configuración del idioma del servidor
        let botConf = { language: 'es' };  // Valor por defecto 'es'
        try {
            const guildConfigPath = path.join(__dirname, '../../config', `${interaction.guild.id}.json`);
            botConf = JSON.parse(fs.readFileSync(guildConfigPath, 'utf8'));
        } catch (error) {
            console.error('Error al cargar los idiomas:', error);
        }

        // Obtener el idioma del servidor, o 'es' como predeterminado
        const language = botConf.language || 'es';

        // Verificar que el idioma sea válido en el objeto 'answers'
        const localizedAnswers = answers[language] || answers['es'];

        // Seleccionar una respuesta aleatoria
        const randomAnswer = localizedAnswers[Math.floor(Math.random() * localizedAnswers.length)];

        // Crear el embed de la respuesta
        const embedMessage = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(language === 'en' ? 'Magic Ball Response' : language === 'br' ? 'Resposta da Bola Mágica' : 'Respuesta de la Bola Mágica')
            .setDescription(`${language === 'en' ? 'The Magic Ball says' : language === 'br' ? 'A Bola Mágica diz' : 'La Bola Mágica dice'}: ${randomAnswer}`)
            .setImage('https://chileandev.github.io/Images/Bot/8ball.gif')
            .addFields(
                {
                    name: language === 'en' ? 'Your question' : language === 'br' ? 'Sua pergunta' : 'Tu pregunta',
                    value: question,
                },
            );

        // Responder con el embed
        await interaction.reply({ embeds: [embedMessage] });
    }
};
