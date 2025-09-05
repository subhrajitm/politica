# Photo Upload Setup Guide

This guide explains how to set up photo upload functionality for politicians in the OurNation application.

## Overview

The photo upload feature allows administrators to upload politician photos directly through the admin interface. Photos are stored in Supabase Storage and can be accessed via public URLs.

## Features

- **Drag and Drop Upload**: Users can drag and drop image files directly onto the upload area
- **File Validation**: Automatic validation of file type (images only) and size (max 5MB)
- **URL Input**: Alternative option to enter photo URLs directly
- **Preview**: Real-time preview of uploaded photos
- **Error Handling**: Clear error messages for upload failures

## Supabase Storage Setup

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `politician-photos`
   - **Public**: ✅ **Yes** (enables public access to photos)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`

### 2. Configure Bucket and Policies

**Step 1: Create the Storage Bucket**

Run the SQL script to create the bucket:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/create-storage-policies.sql`
4. Click **Run** to execute the script

This will create the `politician-photos` bucket with proper settings.

**Step 2: Create Storage Policies (Dashboard Only)**

⚠️ **Important**: Storage policies cannot be created via SQL in Supabase. You must use the Dashboard.

1. Go to **Storage** → **Policies**
2. Select the `politician-photos` bucket
3. Create the following 4 policies:

#### Policy 1: Public Read Access
- **Name**: `Public read access for politician photos`
- **Operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'politician-photos'`

#### Policy 2: Authenticated Upload
- **Name**: `Authenticated users can upload politician photos`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `bucket_id = 'politician-photos'`

#### Policy 3: Authenticated Update
- **Name**: `Authenticated users can update politician photos`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'politician-photos'`

#### Policy 4: Authenticated Delete
- **Name**: `Authenticated users can delete politician photos`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'politician-photos'`

### 3. Verify Setup

After completing the setup, test your configuration:

1. **Test Storage Bucket**: Visit `http://localhost:3000/api/test-storage`
   - Should return success message if bucket exists
   - Will show specific error if bucket is missing

2. **Test Upload**: Try uploading a small image file
   - Should work if everything is configured correctly
   - Will show specific error messages if there are issues

## File Structure

```
src/
├── components/
│   └── PhotoUpload.tsx          # Main photo upload component
├── app/
│   ├── api/
│   │   └── upload-photo/
│   │       └── route.ts         # API endpoint for file uploads
│   └── admin/
│       └── politicians/
│           ├── new/
│           │   └── page.tsx     # New politician form (updated)
│           └── [id]/
│               └── edit/
│                   └── page.tsx # Edit politician form (updated)
```

## Usage

### In New Politician Form

The PhotoUpload component is integrated into the "Additional Information" section:

```tsx
<PhotoUpload
  value={photoUrl}
  onChange={setPhotoUrl}
  politicianName={fullName}
  disabled={submitting}
/>
```

### In Edit Politician Form

The component is used in the same way for editing existing politicians.

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | ✅ | Current photo URL |
| `onChange` | `(url: string) => void` | ✅ | Callback when photo URL changes |
| `politicianName` | `string` | ❌ | Politician name for filename generation |
| `disabled` | `boolean` | ❌ | Disable upload functionality |

## File Naming Convention

Uploaded files are automatically named using the following pattern:
```
{politician-name}-{timestamp}.{extension}
```

Example: `john-doe-1703123456789.jpg`

## Supported File Types

- **Images**: JPG, JPEG, PNG, GIF, WebP, SVG
- **Maximum Size**: 5MB
- **Validation**: Automatic client and server-side validation

## Error Handling

The component handles various error scenarios:

- **Invalid file type**: Shows error for non-image files
- **File too large**: Shows error for files > 5MB
- **Upload failure**: Shows error for network or server issues
- **Image load failure**: Shows error if uploaded image cannot be displayed

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **Size Limits**: 5MB maximum file size
3. **Authentication**: Upload requires authenticated user
4. **Public Access**: Photos are publicly accessible (consider if this meets your requirements)

## Troubleshooting

### Common Issues

1. **"Failed to upload file" / "Storage bucket not configured"**
   - **Root Cause**: The `politician-photos` bucket doesn't exist
   - **Solution**: Run the `scripts/create-storage-policies.sql` script in your Supabase SQL Editor
   - **Test**: Visit `/api/test-storage` to check bucket status

2. **"Upload permission denied" / "new row violates row-level security policy"**
   - **Root Cause**: Storage policies are not configured
   - **Solution**: Create the 4 required policies via Supabase Dashboard (see Step 2 above)
   - **Test**: Try uploading after creating policies

3. **"File must be an image"**
   - Ensure the uploaded file is a valid image format
   - Check file extension matches the actual file type

4. **"File size must be less than 5MB"**
   - Compress the image or use a smaller file
   - Consider increasing the size limit in bucket settings

5. **Photos not displaying**
   - Check if the bucket is set to public
   - Verify the public read policy is active
   - Check browser console for CORS errors
   - Ensure Supabase domain is in Next.js image config

### Debug Steps

1. Check browser network tab for failed requests
2. Verify Supabase Storage logs in the dashboard
3. Test with a small, simple image file first
4. Check that the bucket name matches exactly: `politician-photos`

## Future Enhancements

Potential improvements to consider:

- **Image Compression**: Automatic image compression before upload
- **Multiple Sizes**: Generate thumbnails and different sizes
- **CDN Integration**: Use a CDN for better performance
- **Batch Upload**: Upload multiple photos at once
- **Image Editing**: Basic crop/resize functionality
- **Alt Text**: Add alt text for accessibility
