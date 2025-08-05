

'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Import Suspense
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CheckoutFormWrapper from './_component/CheckoutPage';

// Define types (unchanged)
interface ProductThumbnail {
  public_id: string;
  url: string;
}

interface Product {
  thumbnail: ProductThumbnail;
  _id: string;
  title: string;
  price: number;
  quantity: string;
  category: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  description: string;
  media: Array<{
    public_id: string;
    url: string;
    type: string;
    _id: string;
  }>;
  farm: {
    location: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    _id: string;
    status: string;
    name: string;
    description: string;
    isOrganic: boolean;
    images: Array<{
      public_id: string;
      url: string;
      _id: string;
    }>;
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    videos: any[];
    seller: string;
    code: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    review: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  status: string;
  code: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  review: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProductApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

interface Farm {
  location: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  _id: string;
  status: string;
  name: string;
  description: string;
  isOrganic: boolean;
  images: Array<{
    public_id: string;
    url: string;
    _id: string;
  }>;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videos: any[];
  seller: string;
  code: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  review: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  farm: Farm;
  _id: string;
}

interface CartData {
  _id: string;
  customer: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CartApiResponse {
  success: boolean;
  message: string;
  data: CartData;
}

interface UserProfile {
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
  credit: null | number;
  role: string;
  fine: number;
  uniqueId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  farm: string;
}

interface UserApiResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}



// Component to handle useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantityParam = searchParams.get('quantity');
  const quantity = quantityParam ? parseInt(quantityParam, 10) : 1;
  const session = useSession();
  const token = session?.data?.accessToken;

  // State for address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch cart data
  const {
    data: cartResponse,
    isLoading: isCartLoading,
    error: cartError,
  } = useQuery<CartApiResponse>({
    queryKey: ['cartData'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
     
      return response.json();
    },
    enabled: !!token && !productId,
  });

  // Fetch product data if productId is present
  const {
    data: productResponse,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery<ProductApiResponse>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }
      return response.json();
    },
    enabled: !!token && !!productId,
  });

  // Fetch user profile data
  const {
    data: userResponse,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery<UserApiResponse>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!token,
  });

  const cartData = cartResponse?.data;
  const productData = productResponse?.data;
  const userData = userResponse?.data;

  // Initialize address fields when userData is loaded
  useEffect(() => {
    if (userData?.address) {
      setStreet(userData.address.street || '');
      setCity(userData.address.city || '');
      setState(userData.address.state || '');
      setZipCode(userData.address.zipCode || '');
    }
  }, [userData]);

  // Mutation for order creation
  const checkoutMutation = useMutation({
    mutationFn: async (orderData: {
      productId?: string;
      quantity?: number;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }) => {
      const hasValidData = productId
        ? productData && quantity > 0
        : cartData && cartData.total > 0 && userData?._id;
      if (!hasValidData) {
        throw new Error('Required data is missing for checkout');
      }

      const endpoint = productId
        ? `${process.env.NEXT_PUBLIC_API_URL}/order/single-order`
        : `${process.env.NEXT_PUBLIC_API_URL}/order/checkout`;

      const body = productId
        ? {
            productId: orderData.productId,
            quantity: orderData.quantity,
            address: {
              street: orderData.address.street,
              city: orderData.address.city,
              state: orderData.address.state,
              zipCode: orderData.address.zipCode,
            },
          }
        : {
            address: {
              street: orderData.address.street,
              city: orderData.address.city,
              state: orderData.address.state,
              zipCode: orderData.address.zipCode,
            },
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create ${productId ? 'single order' : 'checkout order'}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setServiceId(data.data._id);
      setShowPaymentModal(true);
    },
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setErrorMessage(error.message || 'Order creation failed. Please try again.');
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode || !country) {
      setErrorMessage('Please fill in all address fields.');
      return;
    }
    setErrorMessage('');
    const addressData = { street, city, state, zipCode };
    checkoutMutation.mutate({ address: addressData, productId: productId ?? undefined, quantity });
  };

  // Calculate subtotal, shipping, and total
  const subtotal = productId
    ? productData?.price ? productData.price * quantity : 0
    : cartData?.total || 0;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information Form */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-semibold">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isUserLoading && <div className="text-center text-gray-600">Loading profile...</div>}
            {userError && <div className="text-red-500 text-center">Error: {userError.message}</div>}
            {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
            {userData && (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={userData.name.split(' ')[0] || ''} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={userData.name.split(' ').slice(1).join(' ') || ''} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userData.email || ''} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={userData.phone || ''} readOnly />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-end mt-8">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    disabled={checkoutMutation.isPending || (!productId && !cartData?.total) || !userData?._id}
                  >
                    {checkoutMutation.isPending ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 h-fit sticky top-1">
          <CardHeader className="mb-2">
            <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="">
            {isCartLoading && !productId && <div className="text-center text-gray-600">Loading cart...</div>}
            {isProductLoading && productId && <div className="text-center text-gray-600">Loading product...</div>}
            {cartError && !productId && <div className="text-red-500 text-center">Error: {cartError.message}</div>}
            {productError && productId && <div className="text-red-500 text-center">Error: {productError.message}</div>}
            {!isCartLoading && !cartError && !cartData && !productId && (
              <div className="text-center text-muted-foreground">No items in cart.</div>
            )}
            {!isProductLoading && !productError && !productData && productId && (
              <div className="text-center text-muted-foreground">No product found.</div>
            )}
            {(cartData || productData) && (
              <div className="grid gap-3">
                {productId && productData ? (
                  <div className="flex items-center gap-4">
                    <Image
                      src={productData.thumbnail.url || '/placeholder.svg?height=64&width=64&query=product thumbnail'}
                      alt={productData.title}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="grid gap-1 flex-1">
                      <div className="font-medium">{productData.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {quantity} x ${productData.price.toFixed(2)}
                      </div>
                      <div className="font-semibold">${(quantity * productData.price).toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  cartData?.items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-4">
                      <Image
                        src={item.product.thumbnail.url || '/placeholder.svg?height=64&width=64&query=product thumbnail'}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="grid gap-1 flex-1">
                        <div className="font-medium">{item.product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </div>
                        <div className="font-semibold">${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                )}
                <Separator className="my-4" />
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">Subtotal</div>
                    <div className="font-medium">${subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">Shipping</div>
                    <div className="font-medium">Free</div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <div>Total</div>
                    <div>${total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {userData && (cartData || (productData && productId)) && serviceId && (
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="!w-[1005px]">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
              </DialogHeader>
              <CheckoutFormWrapper
                userId={userData._id}
                serviceId={serviceId}
                amount={productId && productData ? productData.price * quantity : cartData?.total ?? 0}
                type="order"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Wrapper component with Suspense
export default function CheckoutPageWrapper() {
  return (
      <Suspense fallback={<div className="text-center text-gray-600">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
  );
}