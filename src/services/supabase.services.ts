import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { envConfig } from '~/constants/config'

config()

const supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseServiceKey)

export default supabase
