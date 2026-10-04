import "./globals.css";
// Performance: the Geist Google fonts were downloaded on every page but their CSS
// variables were never applied to <body>, so they had no visual effect. Removed.
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'EvalzNow',
  icons: {
    icon: [
      { url: '/images/loading-icon.png' }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster  position="top-right" reverseOrder={false} /> 
      </body>
    </html>
  );
}
