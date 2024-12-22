export const Footer = () => {
  return (
    <footer className="bg-white py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600">
          <p className="mb-4">© 2024 EcoTracker. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-eco-primary">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-eco-primary">
              Terms of Service
            </a>
            <a href="#" className="hover:text-eco-primary">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};