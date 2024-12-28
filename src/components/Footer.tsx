export const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600">
          <p className="mb-4 text-sm">
            Join thousands of conscious consumers making a difference today.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-eco-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-eco-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-eco-primary transition-colors">
              Contact Us
            </a>
          </div>
          <p className="mt-6 text-xs">
            © 2024 Akiraka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};