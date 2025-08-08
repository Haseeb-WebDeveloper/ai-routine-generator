-- Add new tables for campaign functionality
-- This script can be run safely even if some tables already exist

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  selected_users TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_template_id ON campaigns(template_id);

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_templates_updated_at') THEN
        CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaigns_updated_at') THEN
        CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS for new tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Allow all operations on email_templates') THEN
        CREATE POLICY "Allow all operations on email_templates" ON email_templates FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Allow all operations on campaigns') THEN
        CREATE POLICY "Allow all operations on campaigns" ON campaigns FOR ALL USING (true);
    END IF;
END $$;

-- Insert sample email templates (only if table is empty)
INSERT INTO email_templates (name, subject, content) 
SELECT * FROM (VALUES
  ('Skincare Quiz Invitation', 'Your Personalized Skincare Routine Awaits!', 'Hi there,

We''re excited to create a custom skincare routine just for you! 

Our AI-powered system will analyze your skin type, concerns, and preferences to recommend the perfect products for your unique needs.

It takes less than a minute to complete the quiz, and the results will stay with you forever.

Click the button below to start your personalized skincare quiz:

{{LINK}}

This link is unique to you and will expire after use.

Best regards,
The AI Routine Team'),
  ('Follow-up Reminder', 'Don''t miss out on your personalized skincare routine!', 'Hi there,

We noticed you haven''t completed your skincare quiz yet. 

Your personalized routine is waiting for you! It only takes a minute to complete, and you''ll get:

• Custom product recommendations
• Personalized routine schedule
• Expert skincare tips
• Ongoing support

Click here to complete your quiz now:

{{LINK}}

This offer expires soon, so don''t wait!

Best regards,
The AI Routine Team'),
  ('Welcome Back', 'Welcome back! Let''s update your skincare routine', 'Hi there,

Welcome back! It''s been a while since you last visited us.

Your skin changes over time, and so should your skincare routine. Let''s update your personalized recommendations to match your current needs.

Take our quick quiz to refresh your routine:

{{LINK}}

It only takes a minute, and you''ll get updated recommendations based on your current skin condition.

Best regards,
The AI Routine Team')
) AS v(name, subject, content)
WHERE NOT EXISTS (SELECT 1 FROM email_templates LIMIT 1);
