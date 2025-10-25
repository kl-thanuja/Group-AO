import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#2f2a25] text-[#f4e9d8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f4e9d8] flex items-center justify-center">
                <span className="text-[#2f2a25] text-lg font-bold">Q</span>
              </div>
              <span className="font-bold text-xl">Quoraid</span>
            </div>
            <p className="text-[#f4e9d8]/70 text-sm leading-relaxed">
              Empowering group learning with AI-driven discussions, notes, and quizzes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rooms" className="hover:text-[#f4e9d8] transition-colors">Rooms</Link></li>
              <li><Link href="/features" className="hover:text-[#f4e9d8] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#f4e9d8] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#f4e9d8] transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-[#f4e9d8] transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-[#f4e9d8] transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-[#f4e9d8] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#f4e9d8] transition-colors">Terms</Link></li>
              <li><Link href="/support" className="hover:text-[#f4e9d8] transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#f4e9d8]/20 pt-8 text-center text-sm text-[#f4e9d8]/70">
          <p>&copy; 2025 Quoraid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;