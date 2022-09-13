declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            guildId: string;
            environment: "dev" | "prod" | "debug";
            mongoURI: string;
            openaiKey: string;
        }
    }
}

export {}
