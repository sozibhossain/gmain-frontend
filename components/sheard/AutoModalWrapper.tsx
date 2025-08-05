
"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";


const AutoModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg w-[500px] text-center shadow-lg">
          <h2 className="text-[24px] text-[#272727] font-semibold mb-4">Payment and Fees</h2>
          <p className="mb-6 text-[#595959] text-base">
            Table Fresh is completely free to join and use. The only fees you
            will ever see are a small credit card fee and a maintenance
            processing fee to purchase products using the payment system.
          </p>
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

const AutoReviewModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const { data: session, status } = useSession();


  const mutation = useMutation({
    mutationFn: async (data: { text: string; rating: number }) => {
      if (status === "loading") throw new Error("Session is loading");
      if (!session?.accessToken) throw new Error("No access token available");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/write-review-website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

 

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSave = () => {
    if (rating > 0 && description.trim()) {
      mutation.mutate({ text: description, rating });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[20px] text-[#272727] font-semibold">Write a Natural Review</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-left text-[#595959] text-sm mb-2">Rate Us</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-[#FACC15]" : "text-gray-300"
                  }`}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-left text-[#595959] text-sm mb-2">Description</label>
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your review here..."
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={!rating || !description.trim()}
          >
            {mutation ?   "Send" : "Sending..."}
          </button>
        </div>
      </div>
    </div>
  );
};

const AutoModalWrapper = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { status } = useSession();

  // useEffect(() => {
  //   const hasModalBeenShown = sessionStorage.getItem("modalShown");
  //   if (!hasModalBeenShown) {
  //     const timer = setTimeout(() => {
  //       setIsModalOpen(true);
  //       sessionStorage.setItem("modalShown", "true");
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, []);

  useEffect(() => {
    const hasReviewModalBeenShown = sessionStorage.getItem("reviewModalShown");
    if (!hasReviewModalBeenShown && status === "authenticated") {
      const timer = setTimeout(() => {
        setIsReviewModalOpen(true);
        sessionStorage.setItem("reviewModalShown", "true");
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  return (
    <>
      <AutoModal isOpen={isModalOpen} onClose={closeModal} />
      <AutoReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} />
    </>
  );
};

export default AutoModalWrapper;