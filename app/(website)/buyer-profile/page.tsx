

"use client";

import type React from "react";
import { useState, useRef } from "react";
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
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  avatar: {
    public_id: string;
    url: string;
  } | File | undefined;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  credit: number | null;
  role: string;
  fine: number;
  uniqueId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
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
  const session = useSession();
  const token = session.data?.accessToken;
  const router = useRouter();

  const fetchProfile = async (): Promise<ApiResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to fetch profile");
    }
    return response.json();
  };

  const updateProfile = async (
    profileData: Partial<ProfileData> & { avatar?: File }
  ): Promise<ApiResponse> => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", profileData.name || "");
    formDataToSend.append("username", profileData.username || "");
    formDataToSend.append("phone", profileData.phone || "");
    formDataToSend.append("street", profileData.address?.street || "");
    formDataToSend.append("city", profileData.address?.city || "");
    formDataToSend.append("state", profileData.address?.state || "");
    formDataToSend.append("zipCode", profileData.address?.zipCode || "");
    if (profileData.avatar) {
      formDataToSend.append("avatar", profileData.avatar);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/update-profile`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      throw new Error("Failed to update profile");
    }
    return response.json();
  };

  const changePassword = async (
    passwordData: PasswordChangeData
  ): Promise<ApiResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
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

  const profile = profileResponse?.data;

  const handleEditClick = () => {
    if (!isEditing && profile) {
      setFormData({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any ,
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
    updateMutation.mutate({
      ...formData,
      avatar: selectedImage || undefined,
    });
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
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to log out: " + (error as Error).message);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    passwordMutation.mutate(passwordData);
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        <h1 className="mb-6 text-2xl sm:text-3xl font-bold">Profile</h1>
        <div className="grid gap-6 sm:gap-8 grid-cols-1">
          <div>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full" />
                  <div>
                    <Skeleton className="h-5 sm:h-6 w-28 sm:w-32 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 sm:h-10 w-full sm:w-16" />
              </CardHeader>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Skeleton className="h-9 sm:h-10" />
                  <Skeleton className="h-9 sm:h-10" />
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Skeleton className="h-9 sm:h-10" />
                  <Skeleton className="h-9 sm:h-10" />
                </div>
                <Skeleton className="h-9 sm:h-10" />
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <Skeleton className="h-9 sm:h-10" />
                  <Skeleton className="h-9 sm:h-10" />
                  <Skeleton className="h-9 sm:h-10" />
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
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message.includes("Unauthorized")
              ? "Session expired. Please login again."
              : "Failed to load profile data. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 sm:gap-8 grid-cols-1">
        <div>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border">
                  <AvatarImage
                    src={
                      imagePreview ||
                      (profile.avatar && !(profile.avatar instanceof File)
                        ? profile.avatar.url
                        : undefined) ||
                      "/placeholder.svg?height=64&width=64"
                    }
                    alt={`@${profile.username}`}
                    className="object-cover"
                  />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg sm:text-xl">{profile.name}</CardTitle>
                  <p className="text-xs sm:sm:text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                </div>
              </div>
              {!showPasswordChange && (
                <Button
                  variant="outline"
                  className="gap-1 text-sm sm:text-base w-full sm:w-auto min-h-[44px]"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            {isEditing && (
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4">
                  <Label htmlFor="avatar" className="text-sm sm:text-base">Profile Image</Label>
                  <div className="flex items-center gap-2 sm:gap-4 flex-col sm:flex-row">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="w-full sm:w-auto text-sm sm:text-base"
                    />
                    {imagePreview && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="h-8 w-8"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                {showPasswordChange ? "Change Password" : "Personal Information"}
              </CardTitle>
              <div className="flex gap-2 flex-col sm:flex-row">
                {showPasswordChange ? (
                  <Button
                    variant="outline"
                    onClick={togglePasswordChange}
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={togglePasswordChange}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Log Out
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1 text-sm sm:text-base w-full sm:w-auto min-h-[44px] sm:hidden"
                      onClick={handleEditClick}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {showPasswordChange ? (
                <form className="grid gap-4 sm:gap-6" onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="old-password" className="text-sm sm:text-base">
                      Current Password
                    </Label>
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
                        className="text-sm sm:text-base pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password" className="text-sm sm:text-base">
                      New Password
                    </Label>
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
                        className="text-sm sm:text-base pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
                      disabled={passwordMutation.isPending}
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
                  className="grid gap-4 sm:gap-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="full-name" className="text-sm sm:text-base">
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        placeholder="Enter your full name"
                        value={isEditing ? formData.name || "" : profile.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username" className="text-sm sm:text-base">
                        User name
                      </Label>
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
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm sm:text-base">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={isEditing ? formData.email || "" : profile.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-sm sm:text-base">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={isEditing ? formData.phone || "" : profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-sm sm:text-base">
                      Address
                    </Label>
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
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="text-sm sm:text-base">
                        City
                      </Label>
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
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state" className="text-sm sm:text-base">
                        State
                      </Label>
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
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip" className="text-sm sm:text-base">
                        Zip Code
                      </Label>
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
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end gap-2 flex-col sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto min-h-[44px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
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