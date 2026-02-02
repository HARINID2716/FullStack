const Footer = () => {
  return (
    <footer className="bg-[#212121] text-gray-300 text-sm mt-20">
      
      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 border-b border-gray-600">
        
        {/* ABOUT */}
        <div>
          <h4 className="text-gray-400 mb-4 uppercase text-xs">About</h4>
          <ul className="space-y-2">
            <li className="hover:underline cursor-pointer">Contact Us</li>
            <li className="hover:underline cursor-pointer">About Us</li>
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">
              Landscop Landscaping &amp; Garden
            </li>
            <li className="hover:underline cursor-pointer">Press</li>
            <li className="hover:underline cursor-pointer">Corporate Information</li>
          </ul>
        </div>

        {/* HELP */}
        <div>
          <h4 className="text-gray-400 mb-4 uppercase text-xs">Help</h4>
          <ul className="space-y-2">
            <li className="hover:underline cursor-pointer">Payments</li>
            <li className="hover:underline cursor-pointer">Shipping</li>
            <li className="hover:underline cursor-pointer">Cancellation & Returns</li>
            <li className="hover:underline cursor-pointer">FAQ</li>
          </ul>
        </div>

        {/* CONSUMER POLICY */}
        <div>
          <h4 className="text-gray-400 mb-4 uppercase text-xs">Consumer Policy</h4>
          <ul className="space-y-2">
            <li className="hover:underline cursor-pointer">Cancellation & Returns</li>
            <li className="hover:underline cursor-pointer">Terms Of Use</li>
            <li className="hover:underline cursor-pointer">Security</li>
            <li className="hover:underline cursor-pointer">Privacy</li>
            <li className="hover:underline cursor-pointer">Sitemap</li>
            <li className="hover:underline cursor-pointer">Grievance Redressal</li>
          </ul>
        </div>

        {/* MAIL US */}
        <div className="lg:col-span-1 border-l border-gray-600 pl-6">
          <h4 className="text-gray-400 mb-4 uppercase text-xs">Mail Us</h4>
          <p className="leading-6">
            Landscop Landscaping & Garden Pvt Ltd<br />
            Green Tech Park,<br />
            Outer Ring Road,<br />
            Bengaluru – 560103<br />
            Karnataka, India
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-4 mt-4">
            <span className="cursor-pointer hover:text-white">ⓕ</span>
            <span className="cursor-pointer hover:text-white">✕</span>
            <span className="cursor-pointer hover:text-white">▶</span>
            <span className="cursor-pointer hover:text-white">◎</span>
          </div>
        </div>

        {/* REGISTERED OFFICE */}
        <div className="lg:col-span-1">
          <h4 className="text-gray-400 mb-4 uppercase text-xs">
            Registered Office Address
          </h4>
          <p className="leading-6">
            Landscop Landscaping & Garden Pvt Ltd<br />
            Green Tech Park,<br />
            Outer Ring Road,<br />
            Bengaluru – 560103<br />
            Karnataka, India<br />
            CIN: U12345KA2025PTC000001<br />
            Telephone: <span className="text-blue-400">044-45614700</span>
          </p>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-300">
        
        <div className="flex flex-wrap gap-6">
          <span className="hover:underline cursor-pointer">Become a Seller</span>
          <span className="hover:underline cursor-pointer">Advertise</span>
          <span className="hover:underline cursor-pointer">Gift Cards</span>
          <span className="hover:underline cursor-pointer">Help Center</span>
        </div>

        <p className="text-xs">
          © 2026 Landscop Landscaping & Garden. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
