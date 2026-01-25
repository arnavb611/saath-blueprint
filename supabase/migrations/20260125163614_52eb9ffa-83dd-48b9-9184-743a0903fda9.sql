-- Add admin role to user arnavb611@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('d436e1c5-fe64-49d2-a640-c938c4f7cc24', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;