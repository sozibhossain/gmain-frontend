export default function HeroSection() {
  return (
    <section className="relative h-[300px] lg:h-[560px] 2xl:h-[659px]  overflow-hidden">
      {/* Background Image with Linear Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0, 115, 2, 0.2),
              rgba(0, 115, 2, 0.2)
            ),
            url('/asset/home.png')
          `,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 mt-10 md:pt-[52px] container mx-auto">
        <h1 className="text-lg lg:text-2xl md:text-4xl lg:text-[60px] font-bold text-white mb-4 sm:mb-6 leading-tight">
          Find Fresh Fruits and Vegetable Locally
        </h1>
        <p className="text-sm sm:text-xl md:text-3xl text-white font-normal max-w-2xl mx-auto leading-relaxed">
          Discover fresh, local produce from farms around the world
        </p>
      </div>
    </section>
  );
}
