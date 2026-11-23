import './globals.css';

export const metadata = {
  title: 'droppad',
  description: 'Drop text and files. Grab them anywhere.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
