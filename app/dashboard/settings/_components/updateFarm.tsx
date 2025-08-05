"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, MapPin, X } from "lucide-react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Constants
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type LeafletIconPrototype = {
  _getIconUrl?: string;
} & typeof L.Icon.Default.prototype;

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

interface FarmData {
  farmName: string;
  description: string;
  isOrganic: boolean;
  location: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  latitude: number;
  longitude: number;
  media: Array<{ public_id: string; url: string; _id: string }>;
}

interface FarmResponse {
  success: boolean;
  message: string;
  data: {
    farm: {
      name: string;
      description: string;
      isOrganic: boolean;
      location: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
      _id: string;
      images: Array<{ public_id: string; url: string; _id: string }>;
      videos: unknown[];
      seller: string;
      longitude: number;
      latitude: number;
      code: string;
      review: unknown[];
      createdAt: string;
      updatedAt: string;
    };
    product: unknown[];
  };
}

interface SelectedFileWithUrl {
  file: File;
  url: string;
}

const fetchFarmData = async (
  farmId: string,
  token: string
): Promise<FarmResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/farm/${farmId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch farm data: ${text}`);
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("Invalid JSON response from server");
    }
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
};

const updateFarmData = async ({
  farmId,
  data,
  token,
  deletedImagePublicIds,
  newImages,
}: {
  farmId: string;
  data: FarmData;
  token: string;
  deletedImagePublicIds: string[];
  newImages: File[];
}) => {

  const formDataToSend = new FormData();
  formDataToSend.append("farmName", data.farmName.trim());
  formDataToSend.append("description", data.description.trim());
  formDataToSend.append("isOrganic", String(data.isOrganic));
  formDataToSend.append("location[street]", data.location.street.trim());
  formDataToSend.append("location[city]", data.location.city.trim());
  formDataToSend.append("location[state]", data.location.state.trim());
  formDataToSend.append("location[zipCode]", data.location.zipCode.trim());
  formDataToSend.append("latitude", String(data.latitude));
  formDataToSend.append("longitude", String(data.longitude));

  if (deletedImagePublicIds.length > 0) {
    formDataToSend.append(
      "removeImages",
      JSON.stringify(deletedImagePublicIds)
    );
  }

  newImages.forEach((file) => {
    formDataToSend.append("media", file);
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/seller/farm/update/${farmId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      }
    );

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
    if (!response.ok) {
      throw new Error(data.message || `Failed to update farm: ${text}`);
    }
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
};

const MapClickHandler: React.FC<{
  setFormData: React.Dispatch<React.SetStateAction<FarmData>>;
}> = ({ setFormData }) => {
  useMapEvents({
    click(e) {
      const lat = Math.max(-90, Math.min(90, e.latlng.lat));
      const lng = Math.max(-180, Math.min(180, e.latlng.lng));
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    },
  });
  return null;
};

interface UpdateFarmProps {
  farmId: string;
}

const UpdateFarm: React.FC<UpdateFarmProps> = ({ farmId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FarmData>({
    farmName: "",
    description: "",
    isOrganic: false,
    location: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    latitude: 0,
    longitude: 0,
    media: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileWithUrl[]>([]);
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>(
    []
  );

  const { data: session, status: sessionStatus } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const {
    data: farmdata,
    isLoading,
    error,
  } = useQuery<FarmResponse, Error>({
    queryKey: ["farm", farmId],
    queryFn: () => {
      if (!farmId) throw new Error("Farm ID is missing");
      if (!token) throw new Error("Authentication token missing");
      return fetchFarmData(farmId, token);
    },
    enabled: !!farmId && isOpen && !!token && sessionStatus === "authenticated",
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        farmName: "",
        description: "",
        isOrganic: false,
        location: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        latitude: 0,
        longitude: 0,
        media: [],
      });
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.url));
      setSelectedFiles([]);
      setDeletedImagePublicIds([]);
      setLocationError(null);
    }
  }, [isOpen]); // Removed `selectedFiles` from the dependency array

  useEffect(() => {
    if (farmdata) {
      setFormData({
        farmName: farmdata.data.farm.name || "",
        description: farmdata.data.farm.description || "",
        isOrganic: farmdata.data.farm.isOrganic || false,
        location: {
          street: farmdata.data.farm.location.street || "",
          city: farmdata.data.farm.location.city || "",
          state: farmdata.data.farm.location.state || "",
          zipCode: farmdata.data.farm.location.zipCode || "",
        },
        latitude: farmdata.data.farm.latitude || 0,
        longitude: farmdata.data.farm.longitude || 0,
        media: farmdata.data.farm.images || [],
      });
    }
  }, [farmdata]);

  useEffect(() => {
    const currentSelectedFiles = selectedFiles;
    return () => {
      currentSelectedFiles.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedFiles]);

  const handleInputChange = (
    field: keyof FarmData | `location.${keyof FarmData["location"]}`,
    value: string | boolean | number
  ) => {
    if (field.startsWith("location.")) {
      const locationField = field.split(".")[1] as keyof FarmData["location"];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFilesWithUrls: SelectedFileWithUrl[] = [];
      Array.from(files).forEach((file) => {
        if (
          formData.media.length +
            selectedFiles.length +
            newFilesWithUrls.length >=
          MAX_IMAGES
        ) {
          toast.error(`Cannot upload more than ${MAX_IMAGES} images`);
          return;
        }
        const isImage = file.type.startsWith("image/");
        const isUnderSizeLimit = file.size <= MAX_FILE_SIZE;
        if (!isImage) {
          toast.error(`${file.name} is not an image file`);
          return;
        }
        if (!isUnderSizeLimit) {
          toast.error(`${file.name} exceeds 5MB size limit`);
          return;
        }
        const url = URL.createObjectURL(file);
        newFilesWithUrls.push({ file, url });
      });
      setSelectedFiles((prev) => [...prev, ...newFilesWithUrls]);
    }
  };

  const removeSelectedFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    URL.revokeObjectURL(fileToRemove.url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    const removedImage = formData.media[index];
    if (removedImage?.public_id) {
      setDeletedImagePublicIds((prev) => [...prev, removedImage.public_id]);
    }
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.farmName.trim()) {
      toast.error("Farm name is required");
      return false;
    }
    if (!formData.location.street.trim()) {
      toast.error("Street address is required");
      return false;
    }
    if (!formData.location.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.location.state.trim()) {
      toast.error("State is required");
      return false;
    }
    if (!formData.location.zipCode.trim()) {
      toast.error("Zip code is required");
      return false;
    }
    if (formData.latitude < -90 || formData.latitude > 90) {
      toast.error("Latitude must be between -90 and 90");
      return false;
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      toast.error("Longitude must be between -180 and 180");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!farmId) {
      toast.error("Farm ID is missing");
      return;
    }
    if (!token) {
      toast.error("Authentication token missing");
      return;
    }
    updateMutation.mutate({
      farmId,
      data: formData,
      token,
      deletedImagePublicIds,
      newImages: selectedFiles.map((item) => item.file),
    });
  };

  const updateMutation = useMutation({
    mutationFn: updateFarmData,
    onSuccess: () => {
      toast.success("Farm updated successfully");
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["farm", farmId] });
    },
    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const defaultMapCenter: [number, number] = useMemo(() => {
    return formData.latitude !== 0 && formData.longitude !== 0
      ? [formData.latitude, formData.longitude]
      : [0, 0];
  }, [formData.latitude, formData.longitude]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !token) {
    return (
      <div className="text-red-500">Please log in to update your farm.</div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-[48px] px-4 rounded">
            Update Farm
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Update Farm</DialogTitle>
            <DialogDescription>
              Please fill in the form to update your farm.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-100 rounded-md">
              Error: {error.message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  value={formData.farmName}
                  onChange={(e) =>
                    handleInputChange("farmName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isOrganic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) =>
                    handleInputChange("isOrganic", checked)
                  }
                />
                <Label htmlFor="isOrganic">Organic</Label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location.street">Street</Label>
                  <Input
                    id="location.street"
                    value={formData.location.street}
                    onChange={(e) =>
                      handleInputChange("location.street", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.city">City</Label>
                  <Input
                    id="location.city"
                    value={formData.location.city}
                    onChange={(e) =>
                      handleInputChange("location.city", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.state">State</Label>
                  <Input
                    id="location.state"
                    value={formData.location.state}
                    onChange={(e) =>
                      handleInputChange("location.state", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.zipCode">Zip Code</Label>
                  <Input
                    id="location.zipCode"
                    value={formData.location.zipCode}
                    onChange={(e) =>
                      handleInputChange("location.zipCode", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange(
                        "latitude",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange(
                        "longitude",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">
                  Upload New Images (Max{" "}
                  {MAX_IMAGES - formData.media.length - selectedFiles.length})
                </Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2"
                  disabled={
                    formData.media.length + selectedFiles.length >= MAX_IMAGES
                  }
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Selected new images ({selectedFiles.length}/
                      {MAX_IMAGES - formData.media.length}):
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedFiles.map((item, index) => (
                        <div key={item.url} className="relative group">
                          <Image
                            src={item.url || "/placeholder.svg"}
                            alt={item.file.name}
                            className="w-full h-32 object-cover rounded"
                            width={200}
                            height={200}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            onClick={() => removeSelectedFile(index)}
                            aria-label={`Remove ${item.file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Current Images</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {formData.media.length > 0 ? (
                    formData.media.map((image, index) => (
                      <div key={image._id} className="relative group">
                        <Image
                          src={
                            image.url ||
                            "/placeholder.svg?height=200&width=200&query=farm-image-placeholder"
                          }
                          alt={`Farm image ${image.public_id}`}
                          className="w-full h-32 object-cover rounded"
                          width={200}
                          height={200}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=200&width=200";
                            toast.error(
                              `Failed to load image ${image.public_id}`
                            );
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${image.public_id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No images available</p>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  className="w-[146px] h-[44px] bg-[#039B06] text-white hover:bg-[#039B06]"
                  onClick={() => {
                    setIsMapOpen(true);
                    setLocationError(null);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Map
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Farm Location</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto">
            <MapContainer
              center={defaultMapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <Marker position={[formData.latitude, formData.longitude]} />
              )}
              <MapClickHandler setFormData={setFormData} />
            </MapContainer>
            {locationError && <p className="text-red-500">{locationError}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMapOpen(false)}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateFarm;
