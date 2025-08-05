"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  Heart,
  Menu,
  MessageCircle,
  ShoppingCart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ShoppingBag, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import CheckoutFormWrapper from "@/app/(website)/checkout/_component/CheckoutPage";

interface UserProfile {
  success: boolean;
  message: string;
  data: {
    avatar: {
      public_id: string;
      url: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    _id: string;
    name: string;
    email: string;
    username: string;
    phone: string;
    credit: number | null;
    role: string;
    fine: number;
    uniqueId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    farm?: string;
  };
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    thumbnail: {
      url: string;
    };
    farm?: string;
  };
  quantity: number;
  price: number;
  farm?: {
    _id: string;
    name: string;
  };
}

interface CartData {
  _id: string;
  items: CartItem[];
  total: number;
}

interface CartResponse {
  success: boolean;
  message: string;
  data: CartData;
}

const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
};

const fetchCart = async (token: string): Promise<CartResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  // if (!response.ok) {
  //   throw new Error("Failed to fetch cart");
  // }
  return response.json();
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isAmitModalOpen, setIsAmitModalOpen] = useState(false);
  const [amount, setAmount] = useState<string | number>("");
  const { data: session, status } = useSession();
  const token = session?.accessToken || "";
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = status === "authenticated";
  const userRole = session?.user?.role || null;

  // Fetch user profile
  const { data: profile, error: profileError } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile", token],
    queryFn: () => fetchUserProfile(token),
    enabled: isLoggedIn && !!token,
  });

  // Fetch cart data
  const {
    data: cart,
    isLoading: isCartLoading,
    error: cartError,
  } = useQuery<CartResponse, Error>({
    queryKey: ["cart", token],
    queryFn: () => fetchCart(token),
    enabled: isLoggedIn && !!token && userRole === "user",
  });

  if (profileError) {
    toast.error("Failed to fetch profile: " + profileError.message);
  }

  // if (cartError) {
  //   toast.error("Failed to fetch cart: " + cartError.message);
  // }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Mission", href: "/mission" },
    { name: "Why Join?", href: "/why-join" },
    { name: "Who should Join?", href: "/become-seller" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ].filter(
    (link) =>
      link.href !== "/become-seller" ||
      !isLoggedIn ||
      (isLoggedIn && userRole !== "seller")
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) || false;
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to log out: " + (error as Error).message);
    }
  };

  const getProfileLink = () => {
    switch (userRole) {
      case "admin":
      case "seller":
        return "/dashboard";
      default:
        return "/buyer-profile";
    }
  };

  const getOrderHistoryLink = () => {
    return userRole === "user" ? "/buyer-order-history" : "/dashboard";
  };

  const handleDonateClick = () => {
    setIsDonationModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDonation = () => {
    const donationAmount = Number.parseFloat(amount as string);
    if (!amount || isNaN(donationAmount) || donationAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    setAmount(donationAmount);
    setIsDonationModalOpen(false);
    setIsAmitModalOpen(true);
  };
  const userId1 = profile ? profile.data._id : "";

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-[90px] items-center justify-between px-2 lg:px-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/asset/logo.png"
              width={40}
              height={53}
              alt="Table Fresh Logo"
              className="h-[53px] w-[40px]"
              priority
            />
            <div className="flex flex-col">
              <div>
                <p className="text-[16px] font-semibold text-black">TABLE</p>
                <p className="text-[16px] font-normal text-[#039B06]">FRESH</p>
              </div>
              <span className="text-[6px] font-medium leading-[120%] space-x-[5%] text-[#8F8F8F]">
                Fresh & Healthy
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex" aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-base font-medium transition-colors relative ${
                      isActive(link.href)
                        ? "text-[#039B06] font-semibold"
                        : "text-[#272727] hover:text-[#039B06] hover:font-semibold"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6">
              {isLoggedIn && userRole === "user" && (
                <>
                  <Link href="/messages" className="flex" aria-label="Messages">
                    <MessageCircle className="h-6 w-6 hover:text-[#039B06]" />
                  </Link>
                  <Link
                    href="/cart"
                    className="relative flex items-center"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="h-6 w-6 hover:text-[#039B06]" />
                    {isCartLoading ? (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#039B06] text-xs text-white">
                        ...
                      </span>
                    ) : cartError || !cart?.data?.items ? (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#039B06] text-xs text-white">
                        0
                      </span>
                    ) : (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#039B06] text-xs text-white">
                        {cart.data.items.length}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer">
                      <CircleUser className="h-8 w-8 text-[#039B06]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        href={getProfileLink()}
                        className="w-full cursor-pointer hover:text-[#039B06]"
                      >
                        <User className="mr-2 h-4 w-4 text-[#039B06]" />
                        {userRole === "admin" || userRole === "seller"
                          ? "Dashboard"
                          : "Profile"}
                      </Link>
                    </DropdownMenuItem>
                    {userRole === "user" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={getOrderHistoryLink()}
                          className="w-full cursor-pointer hover:text-[#039B06]"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4 text-[#039B06]" />
                          Order history
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-red-50 focus:text-red-500 hover:text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4 text-red-600" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/sign-up">
                  <Button
                    variant="default"
                    className="bg-[#014A14] hover:bg-[#039B06] text-white cursor-pointer"
                  >
                    Sign Up / Sign In
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-[40px] text-white bg-[#039B06] hover:bg-[#028a05] hover:text-white cursor-pointer whitespace-nowrap"
                onClick={handleDonateClick}
              >
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-[35px] w-auto px-2 text-white bg-[#039B06] hover:bg-[#028a05] hover:text-white cursor-pointer whitespace-nowrap"
                onClick={handleDonateClick}
                aria-label="Donate"
              >
                Donate
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-[30px] h-[30px]" />
                ) : (
                  <Menu className="!w-[30px] !h-[30px]" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <nav
          className={cn(
            "absolute left-0 right-0 top-0 z-50 bg-background shadow-lg transition-all duration-300 lg:hidden",
            isMenuOpen
              ? "flex translate-y-0 opacity-100"
              : "hidden -translate-y-2 opacity-0"
          )}
          aria-label="Mobile navigation"
        >
          <div className="w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Image
                  src="/asset/logo.png"
                  width={40}
                  height={53}
                  alt="Table Fresh Logo"
                  className="h-[53px] w-[40px]"
                  priority
                />
                <div className="flex flex-col">
                  <div>
                    <p className="text-[16px] font-semibold text-black">
                      TABLE
                    </p>
                    <p className="text-[16px] font-normal text-[#039B06]">
                      FRESH
                    </p>
                  </div>
                  <span className="text-[6px] font-medium leading-[120%] space-x-[5%] text-[#8F8F8F]">
                    Fresh & Healthy
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="!w-[30px] !h-[30px]" />
              </Button>
            </div>
            <div className="p-6">
              <ul className="flex flex-col gap-4 mb-6">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className={`block text-lg font-medium transition-colors py-2 ${
                        isActive(link.href)
                          ? "text-[#039B06] font-semibold"
                          : "text-[#272727] hover:text-[#039B06] hover:font-semibold"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    {userRole === "user" && (
                      <div className="flex gap-4 mb-4">
                        <Link
                          href="/messages"
                          className="flex items-center gap-2 text-[#272727] hover:text-[#039B06]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <MessageCircle className="h-5 w-5" />
                          Messages
                        </Link>
                        <Link
                          href="/cart"
                          className="flex items-center gap-2 text-[#272727] hover:text-[#039B06]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Cart
                          {isCartLoading ? (
                            <span className="ml-1 text-xs">...</span>
                          ) : cartError || !cart?.data?.items ? (
                            <span className="ml-1 text-xs">0</span>
                          ) : (
                            <span className="ml-1 text-xs">
                              {cart.data.items.length}
                            </span>
                          )}
                        </Link>
                      </div>
                    )}
                    <Link
                      href={getProfileLink()}
                      className="flex items-center gap-2 text-[#272727] hover:text-[#039B06] py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      {userRole === "admin" || userRole === "seller"
                        ? "Dashboard"
                        : "Profile"}
                    </Link>
                    {userRole === "user" && (
                      <Link
                        href={getOrderHistoryLink()}
                        className="flex items-center gap-2 text-[#272727] hover:text-[#039B06] py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        Order History
                      </Link>
                    )}
                    <button
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 py-2"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="default"
                      className="w-full bg-[#014A14] hover:bg-[#039B06] text-white mb-4"
                    >
                      Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
        <DialogContent className="w-[90%] max-w-md rounded-xl p-6 sm:p-8">
          <DialogHeader className="relative flex flex-col items-center text-center">
            <Image
              src="/asset/logo.png"
              width={40}
              height={53}
              alt="Table Fresh Logo"
              className="mb-4 h-[53px] w-[40px]"
              priority
            />
            <DialogTitle className="text-2xl font-semibold text-[#272727]">
              Make a Secure Donation
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-justify text-[18px] text-[#595959] leading-[150%]">
            <p className="mb-4">
              I want to thank everyone who has signed up and is using our
              platform. Tablefresh is free to use, building community and
              connecting everyone to fresh nutritious food. Any and all
              donations are greatly appreciated, ensuring the future of the best
              fresh food global platform.
            </p>
            <p className="text-[#595959] mt-7">
              Thank You <br /> from the <br /> Tablefresh Team
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Input
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Enter your Amount..."
              className="w-full rounded-md border border-gray-300 p-3 text-center text-lg focus:border-[#039B06] focus:ring-[#039B06]"
            />
            <Button
              onClick={handleDonation}
              className="w-full rounded-md bg-[#039B06] py-3 text-lg font-semibold text-white hover:bg-[#028a05]"
            >
              Donate Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAmitModalOpen} onOpenChange={setIsAmitModalOpen}>
        <DialogContent className="w-[90%] rounded-xl p-6 sm:p-8 text-center">
          <CheckoutFormWrapper
            userId={userId1}
            amount={amount as number}
            type="donation"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
