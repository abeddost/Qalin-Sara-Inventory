-- Create storage bucket for carpet photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'carpet-photos',
    'carpet-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view carpet photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'carpet-photos');

CREATE POLICY "Authenticated users can upload carpet photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'carpet-photos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'public'
    );

CREATE POLICY "Authenticated users can update their carpet photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'carpet-photos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete their carpet photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'carpet-photos' 
        AND auth.role() = 'authenticated'
    );
