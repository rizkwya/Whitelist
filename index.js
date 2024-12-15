require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const TOKEN = process.env.DISCORD_TOKEN;
const PANEL_URL = process.env.PANEL_URL;
const API_KEY = process.env.PANEL_API_KEY;
const SERVER_ID = process.env.SERVER_ID;

client.once('ready', async () => {
    console.log(`Bot sudah siap sebagai ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('whitelist')
            .setDescription('Menambahkan username Minecraft ke whitelist')
            .addStringOption(option =>
                option.setName('username')
                    .setDescription('Nama pengguna Minecraft yang akan ditambahkan ke whitelist')
                    .setRequired(true))
    ];

    await client.application.commands.set(commands);
    console.log('Slash commands berhasil didaftarkan!');
});

async function sendCommand(command) {
    try {
        const response = await axios.post(
            `${PANEL_URL}/api/client/servers/${SERVER_ID}/command`,
            { command },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`Perintah berhasil dikirim: ${command}`);
        return 'Username berhasil ditambahkan!';
    } catch (error) {
        console.error('Error saat mengirim perintah:', error.response?.data || error);
        return 'Username gagal ditambahkan.';
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'whitelist') {
        const username = interaction.options.getString('username');

        if (!username) {
            return interaction.reply({
                content: 'Tolong masukkan username Minecraft.',
                ephemeral: true,
            });
        }

        const response = await sendCommand(`whitelist add ${username}`);
        interaction.reply({
            content: response,
            ephemeral: true,
        });
    }
});

client.login(TOKEN);