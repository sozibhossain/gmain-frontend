interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  image?: string;
  gradientColor?: string; // Optional: RGB values for gradient (e.g., "0, 115, 2")
  gradientOpacity?: number; // Optional: Gradient opacity (0 to 1)
}

export default function PageHeader({
  title,
  image,
  gradientColor = "0, 115, 2",
  gradientOpacity = 0.2,
}: PageHeaderProps) {
  const backgroundImage = image
    ? `linear-gradient(rgba(${gradientColor}, ${gradientOpacity}), rgba(${gradientColor}, ${gradientOpacity})), url('${image}')`
    : `linear-gradient(rgba(${gradientColor}, ${gradientOpacity}), rgba(${gradientColor}, ${gradientOpacity}))`;

  return (
    <section className="relative h-[300px] md:h-[460px] lg:h-[660px] overflow-hidden">
      {/* Background Image with Linear Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content - Updated to properly center */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 container mx-auto">
        <h1 className="text-lg md:text-4xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          {title || "Page Title"}
        </h1>
      </div>
    </section>
  );
}
