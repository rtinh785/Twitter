declare namespace NodeJS {
  interface ProcessEnv {
    DB_NAME: string
    DB_USERNAME: string
    DB_PASSWORD: string
    DB_USERS_COLLECTION: string
    DB_REFRESH_TOKENS_COLLECTION: string
    PASSWORD_SECRET: string
    JWT_SECRET: string
    ACCESS_TOKEN_EXPRIRES_IN: string
    RERESH_TOKEN_EXPRIRES_IN: string
  }
}
