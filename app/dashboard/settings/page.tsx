"use client";

import type React from "react";
import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  Pencil,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import UpdateFarm to avoid SSR issues
const UpdateFarm = dynamic(() => import("./_components/updateFarm"), {
  ssr: false,
});

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Avatar {
  public_id: string;
  url: string;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  avatar: Avatar | File | null;
  address: Address;
  credit: number | null;
  role: string;
  fine: number;
  uniqueId: string;
  createdAt: string;
  updatedAt: string;
  isStripeOnboarded: boolean;
  farm: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

interface StripeConnectResponse {
  url: string;
}

export default function BuyerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const router = useRouter();

  // Ensure API URL is defined
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined in environment variables"
    );
  }

  const fetchProfile = async (): Promise<ApiResponse<ProfileData>> => {
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await fetch(`${API_URL}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error(errorData.message || "Failed to fetch profile");
    }
    return response.json();
  };

  const updateProfile = async (
    profileData: Partial<ProfileData> & { avatar?: File | null }
  ): Promise<ApiResponse<ProfileData>> => {
    if (!token) {
      throw new Error("No authentication token found");
    }
    const formDataToSend = new FormData();
    formDataToSend.append("name", profileData.name || "");
    formDataToSend.append("username", profileData.username || "");
    formDataToSend.append("phone", profileData.phone || "");
    formDataToSend.append("street", profileData.address?.street || "");
    formDataToSend.append("city", profileData.address?.city || "");
    formDataToSend.append("state", profileData.address?.state || "");
    formDataToSend.append("zipCode", profileData.address?.zipCode || "");

    // Only append avatar if a file is explicitly provided or null (to remove)
    if (profileData.avatar !== undefined) {
      if (profileData.avatar === null) {
        formDataToSend.append("avatar", ""); // Send empty string to indicate avatar removal
      } else {
        formDataToSend.append("avatar", profileData.avatar); // Append the file
      }
    }

    const response = await fetch(`${API_URL}/user/update-profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error(errorData.message || "Failed to update profile");
    }
    return response.json();
  };

  const changePassword = async (
    passwordData: PasswordChangeData
  ): Promise<PasswordChangeResponse> => {
    if (!token) {
      throw new Error("No authentication token found");
    }
    // Validate password complexity
    if (passwordData.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }
    

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
    }
    return response.json();
  };

  const connectStripe = async (
    userId: string
  ): Promise<StripeConnectResponse> => {
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await fetch(`${API_URL}/payment/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to connect Stripe account");
    }
    return response.json();
  };

  const fetchStripeLoginLink = async (
    userId: string
  ): Promise<{ url: string }> => {
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await fetch(
      `${API_URL}/payment/stripe-login-link/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch Stripe login link");
    }
    return response.json();
  };

  const {
    data: profileResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: status === "authenticated" && !!token,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      setFormData({});
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordChange(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const stripeMutation = useMutation({
    mutationFn: connectStripe,
    onSuccess: (data) => {
      router.push(data.url);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to connect Stripe account");
    },
  });

  const { data: stripeLoginLink, isLoading: isStripeLinkLoading } = useQuery({
    queryKey: ["stripeLoginLink", profileResponse?.data?._id ?? ""],
    queryFn: () => fetchStripeLoginLink(profileResponse?.data?._id ?? ""),
    enabled:
      !!profileResponse?.data?._id && profileResponse?.data?.isStripeOnboarded,
  });

  const profile = profileResponse?.data;

  const farmId = profile?.farm;


  const handleEditClick = () => {
    if (!isEditing && profile) {
      setFormData({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        avatar: profile.avatar,
      });
      setImagePreview(
        profile.avatar && "url" in profile.avatar ? profile.avatar.url : null
      );
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1] as keyof Address;
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        } as Address,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePasswordChange = (
    field: keyof PasswordChangeData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleSave = () => {
    // Create a clean copy of the formData without avatar
    const { ...rest } = formData;

    // Create the updatedData with the correct avatar type
    const updatedData: Partial<ProfileData> & { avatar?: File | null } = {
      ...rest,
      avatar: selectedImage ?? undefined, 
    };

    // If explicitly removing the image
    if (selectedImage === null) {
      updatedData.avatar = null;
    }

    updateMutation.mutate(updatedData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        await signOut({ redirect: false });
        toast.success("Logged out successfully!");
        router.push("/");
      } catch (error) {
        toast.error("Failed to log out: " + (error as Error).message);
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    passwordMutation.mutate(passwordData);
  };

  const handleStripeConnect = () => {
    if (profile?._id) {
      stripeMutation.mutate(profile._id);
    } else {
      toast.error("User ID not found");
    }
  };

  const togglePasswordChange = () => {
    setShowPasswordChange(!showPasswordChange);
    if (isEditing) {
      setIsEditing(false);
      setFormData({});
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = useMemo(
    () => (name: string) =>
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2),
    []
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 md:py-12">
        <h1 className="mb-8 text-3xl font-bold">Profile</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-16" />
              </CardHeader>
            </Card>
          </div>
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                <Skeleton className="h-10" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 md:py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message.includes("Unauthorized")
              ? "Session expired. Please login again."
              : error.message ||
                "Failed to load profile data. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 md:py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profile data not found. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }



  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="mb-8 text-3xl font-bold">Profile</h1>
        <div className="flex gap-4">
          <UpdateFarm farmId={farmId || ""} />
          <Button
            onClick={handleStripeConnect}
            disabled={stripeMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white font-bold h-[48px] px-4 rounded"
            aria-label={
              profile.isStripeOnboarded
                ? "Manage Stripe account"
                : "Add Stripe account"
            }
          >
            {stripeMutation.isPending && (
              <Loader2 className="mr-2 w-4 animate-spin" />
            )}
            {profile.isStripeOnboarded
              ? "Allready added stripe"
              : "Add Stripe Account"}
          </Button>

          <Dialog
            // open={profile.isStripeOnboarded === false}
            onOpenChange={(open) => {
              if (open) {
                handleStripeConnect();
              }
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  <div className="flex items-center justify-between gap-2 py-4">
                    <p>Stripe Account Required</p>
                    <Link
                      href="/"
                      className="flex items-center text-sm hover:text-green-600 gap-2 bg-green-200 rounded p-1 px-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Home
                    </Link>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  You don&apos;t have any associated Stripe account at the
                  moment. Please add one to start receiving payments.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Button
                  onClick={handleStripeConnect}
                  disabled={stripeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold h-[48px] px-4 rounded w-full"
                  aria-label={
                    profile.isStripeOnboarded
                      ? "Manage Stripe account"
                      : "Add Stripe account"
                  }
                >
                  {stripeMutation.isPending && (
                    <Loader2 className="mr-2 w-4 animate-spin" />
                  )}
                  {profile.isStripeOnboarded
                    ? "Manage Stripe"
                    : "Add Stripe Account"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="py-4 flex justify-end">
        {isStripeLinkLoading ? (
          <Skeleton className="h-6 w-48" />
        ) : (
          stripeLoginLink?.url && (
            <Link
              href={stripeLoginLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 flex items-center gap-2"
              aria-label="Go to your Stripe dashboard"
            >
              Go to your Stripe dashboard <ArrowRight />
            </Link>
          )
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage
                      src={
                        imagePreview ||
                        (profile.avatar && "url" in profile.avatar
                          ? profile.avatar.url
                          : undefined) ||
                        "/placeholder.svg?height=64&width=64"
                      }
                      alt={`@${profile.username}'s profile image`}
                    />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  {isEditing && imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                      aria-label="Remove profile image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div>
                  <CardTitle>{profile.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                </div>
              </div>
              {!showPasswordChange && (
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={handleEditClick}
                  aria-label={isEditing ? "Cancel editing" : "Edit profile"}
                >
                  <Pencil className="h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
            </CardHeader>
            {isEditing && (
              <CardContent>
                <div className="grid gap-4">
                  <Label htmlFor="avatar">Profile Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="w-auto"
                      aria-label="Upload profile image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      aria-label="Trigger file upload"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {showPasswordChange
                  ? "Change Password"
                  : "Personal Information"}
              </CardTitle>
              <div className="flex gap-2">
                {showPasswordChange ? (
                  <Button
                    variant="outline"
                    onClick={togglePasswordChange}
                    aria-label="Back to profile"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={togglePasswordChange}
                      aria-label="Change password"
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      aria-label="Log out"
                    >
                      Log Out
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1 md:hidden"
                      onClick={handleEditClick}
                      aria-label={isEditing ? "Cancel editing" : "Edit profile"}
                    >
                      <Pencil className="h-4 w-4" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showPasswordChange ? (
                <form className="grid gap-6" onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="old-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="old-password"
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                          handlePasswordChange("oldPassword", e.target.value)
                        }
                        required
                        aria-label="Current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        aria-label={
                          showOldPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        required
                        aria-label="New password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={passwordMutation.isPending}
                      aria-label="Change password"
                    >
                      {passwordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Change Password
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  className="grid gap-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        placeholder="Enter your full name"
                        value={isEditing ? formData.name || "" : profile.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="Full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">User name</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={
                          isEditing ? formData.username || "" : profile.username
                        }
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="Username"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={isEditing ? formData.email || "" : profile.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled
                        aria-label="Email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={isEditing ? formData.phone || "" : profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="Phone number"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address"
                      value={
                        isEditing
                          ? formData.address?.street || ""
                          : profile.address.street
                      }
                      onChange={(e) =>
                        handleInputChange("address.street", e.target.value)
                      }
                      disabled={!isEditing}
                      aria-label="Street address"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Enter your city"
                        value={
                          isEditing
                            ? formData.address?.city || ""
                            : profile.address.city
                        }
                        onChange={(e) =>
                          handleInputChange("address.city", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="City"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Enter your state"
                        value={
                          isEditing
                            ? formData.address?.state || ""
                            : profile.address.state
                        }
                        onChange={(e) =>
                          handleInputChange("address.state", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="State"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        placeholder="Enter your zip code"
                        value={
                          isEditing
                            ? formData.address?.zipCode || ""
                            : profile.address.zipCode
                        }
                        onChange={(e) =>
                          handleInputChange("address.zipCode", e.target.value)
                        }
                        disabled={!isEditing}
                        aria-label="Zip code"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                        aria-label="Cancel editing"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        aria-label="Save profile changes"
                      >
                        {updateMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
