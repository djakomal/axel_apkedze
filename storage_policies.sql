-- Politiques pour le bucket de stockage des images de posters 

-- Lecture publique des images pour tout le monde
CREATE POLICY "public_read_access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'poster-images');

-- Création, mise à jour et suppression pour les admins uniquement  
CREATE POLICY "admin_write_access" ON storage.objects
FOR INSERT
TO authenticated  
WITH CHECK (
    bucket_id = 'poster-images'
    AND public.is_admin_from_auth()
);

CREATE POLICY "admin_update_access" ON storage.objects
FOR UPDATE
TO authenticated  
USING (
    bucket_id = 'poster-images'
    AND public.is_admin_from_auth()
) 
WITH CHECK (
    bucket_id = 'poster-images'
    AND public.is_admin_from_auth()
);

CREATE POLICY "admin_delete_access" ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'poster-images'  
    AND public.is_admin_from_auth()
);