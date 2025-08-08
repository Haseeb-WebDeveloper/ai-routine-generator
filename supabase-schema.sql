-- Create user_emails table
CREATE TABLE IF NOT EXISTS user_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  quiz_completed BOOLEAN DEFAULT false,
  unique_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL REFERENCES user_emails(email) ON DELETE CASCADE,
  skin_type VARCHAR(50) NOT NULL,
  concerns TEXT[] NOT NULL,
  age INTEGER NOT NULL,
  budget VARCHAR(50) NOT NULL,
  skin_sensitivity VARCHAR(50) NOT NULL,
  climate VARCHAR(50) NOT NULL,
  lifestyle VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email);
CREATE INDEX IF NOT EXISTS idx_user_emails_active ON user_emails(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_email ON quiz_responses(user_email);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_template_id ON campaigns(template_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers (with IF NOT EXISTS check)
DO $$
BEGIN
    -- Check and create triggers only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_emails_updated_at') THEN
        CREATE TRIGGER update_user_emails_updated_at BEFORE UPDATE ON user_emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quiz_responses_updated_at') THEN
        CREATE TRIGGER update_quiz_responses_updated_at BEFORE UPDATE ON quiz_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_templates_updated_at') THEN
        CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaigns_updated_at') THEN
        CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if they don't exist)
DO $$
BEGIN
    -- Policies for user_emails
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_emails' AND policyname = 'Allow all operations on user_emails') THEN
        CREATE POLICY "Allow all operations on user_emails" ON user_emails FOR ALL USING (true);
    END IF;
    
    -- Policies for quiz_responses
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_responses' AND policyname = 'Allow all operations on quiz_responses') THEN
        CREATE POLICY "Allow all operations on quiz_responses" ON quiz_responses FOR ALL USING (true);
    END IF;
    
    -- Policies for email_templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Allow all operations on email_templates') THEN
        CREATE POLICY "Allow all operations on email_templates" ON email_templates FOR ALL USING (true);
    END IF;
    
    -- Policies for campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Allow all operations on campaigns') THEN
        CREATE POLICY "Allow all operations on campaigns" ON campaigns FOR ALL USING (true);
    END IF;
END $$;

-- Sample data for testing
INSERT INTO user_emails (email, is_active) VALUES
  ('test1@example.com', true),
  ('test2@example.com', true),
  ('test3@example.com', true)
ON CONFLICT (email) DO NOTHING;

-- Sample email templates
INSERT INTO email_templates (name, subject, content) VALUES
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
ON CONFLICT DO NOTHING;
