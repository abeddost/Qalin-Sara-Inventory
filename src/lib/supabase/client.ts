import { createBrowserClient } from '@supabase/ssr'

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please set it in your Vercel project settings under Environment Variables.`
    )
  }
  return value
}

export function createClient() {
  const supabaseUrl = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
