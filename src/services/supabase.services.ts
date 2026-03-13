import { createClient } from '@supabase/supabase-js'
import { envConfig } from '~/constants/config'

const supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseServiceKey)

export default supabase
