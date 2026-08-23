const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");


/* =========================================================
   ENVIRONMENT VARIABLES
   ========================================================= */

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;


/* =========================================================
   CHECK CONFIGURATION
   ========================================================= */

if (!TOKEN) {
    console.error("❌ DISCORD_TOKEN is missing!");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ CLIENT_ID is missing!");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("❌ GUILD_ID is missing!");
    process.exit(1);
}


/* =========================================================
   AUTHORIZED USERS
   =========================================================
   
   Put the Discord USER IDs of people who are allowed
   to use /message here.

   Example:

   const AUTHORIZED_USERS = [
       "123456789012345678",
       "987654321098765432"
   ];

   Do NOT use usernames here.
   Use Discord user IDs.
*/

const AUTHORIZED_USERS = [
    // "YOUR_DISCORD_USER_ID",
    // "ANOTHER_DISCORD_USER_ID"
];


/* =========================================================
   CREATE CLIENT
   ========================================================= */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});


/* =========================================================
   SLASH COMMAND
   ========================================================= */

const commands = [

    new SlashCommandBuilder()
        .setName("message")
        .setDescription("Send a private message to a Discord user.")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to message")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The message to send")
                .setRequired(true)
        )

].map(command => command.toJSON());


/* =========================================================
   DISCORD REST API
   ========================================================= */

const rest = new REST({
    version: "10"
}).setToken(TOKEN);


/* =========================================================
   REGISTER COMMAND
   ========================================================= */

async function registerCommands() {

    console.log("Registering Glyde commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        ),
        {
            body: commands
        }
    );

    console.log("✅ Commands registered!");
}


/* =========================================================
   BOT READY
   ========================================================= */

client.once("ready", async () => {

    console.log(
        `🤖 Glyde is online as ${client.user.tag}`
    );

    try {

        await registerCommands();

    } catch (error) {

        console.error(
            "❌ Failed to register commands:"
        );

        console.error(error);

    }

});


/* =========================================================
   INTERACTION HANDLER
   ========================================================= */

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) {
        return;
    }


    /* =====================================================
       /MESSAGE
       ===================================================== */

    if (interaction.commandName === "message") {


        /* =================================================
           PERMISSION CHECK
           ================================================= */

        if (
            !AUTHORIZED_USERS.includes(
                interaction.user.id
            )
        ) {

            await interaction.reply({
                content:
                    "❌ You don't have permission to use this command.",
                ephemeral: true
            });

            return;
        }


        /* =================================================
           GET OPTIONS
           ================================================= */

        const user =
            interaction.options.getUser("user");

        const message =
            interaction.options.getString("message");


        /* =================================================
           TRY TO SEND DM
           ================================================= */

        try {

            await user.send({

                embeds: [

                    {
                        title:
                            "📨 Message from the Server",

                        description:
                            message,

                        color:
                            0x5865F2,

                        footer: {
                            text:
                                "Glyde • Server Communications"
                        },

                        timestamp:
                            new Date().toISOString()
                    }

                ]

            });


            /* =============================================
               SUCCESS
               ============================================= */

            await interaction.reply({

                content:
                    `✅ Message sent to **${user.tag}**!`,

                ephemeral: true

            });

            console.log(
                `📨 Message sent to ${user.tag} by ${interaction.user.tag}`
            );

        }


        /* =================================================
           FAILED TO DM
           ================================================= */

        catch (error) {

            console.error(
                `Failed to DM ${user.tag}:`,
                error
            );


            await interaction.reply({

                content:
                    "❌ I couldn't DM that user. Their DMs may be disabled.",

                ephemeral: true

            });

        }

    }

});


/* =========================================================
   LOGIN
   ========================================================= */

client.login(TOKEN);
