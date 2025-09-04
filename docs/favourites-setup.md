# Favourites Functionality

This document describes the favourites system implemented in the Politica application.

## Overview

The application now includes a comprehensive favourites system that allows logged-in users to save and manage their favorite politicians. Users can add politicians to their favourites from various locations and view them in a dedicated favourites page.

## Features

### User Favourites
- **Add to Favourites**: Users can save politicians to their personal favourites list
- **Remove from Favourites**: Users can remove politicians from their favourites
- **Favourites Page**: Dedicated page to view all saved politicians
- **Real-time Updates**: Favourites state updates immediately across the application
- **Authentication Required**: Only logged-in users can use favourites functionality

### Visual Indicators
- **Heart Icon**: Filled heart for favourited politicians, outline for non-favourited
- **Hover Effects**: Favourite buttons appear on hover for politician cards
- **Toast Notifications**: Success/error messages for favourite operations
- **Loading States**: Visual feedback during favourite operations

## Database Schema

### User Favourites Table
```sql
CREATE TABLE user_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, politician_id)
);
```

### Security
- **Row Level Security (RLS)**: Enabled on user_favourites table
- **User Isolation**: Users can only access their own favourites
- **Cascade Deletion**: Favourites are automatically deleted when users or politicians are removed

## Components

### Core Components
- `FavouriteButton`: Reusable button component for adding/removing favourites
- `FavouritesPage`: Dedicated page for viewing saved politicians
- `FavouritesContext`: React context for managing favourites state
- `FavouritesService`: Service class for database operations

### Integration Points
- **Politician Cards**: Favourite button appears on hover
- **Politician Detail Pages**: Prominent favourite button in sidebar
- **Navigation**: "My Favourites" link in header (for logged-in users)

## Usage

### For Users
1. **Sign in** to your account
2. **Browse politicians** on the main politicians page
3. **Hover over politician cards** to see the heart button
4. **Click the heart** to add/remove from favourites
5. **Visit the favourites page** via the "My Favourites" link in navigation
6. **Manage your favourites** from the dedicated favourites page

### For Developers
```typescript
import { useFavourites } from '@/contexts/FavouritesContext';

function MyComponent() {
  const { favourites, addFavourite, removeFavourite, isFavourite } = useFavourites();
  
  const handleToggleFavourite = async (politicianId: string) => {
    if (isFavourite(politicianId)) {
      await removeFavourite(politicianId);
    } else {
      await addFavourite(politicianId);
    }
  };
  
  return (
    <div>
      {favourites.map(fav => (
        <div key={fav.id}>{fav.politician.full_name}</div>
      ))}
    </div>
  );
}
```

## API Reference

### FavouritesService Methods
- `addFavourite(userId, politicianId)`: Add a politician to user's favourites
- `removeFavourite(userId, politicianId)`: Remove a politician from user's favourites
- `getUserFavourites(userId)`: Get all favourites for a user with politician data
- `isFavourite(userId, politicianId)`: Check if a politician is favourited
- `getFavouriteCount(politicianId)`: Get total favourite count for a politician

### FavouritesContext Methods
- `addFavourite(politicianId)`: Add to favourites with error handling
- `removeFavourite(politicianId)`: Remove from favourites with error handling
- `isFavourite(politicianId)`: Check if politician is in favourites
- `refreshFavourites()`: Manually refresh favourites list
- `favourites`: Array of favourite items with politician data
- `loading`: Loading state for favourites operations

## User Experience

### Authentication Flow
1. **Unauthenticated Users**: See sign-in prompt when trying to use favourites
2. **Authentication Modal**: Opens automatically for unauthenticated users
3. **Post-Authentication**: Favourites functionality becomes available immediately

### Visual Feedback
- **Loading States**: Spinner during favourite operations
- **Success Messages**: Toast notifications for successful operations
- **Error Handling**: Clear error messages for failed operations
- **Real-time Updates**: UI updates immediately after operations

### Responsive Design
- **Mobile Friendly**: Favourites work seamlessly on all device sizes
- **Touch Optimized**: Large touch targets for mobile users
- **Progressive Enhancement**: Graceful degradation for users without JavaScript

## Performance Considerations

### Database Optimization
- **Indexes**: Optimized indexes on user_id and politician_id
- **Efficient Queries**: Single query to get favourites with politician data
- **Caching**: React context provides client-side caching

### User Experience
- **Optimistic Updates**: UI updates before server confirmation
- **Error Recovery**: Automatic retry and error handling
- **Lazy Loading**: Favourites loaded only when needed

## Future Enhancements

- **Favourite Categories**: Organize favourites into custom categories
- **Favourite Notes**: Add personal notes to favourite politicians
- **Favourite Sharing**: Share favourite lists with other users
- **Favourite Analytics**: Track most favourited politicians
- **Bulk Operations**: Add/remove multiple politicians at once
- **Favourite Export**: Export favourites to CSV or PDF
- **Favourite Notifications**: Get notified about updates to favourite politicians
