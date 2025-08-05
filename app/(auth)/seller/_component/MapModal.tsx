"use client";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (
    lat: number,
    lng: number,
    placeName: string | null
  ) => void;
  initialLat: number | null; // <- allow null
  initialLng: number | null; // <- allow null
}

interface IconDefaultWithPrivate extends L.Icon.Default {
  _getIconUrl?: () => string;
}

// Default coordinates that show the entire USA
const USA_CENTER = [37.8, -96] as [number, number];
const USA_ZOOM = 4;

export default function MapModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat,
  initialLng,
}: MapModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null); // Start with null to ensure USA view on first load
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fix for default Leaflet icon issues with Webpack (runs only on client side)

  
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as IconDefaultWithPrivate)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    }
  }, []);

  // Fetch place name using Nominatim API
  const fetchPlaceName = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const displayName = data?.display_name || "Unknown location";
      console.log("Place name fetched:", displayName);
      setPlaceName(displayName);
    } catch (error) {
      console.error("Error fetching place name:", error);
      setPlaceName("Unknown location");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce API call to avoid rate limits
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedPosition) {
      setIsLoading(true);
      timer = setTimeout(() => {
        fetchPlaceName(selectedPosition[0], selectedPosition[1]);
      }, 500); // 500ms debounce
    } else {
      setPlaceName(null);
      setIsLoading(false);
    }
    return () => clearTimeout(timer);
  }, [selectedPosition]);

  // Set initial marker position when modal opens, but don't affect map center/zoom
  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(
        initialLat !== undefined &&
          initialLng !== undefined &&
          initialLat !== null &&
          initialLng !== null
          ? [initialLat, initialLng]
          : null
      );
    }
  }, [isOpen, initialLat, initialLng]);

  // Component to handle map clicks
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return selectedPosition === null ? null : (
      <Marker position={selectedPosition}>
        <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
          {isLoading ? "Loading..." : placeName || "Unknown location"}
        </Tooltip>
      </Marker>
    );
  }

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect(selectedPosition[0], selectedPosition[1], placeName);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Select Farm Location</DialogTitle>
          <DialogDescription>
            Click on the map to select your farm&lsquo;s location.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="h-[400px] w-full rounded-md overflow-hidden">
            {isOpen && (
              <MapContainer
                center={selectedPosition || USA_CENTER} // Use selectedPosition if available, else USA_CENTER
                zoom={selectedPosition ? 13 : USA_ZOOM} // Zoom in if position selected, else USA_ZOOM
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
              </MapContainer>
            )}
          </div>
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Location
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-black text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
