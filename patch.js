const fs = require('fs');
let content = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');

// Find the start of subscriptions and end of it.
const startIdx = content.indexOf('      subscriptions: {');
const endIdx = content.indexOf('      adapter_recipes: {');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + content.slice(endIdx);
}

const subscriptionBlock = `      subscriptions: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          subscription_id: string | null
          status: string
          tier: string
          billing_cycle: string
          price_id: string | null
          currency: string
          amount: number | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          paddle_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id?: string | null
          subscription_id?: string | null
          status?: string
          tier?: string
          billing_cycle?: string
          price_id?: string | null
          currency?: string
          amount?: number | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          paddle_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          subscription_id?: string | null
          status?: string
          tier?: string
          billing_cycle?: string
          price_id?: string | null
          currency?: string
          amount?: number | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          paddle_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
`;

content = content.replace('    Tables: {\n', '    Tables: {\n' + subscriptionBlock);
fs.writeFileSync('src/integrations/supabase/types.ts', content);
