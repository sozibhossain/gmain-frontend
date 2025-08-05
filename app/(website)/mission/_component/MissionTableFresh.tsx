import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function MissionTableFresh() {
  return (
    <div className="pt-16 md:pt-24">
      {/* Header */}
      <header className="text-center pb-6 md:pb-8 px-4">
        <h1 className="text-xl sm:text-2xl lg:text-[32px] font-semibold text-[#272727] mb-3 md:mb-4 leading-tight max-w-4xl mx-auto">
          Connecting People Through Food, Building Community Through Tradition
        </h1>
        <p className="text-base sm:text-lg text-[#595959] font-normal max-w-2xl mx-auto px-2 md:px-4">
          Taking control from corporations and putting it back in the hands of the people, where it belongs.
        </p>
      </header>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-16">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#272727] leading-tight">
              A Journey Through Time
            </h2>
            <div className="space-y-3 md:space-y-4">
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                For millennia, food has changed and transformed cultures and societies. Ships sailed around the world
                seeking routes to the Far East in search of spices.
              </p>
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                The Silk Road, the world&lsquo;s first global trade route, carried food, spices, gold and goods from the Far
                East to the Middle East and European continent.
              </p>
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                Today food is flown around the world in a matter of hours. Every grocery store has amazing selection
                with seasonality no longer applying. But, at what cost?
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full  h-[250px] sm:h-[350px] md:h-[430px] overflow-hidden">
              <Image
                src="/asset/mission1.jpg"
                alt="Two farmers working in a garden with vegetables"
                width={1000}
                height={1000}
                className="w-full h-full rounded-2xl md:rounded-[32px] object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section with Issues */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-16">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full h-[250px] sm:h-[350px] md:h-[430px] overflow-hidden">
              <Image
                src="/asset/mission2.jpg"
                alt="Person working in greenhouse"
                width={1000}
                height={1000}
                className="w-full h-full rounded-2xl md:rounded-[32px] object-cover"
              />
            </div>
          </div>

          {/* Right Content - Issues */}
          <div className="space-y-3">
            <Card className="border border-l-4 border-[#039B06]">
              <CardContent className="px-3">
                <h3 className="font-semibold text-base text-[#272727] mb-1">Genetic Modification</h3>
                <p className="text-[#595959] text-sm font-normal">
                  Altering the natural structure of our food for profit over health.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-l-4 border-[#039B06]">
              <CardContent className="px-3">
                <h3 className="font-semibold text-base text-[#272727] mb-1">Dangerous Cancer Causing Chemicals</h3>
                <p className="text-[#595959] text-sm font-normal">
                  Herbicides, Pesticides and Other Dangerous elements For Our Health
                </p>
              </CardContent>
            </Card>

            <Card className="border border-l-4 border-[#039B06]">
              <CardContent className="px-3">
                <h3 className="font-semibold text-base text-[#272727] mb-1">Nitrogen Packaging</h3>
                <p className="text-[#595959] text-sm font-normal">
                  Food packaged with nitrogen to prevent spoilage, extending shelf life at the cost of nutrition.
                </p>
              </CardContent>
            </Card>

            <p className="text-[#595959] text-sm font-normal mt-2 px-3">
              None of which is healthy for you. In fact, it&lsquo;s mostly detrimental to your health.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-16">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 lg:gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <h2 className="text-xl sm:text-2xl lg:text-[32px] font-semibold text-[#272727] mb-2 md:mb-4 leading-tight">
              Table Fresh Mission
            </h2>
            <div className="space-y-3 md:space-y-4">
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                Our mission is to connect people through food, fresh grown vegetables, building community with a healthy
                fresh alternative to grocery stores.
              </p>
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                We&lsquo;re not stopping there, we want to include everyone. From small farms to organic farms and food
                makers, such as flour, cheese and smoked meats. Preserves, like jellies and jams and canned goods from
                home processors. Home bakers and their artisan breads and baked goods. Cooks and caterers.
              </p>
              <p className="text-[#595959] text-sm sm:text-base font-normal leading-[150%]">
                Let Table Fresh serve as the platform to launch you own small food business, local and healthy. Taking
                control from the government and corporations and putting it back in the hands of the people, where it
                belongs!
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full h-[250px] sm:h-[350px] md:h-[430px] overflow-hidden">
              <Image
                src="/asset/mission1.jpg"
                alt="Farmers working together in garden"
                width={1000}
                height={1000}
                className="w-full h-full rounded-2xl md:rounded-[32px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="pb-8 md:pb-16"></div>
    </div>
  )
}
