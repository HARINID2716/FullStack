import { useEffect, useRef, useState } from "react";

const HeroSection = () => {
  const sectionRef = useRef(null);
  const infoRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // WHY CHOOSE US animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // GARDENER INFO animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowInfo(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (infoRef.current) observer.observe(infoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section
        className="relative w-full min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://ik.imagekit.io/hhqmo4nv4/MERN/99c7e8f8-2997-46fc-8df3-cb0ac5c25d11.__CR0,0,1464,600_PT0_SX1464_V1___.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative max-w-screen-xl mx-auto px-4 pt-32 pb-16 min-h-screen grid lg:grid-cols-12">
          <div className="lg:col-span-7 flex flex-col justify-center text-white">
            <h1
              className="mb-4 text-[24px]"
              style={{ fontFamily: "Dancing Script" }}
            >
              Bring Your Garden to Life 🌱
            </h1>

            <p className="mb-6 font-bold text-[36px] md:text-[56px] leading-tight">
              Create a thriving garden with eco-friendly plants and sustainable solutions.
            </p>

            <div className="flex gap-4">
              <a
                href="/home/products"
                className="px-5 py-3 bg-green-800 rounded-lg hover:bg-green-900 transition"
              >
                Shop Now
              </a>

              <a
                href="#learn"
                className="px-5 py-3 border border-white rounded-lg hover:bg-white/10 transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section ref={sectionRef} className="bg-[#f8fbff] py-16">
        <div
          className={`w-[80%] mx-auto transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          <h2 className="text-[28px] font-bold mb-2">About plant</h2>

          <p className="text-gray-600 mb-8">
            We provide sustainable, eco-friendly gardening solutions designed
            to help your plants grow healthier🌱.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-700 delay-100
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <img
                src="https://ik.imagekit.io/hhqmo4nv4/MERN/images_q=tbn:ANd9GcTGzGgZqCudv4CWd_DcCEzMr1CMPipETF_wlqoVEhZoLOgzCJEW"
                className="mx-auto h-24 mb-4"
                alt="Expert Care"
              />
              <h3 className="text-lg font-semibold mb-2 cursor-pointer">Plant Care</h3>
              <p className="text-sm text-gray-600">
                Plants nurtured by horticulture experts for long-lasting growth.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-700 delay-200
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <img
                src="https://ik.imagekit.io/hhqmo4nv4/MERN/Team-of-Professionals.png"
                className="mx-auto h-24 mb-4"
                alt="Fresh Plants"
              />
              <h3 className="text-lg font-semibold mb-2 cursor-pointer">
                🌿 Fresh & Natural Plants
              </h3>
              <p className="text-sm text-gray-600">
                Fresh, pesticide-free plants from trusted nurseries.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-700 delay-300
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <img
                src="https://ik.imagekit.io/hhqmo4nv4/MERN/Screenshot%202026-01-04%20164201.png"
                className="mx-auto h-24 mb-4"
                alt="Offers"
              />
              <h3 className="text-lg font-semibold mb-2 cursor-pointer">Best Offers</h3>
              <p className="text-sm text-gray-600">
                Seasonal discounts on plants, pots & eco tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GARDENER INFO SECTION ================= */}
      <section ref={infoRef} className="bg-[#2f3417] py-12 text-white">
        <div
          className={`max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 px-6
          transition-all duration-700 ease-out
          ${showInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-14"}`}
        >
          {/* LEFT CONTENT */}
          <div>
            <h4 className="text-3xl text-yellow-400 font-semibold mb-3 tracking-wide">
              WELCOME TO GARDENER PRESS
            </h4>

            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              Welcome to Gardener Press, your trusted partner in landscaping,
              gardening, and outdoor design. We create beautiful, eco-friendly
              green spaces tailored to your lifestyle.
            </p>

            <h3 className="text-2xl font-semibold mb-6">
              24/7 Gardening & Landscaping Support
            </h3>

            <div className="grid grid-cols-2 gap-4 text-yellow-400 font-medium">
              <p>✔ Expert Landscape Design</p>
              <p>✔ Professional Plant Installation</p>
              <p>✔ Premium Quality Materials</p>
              <p>✔ Personalized Garden Care</p>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <img
              src="https://m.media-amazon.com/images/I/71k8Djd+LHL._AC_UY1100_.jpg"
              alt="Gardener"
              className="w-full h-[520px] rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
