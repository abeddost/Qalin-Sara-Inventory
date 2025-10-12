-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for receipts
CREATE POLICY "Public can view receipts" ON storage.objects
    FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'receipts' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'public'
    );

CREATE POLICY "Authenticated users can update their receipts" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'receipts' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete their receipts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'receipts' 
        AND auth.role() = 'authenticated'
    );
