import { Link } from "react-router-dom";

const footerLinks = {
  services: [
    { name: "Home Services", href: "#" },
    { name: "Personal Care", href: "#" },
    { name: "Professional Help", href: "#" },
    { name: "Events", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Safety", href: "#" },
    { name: "Community", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center">
                <span className="text-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">Saath</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Your trusted companion for all service needs. Quality professionals, just a tap away.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2024 Saath. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
