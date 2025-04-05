import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'node:fs/promises';
import {
  Collection,
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags,
} from 'discord.js';
import { connectDB } from '#databases/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @see {@link https://discordjs.guide/slash-commands/response-methods.html}
 */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const foldersPath = join(__dirname, 'src/commands');
const commandFolders = await fs.readdir(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = (await fs.readdir(commandsPath)).filter((file) =>
    file.endsWith('.js')
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { data, execute } = await import(`file://${filePath}`);

    if (data && execute) {
      client.commands.set(data.name, { data, execute });
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const replyPayload = {
      content: 'There was an error while executing this command!',
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  }
});

connectDB().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
