export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t">
      © {new Date().getFullYear()}. All rights reserved.
    </footer>
  );
}
