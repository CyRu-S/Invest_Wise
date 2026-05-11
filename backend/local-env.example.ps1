$env:SPRING_PROFILES_ACTIVE = "render,supabase"
$env:JWT_SECRET = "replace-with-a-long-random-secret-at-least-32-characters"

# Supabase PostgreSQL
# Only needed when SPRING_PROFILES_ACTIVE includes "supabase".
$env:SUPABASE_DB_HOST = "aws-1-ap-south-1.pooler.supabase.com"
$env:SUPABASE_DB_PORT = "5432"
$env:SUPABASE_DB_NAME = "postgres"
$env:SUPABASE_DB_USER = "postgres.your-project-ref"
$env:SUPABASE_DB_PASSWORD = "your_supabase_database_password"
$env:SUPABASE_DB_SSLMODE = "require"
$env:DB_POOL_MAX_SIZE = "5"

# Mail
$env:MAIL_ENABLED = "true"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "your_email@gmail.com"
$env:MAIL_PASSWORD = "your_gmail_app_password"
$env:MAIL_FROM = "your_email@gmail.com"
$env:MAIL_SMTP_AUTH = "true"
$env:MAIL_SMTP_STARTTLS = "true"
$env:MAIL_SMTP_STARTTLS_REQUIRED = "true"
$env:MAIL_SMTP_CONNECTION_TIMEOUT = "10000"
$env:MAIL_SMTP_TIMEOUT = "10000"
$env:MAIL_SMTP_WRITE_TIMEOUT = "10000"
# Gmail works best when MAIL_FROM matches MAIL_USERNAME.

# Optional extras
# $env:GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com"
# $env:MAIL_TEST_CONNECTION = "true"
