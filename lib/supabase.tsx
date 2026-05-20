import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://jlnaxdagxdvtprfnrliz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbmF4ZGFneGR2dHByZm5ybGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjY2NjgsImV4cCI6MjA5NDc0MjY2OH0.Y05yLoWxLa6a-NoYe7wOQtjptPL1SERPVB3UkuqoLXU"
)