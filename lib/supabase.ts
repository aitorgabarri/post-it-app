import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://unkeswejgfzxdfowurqb.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua2Vzd2VqZ2Z6eGRmb3d1cnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTkzODIsImV4cCI6MjA4NzY3NTM4Mn0.Xa4bHQF9VufwLUeFxCX9g7ao2A5ScST-XtU3vtL0olI'
);
