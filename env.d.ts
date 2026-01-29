declare namespace NodeJS {
  interface ProcessEnv {
    DB_NAME: string
    DB_USERNAME: string
    DB_PASSWORD: string
    DB_USERS_COLLECTION: string
    DB_REFRESH_TOKENS_COLLECTION: string
    HASH_PASSWORD_SECRET: string

    JWT_SECRET_ACCESS_TOKEN: string
    JWT_SECRET_REFRESH_TOKEN: string
    JWT_SECRET_EMAIL_TOKEN: string
    JWT_SECRET_FORGOT_PASSWORD_TOKEN: string
    
    ACCESS_TOKEN_EXPRIRES_IN: string
    RERESH_TOKEN_EXPRIRES_IN: string
    EMAIL_VERIFY_TOKEN_EXPIRES_IN: string
    FORGOT_PASSWORD_TOKEN_EXPIRES_IN: string
  }
}
