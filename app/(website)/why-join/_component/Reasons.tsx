
import Image from "next/image"

export default function Reasons() {
  const features = [
    {
      icon: "/asset/why_join1.png",
      title: "It's Free",
      description:
        "Sourcing fresh, locally grown produce and food that is healthy and nutritious is foundational to a healthy family.",
    },
    {
      icon: "/asset/why_join2.png",
      title: "Better Nutrition",
      description:
        "Current farming methods have depleted the soil of important vitamins and trace minerals, negatively affecting your health. Small family farms and gardens don't have this problem.",
    },
    {
      icon: "/asset/why_join3.png",
      title: "Healthier Choices",
      description:
        "Many obesity and health problems can be attributed to industrial agriculture's use of synthetic fertilizers, pesticides, herbicides and cancer causing glyphosate.",
    },
    {
      icon: "/asset/why_join4.png",
      title: "Grow Your Business",
      description:
        "Tablefresh is more than just a platform to find fresh foods. With tablefresh, you can create, expand and grow your business.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 md:mt-[100px]">
      <div className=" ">
        <h2 className="text-xl sm:text-[24px] lg:text-[24px] font-bold text-[#272727] ">
          Reasons to join tablefresh.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mt-10">
        {features.map((feature, index) => {
          // const IconComponent = feature.icon
          return (
            <div key={index} className="flex flex-col shadow-lg p-6 rounded-lg ">
              <div className="w-16 h-16 sm:w-20 sm:h-20  ">
                <Image src={feature.icon} alt="Logo" width={100} height={100} />
              </div>

              <h3 className="text-[18px] sm:text-xl font-semibold text-[#272727] mt-[34px]">{feature.title}</h3>

              <p className="text-base sm:text-base text-[#595959] leading-[150%] mt-6">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
