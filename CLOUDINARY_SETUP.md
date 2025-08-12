# Cloudinary Setup for Skin Type Detection

This guide explains how to set up Cloudinary for image storage in the skin type detection feature.

## Prerequisites

1. A Cloudinary account (free tier available)
2. Access to your Cloudinary dashboard

## Setup Steps

### 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address
3. Log in to your dashboard

### 2. Get Your Credentials

From your Cloudinary dashboard, you'll need:

- **Cloud Name**: Found in the dashboard header
- **API Key**: Available in the "API Keys" section
- **API Secret**: Available in the "API Keys" section

### 3. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Other existing variables
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Cloudinary Settings

In your Cloudinary dashboard:

1. **Upload Presets**: Create a preset for "skin-analysis" folder
2. **Security**: Set upload restrictions if needed
3. **Transformations**: Configure default image transformations

### 5. Testing

1. Start your development server
2. Try uploading an image through the quiz interface
3. Check your Cloudinary dashboard to see uploaded images
4. Verify the image URL is returned correctly

## Features

- **Secure Uploads**: Images are uploaded directly to Cloudinary
- **Optimization**: Automatic quality and format optimization
- **Organization**: Images are stored in a "skin-analysis" folder
- **CDN**: Fast global delivery through Cloudinary's CDN

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check your API credentials
2. **Image Not Displaying**: Verify the returned URL format
3. **Size Limits**: Ensure images are under 5MB

### Debug Mode

Check the console for detailed error messages and upload status.

## Security Notes

- API secret should never be exposed to the client
- Consider implementing upload restrictions in Cloudinary
- Monitor upload usage to stay within free tier limits
