-- Confirmation manuelle de l'utilisateur admin
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email = 'tchabikossi0@gmail.com';