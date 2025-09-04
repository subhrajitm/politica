import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Use server-side Supabase client bound to user session (cookies)
    const supabase = createServerSupabaseClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const politicianName = formData.get('politicianName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = politicianName
      ? politicianName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'politician';
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${sanitizedName}-${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('politician-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: 'Storage bucket not configured. Please run the setup script first.',
          details: 'The politician-photos bucket does not exist. Run scripts/create-storage-policies.sql in your Supabase SQL editor.'
        }, { status: 500 });
      }
      
      if (error.message.includes('new row violates row-level security policy')) {
        return NextResponse.json({ 
          error: 'Upload permission denied. Please check storage policies.',
          details: 'The storage policies may not be configured correctly. Check the documentation for policy setup.'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to upload file', 
        details: error.message 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('politician-photos')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
