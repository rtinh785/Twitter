import { ParamsDictionary } from 'express-serve-static-core'

export interface ConversationReqParam extends ParamsDictionary {
  receiver_id: string
}
