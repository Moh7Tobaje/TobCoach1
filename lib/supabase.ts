import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqyntmtuaylixkexpnbr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeW50bXR1YXlsaXhrZXhwbmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5ODk3NCwiZXhwIjoyMDcwNTc0OTc0fQ.VN4kwBki0pKI_yp5xISmW5UrxUgletZHVrdflpFUFqQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
