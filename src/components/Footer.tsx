export const Footer = () => {
  return (
    <footer className="bg-white py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">© 2024 EcoTracker. All rights reserved.</p>
          <div className="flex justify-center gap-3 text-xs">
            <a href="#" className="hover:text-eco-primary">Privacy</a>
            <a href="#" className="hover:text-eco-primary">Terms</a>
            <a href="#" className="hover:text-eco-primary">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};