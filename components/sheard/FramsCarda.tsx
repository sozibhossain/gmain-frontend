"use client";

import type React from "react";
import { MapPin, MessageCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FarmsCardProps {
  id: string;
  name: string;
  location:
    | string
    | { street?: string; city?: string; state?: string; zipCode?: string };
  image: string;
  profileImage: string;
  description: string;
  rating: number;
  street?: string;
  state?: string;
}

const FarmsCard: React.FC<FarmsCardProps> = ({
  id,
  name,
  location,
  image,
  profileImage,
  description,
  rating,
  state,
}) => {
  const { data: session } = useSession();
  console.log(profileImage, "profileImage");

  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const token = session?.accessToken;
  const router = useRouter();

  const handleStartChat = async () => {
    if (!token) {
      toast.error("Please login to start a chat");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/create-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            farmId: id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Redirect to the chat page with the chat ID
        router.push(`/messages/`);
        toast.success("Chat is opening...");
      } else {
        throw new Error(data.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast("Failed to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format location based on whether it's a string or an object
  const formattedLocation =
    typeof location === "string"
      ? location
      : `${location.city || ""}, ${location.state || ""}`
          .trim()
          .replace(/^,\s*/, "");

  // Get first letter of name for avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Check if we should show the avatar instead of profile image
  const shouldShowAvatar =
    !profileImage || profileImage.trim() === "" || imageError;

  return (
    <div className="w-full relative">
      {/* Chat Button (outside the Link) */}
      <Button
        onClick={handleStartChat}
        disabled={loading}
        className="bg-white w-[50px] h-[50px] rounded-full absolute top-4 right-4 flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-50 transition-colors z-10"
      >
        <MessageCircle className="!w-8 !h-8 text-[#595959]" />
      </Button>

      {/* Link wrapper */}
      <Link href={`/farms/${id}`}>
        <div className="w-full">
          {/* Main Farm Image */}
          <div className="w-full">
            <Image
              src={image || "/placeholder.svg?height=260&width=320"}
              width={600}
              height={600}
              alt={name}
              className="w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] object-cover rounded-[24px] sm:rounded-[28px] md:rounded-[32px]"
            />
          </div>

          {/* Content Section */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-3 relative mt-4 sm:mt-5 md:mt-6">
            <div className="space-y-1 sm:space-y-1.5 md:space-y-2 lg:space-y-1">
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-2">
                <div className="rounded-full overflow-hidden w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px] lg:w-[50px] lg:h-[50px] flex-shrink-0">
                  {shouldShowAvatar ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#039B06] to-[#027A04] flex items-center justify-center">
                      <span className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-xl">
                        {getInitial(name)}
                      </span>
                    </div>
                  ) : (
                    <Image
                      width={50}
                      height={50}
                      src={profileImage || "/placeholder.svg"}
                      alt={`${name} profile`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-[18px] font-semibold text-[#272727] truncate">
                    {name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <MapPin className="!w-[15px] !h-[20px] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-3 lg:h-3 flex-shrink-0 text-[#595959]" />
                    <p className="text-sm sm:text-base md:text-lg lg:text-base text-[#595959] font-normal truncate">
                      {formattedLocation}, {state}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base md:text-lg lg:text-base text-[#4B5563] mt-2 sm:mt-2.5 md:mt-3 leading-[120%] line-clamp-2 sm:line-clamp-3">
                {description}
              </p>

              <div className="flex items-center gap-1 mt-2 sm:mt-2.5 md:mt-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-5 lg:h-5 fill-[#FACC15] text-[#FACC15]" />
                <span className="text-sm sm:text-base md:text-lg lg:text-base font-medium text-[#000000]">
                  {rating ? rating.toFixed(1) : "0.0"}
                </span>
              </div>

              <div className="mt-2 sm:mt-2.5 md:mt-3">
                <div className="text-sm sm:text-base md:text-lg lg:text-base text-[#039B06] font-medium flex items-center hover:text-[#027A04] transition-colors">
                  View Farms →
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FarmsCard;
