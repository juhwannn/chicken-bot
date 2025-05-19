import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const { NODE_ENV, GUILD_ID, CLIENT_ID, DISCORD_TOKEN } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * How to deploy commands to a guild
 *
 * @see {@link https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands}
 */
const commands = [];
const foldersPath = path.join(__dirname, './src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    if (NODE_ENV === 'development') {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });

      console.log(
        'Successfully reloaded application (/) commands. on Development'
      );
    } else if (NODE_ENV === 'production') {
      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });

      console.log(
        'Successfully reloaded application (/) commands. on Production'
      );
    } else {
      throw new Error('NODE_ENV is not set to development or production');
    }
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
})();
