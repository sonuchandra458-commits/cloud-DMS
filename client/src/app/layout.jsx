import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cloud DMS',
  description: 'Secure cloud document management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000, style: { fontSize: '14px', borderRadius: '10px' } }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}