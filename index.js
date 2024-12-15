require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const TOKEN = process.env.DISCORD_TOKEN;
const PANEL_URL = process.env.PANEL_URL;
const API_KEY = process.env.PANEL_API_KEY;
const SERVER_ID = process.env.SERVER_ID;

client.once('ready', async () => {
    console.log(`Bot is ready as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('whitelist')
            .setDescription('Add Minecraft username to whitelist')
            .addStringOption(option =>
                option.setName('username')
                    .setDescription('Minecraft username to add to whitelist')
                    .setRequired(true))
    ];

    await client.application.commands.set(commands);
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
        console.log(`The command was sent successfully: ${command}`);
        return 'Username added successfully!';
    } catch (error) {
        console.error('Error sending command:', error.response?.data || error);
        return 'Username failed to add.';
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'whitelist') {
        const username = interaction.options.getString('username');

        if (!username) {
            return interaction.reply({
                content: 'Please enter the Minecraft username.',
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
