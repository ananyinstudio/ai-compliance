export const metadata = {
  title: "AI-Compliance-Paket (EU)",
  description: "Pflichtdokumente (DE + EN) für Unternehmen, die KI einsetzen."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
