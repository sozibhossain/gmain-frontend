import Image from "next/image";

export default function Aboutus() {
  return (
    <section className="pt-16 md:pt-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold text-[#272727] mb-4 leading-tight">
          Your Online Source for Fresh Food and Vegetables
        </h1>
        <p className="md:text-xl lg:text-2xl text-black font-normal max-w-2xl mx-auto px-4">
          Bringing local people together with fresh healthy food.
        </p>
      </section>

      {/* First Feature Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
          <div className="w-full lg:w-1/2">
            <div className="w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[636/400] overflow-hidden">
              <Image
                src="/asset/about1.jpg"
                alt="Farmer harvesting vegetables"
                width={636}
                height={400}
                className="w-full h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] object-cover"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#272727] leading-tight">
              Connecting 60+ Million Gardens Across America
            </h2>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              With over 60 million gardens in America, people are growing fresh
              vegetables for months of the year with no way to market them.
              Initially we wanted to offer an alternative way to sell or trade
              your excess produce, making extra income for the average gardener.
            </p>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              But it&lsquo;s more than that! Your family&lsquo;s health is
              important, and being able to buy the freshest and healthiest food
              is the goal of every person.
            </p>
          </div>
        </div>
      </section>

      {/* Second Feature Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-6 sm:gap-8 lg:gap-10">
          <div className="w-full lg:w-1/2">
            <div className="w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[636/400] overflow-hidden">
              <Image
                src="/asset/about2.jpg"
                alt="Farmers working in a field"
                width={636}
                height={400}
                className="w-full h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] object-cover"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#272727] leading-tight">
              A Time When Food Was Pure
            </h2>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              There was a time when nearly everyone had their own garden. Having
              food that was healthy, chemical free and non gmo was never a
              problem.
            </p>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              That has all changed, the government and corporations control
              nearly all of our food supply, our food is laced with herbicides
              and pesticides, preservatives, food dyes.
            </p>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              Consuming these products puts your and your families health at
              risk.
            </p>
          </div>
        </div>
      </section>

      {/* Third Feature Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
          <div className="w-full lg:w-1/2">
            <div className="w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[636/400] overflow-hidden">
              <Image
                src="/asset/about3.jpg"
                alt="Child with fresh vegetables"
                width={636}
                height={400}
                className="w-full h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] object-cover"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#272727] leading-tight">
              Our goal is to build community
            </h2>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              With over 60 million gardens and millions more producing some sort
              of food product, such as organic flours, baked good, locally made
              foods, jams, jellies, preserves, smoked meats, cheese, fruit,
              everything locally sourced.
            </p>
            <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
              We want to connect everyone so you have access to clean healthy
              locally grown and produced food.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
