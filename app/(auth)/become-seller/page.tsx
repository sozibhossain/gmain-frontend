import Image from "next/image";
import { Navbar } from "@/components/sheard/Navbar";
import { Footer } from "@/components/sheard/Footer";

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto py-12 px-4 ">
        {/* <div className="absolute top-10 right-4">
          <Link href="/">
            <ArrowLeft />
          </Link>
        </div> */}
        <h1 className="text-3xl font-bold mb-8">Who should sign up to sell</h1>

        {/* Gardeners & Bakers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Gardeners */}
          <div className="">
            <div className="">
              <Image
                src="/asset/seller/seller-1.png"
                alt="Gardeners working in a garden"
                width={1000}
                height={1000}
                className="rounded-lg w-full h-[350px] object-cover"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-700">
                All gardeners, backyard gardeners, organic gardeners, anyone
                with a garden. Sign up is simple and free. Fill out the
                registration, add your pictures and you&apos;ll appear on the
                map for everyone to find you. Your exact address will never be
                made public.
              </p>
            </div>
          </div>

          {/* Bakers */}
          <div className="flex flex-col">
            <div className="order-2 md:order-1 mb-4 pt-2 md:pt-0">
              <p className="text-gray-700">
                Bakers, whether you&apos;re a small bakery or baking artisan
                baked goods from your kitchen, you&apos;re encouraged to sign up
                and increase your sales. Sell your fresh bread, pastries, and
                other baked goods to local customers.
              </p>
            </div>
            <div className="order-1 md:order-2">
              Who should sign up to sell
              <Image
                src="/asset/seller/seller-2.png"
                alt="Freshly baked bread and pastries"
                width={1000}
                height={1000}
                className="rounded-lg w-full h-[350px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Preserves & Orchards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Preserves */}
          <div className="flex flex-col">
            <div>
              <Image
                src="/asset/seller/seller-3.png"
                alt="Jars of preserves and jams"
                width={1000}
                height={1000}
                className="rounded-lg w-full h-[350px] object-cover"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-700">
                Jam, jellies, preserves, canned goods with a profile on Table
                Fresh - your neighbors and locals can find you. You can sell
                your products locally or ship nationwide, and it&apos;s free to
                join.
              </p>
            </div>
          </div>

          {/* Orchards */}
          <div className="flex flex-col">
            <div className="order-2 md:order-1 mb-4 pt-2 md:pt-0">
              <p className="text-gray-700">
                Orchards growing apples, oranges, lemons, limes, pears, or any
                other fruit can connect with customers. Sell your fresh produce
                locally or ship nationwide to reach more customers.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/asset/seller/seller-4.png"
                alt="Fruit orchard with lemons"
                width={1000}
                height={1000}
                className="rounded-lg w-full h-[350px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Restaurants */}
        <div className="grid grid-cols-1 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <Image
                src="/asset/seller/seller-5.png"
                alt="Restaurant chef preparing food"
                width={1000}
                height={1000}
                className="rounded-lg w-full h-[350px] object-cover"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="text-gray-700">
                Restaurants and caterers serving locally sourced products can
                showcase their offerings. Connect with customers who value
                fresh, local ingredients and build your customer base.
              </p>
            </div>
          </div>
        </div>

        {/* Other categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col">
            <Image
              src="/asset/seller/seller-6.png"
              alt="Smoked meats and fish"
              width={1000}
              height={1000}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />
            <p className="text-gray-700 text-center">
              Smoked meats and fish from local producers
            </p>
          </div>

          <div className="flex flex-col">
            <Image
              src="/asset/seller/seller-7.png"
              alt="Fresh seafood"
              width={1000}
              height={1000}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />
            <p className="text-gray-700 text-center">
              Fresh seafood, oysters, clams, shrimp, and fish
            </p>
          </div>

          <div className="flex flex-col">
            <Image
              src="/asset/seller/seller-8.png"
              alt="Dairy products"
              width={1000}
              height={1000}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />
            <p className="text-gray-700 text-center">
              Dairy products including cheese, yogurt, kefir, and homemade
              butter
            </p>
          </div>

          <div className="flex flex-col">
            <Image
              src="/asset/seller/seller-9.png"
              alt="Fresh meats"
              width={1000}
              height={1000}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />
            <p className="text-gray-700 text-center">
              Fresh meats with next-day shipping available
            </p>
          </div>
        </div>

        {/* <div className="mt-12 flex justify-center">
          <Link href="/seller">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg cursor-pointer">
              Continue
            </Button>
          </Link>
        </div> */}
      </div>
      <Footer />
    </div>
  );
}
