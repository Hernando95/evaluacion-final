import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Automatically redirect to the main app on launch
  // This avoids an extra screen and provides a better UX
  return <Redirect href="/home" />;
}