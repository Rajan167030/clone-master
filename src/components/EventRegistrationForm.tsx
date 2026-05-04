import { useState, useMemo, useCallback } from "react";
import { Calendar, MapPin, Ticket, Check, AlertCircle, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/session";

interface EventRegistrationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketPrice: number;
  eventSlug: string;
  onSuccess?: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  userRole: string;
  specialRequirements: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export const EventRegistrationForm = ({
  isOpen,
  onOpenChange,
  eventTitle,
  eventDate,
  eventLocation,
  ticketPrice,
  eventSlug,
  onSuccess,
}: EventRegistrationFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);

  const session = useMemo(() => getSession(), []);


  const isMember = useMemo(() => {
    if (!session) return false;
    return (
      !!session.membershipTier &&
      session.membershipTier !== "free"
    );
  }, [session]);

  const [formData, setFormData] = useState<FormData>({
    fullName: session?.fullName ?? "user",
    email: session?.email ?? "",
    phone: session?.phone ?? "",
    city: session?.city ?? "",
    userRole: session?.role ?? "user",
    specialRequirements: "",
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const resetAndClose = useCallback(() => {
    onOpenChange(false);
    setStep("form");
    setPaymentData({ cardNumber: "", expiryDate: "", cvv: "" });
    onSuccess?.();
  }, [onOpenChange, onSuccess]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    } else if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setPaymentData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.city.trim()
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validatePayment = (): boolean => {
    const rawCard = paymentData.cardNumber.replace(/\s/g, "");

    if (!rawCard || !paymentData.expiryDate || !paymentData.cvv) {
      toast({
        title: "Missing Payment Details",
        description: "Please fill in all payment information.",
        variant: "destructive",
      });
      return false;
    }

    if (rawCard.length !== 16) {
      toast({
        title: "Invalid Card Number",
        description: "Card number must be 16 digits.",
        variant: "destructive",
      });
      return false;
    }

    if (paymentData.cvv.length !== 3) {
      toast({
        title: "Invalid CVV",
        description: "CVV must be 3 digits.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isMember) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStep("success");
        toast({
          title: "Success!",
          description: "You have been registered for the event (Member - Free).",
        });
        setTimeout(resetAndClose, 2000);
      } catch {
        toast({
          title: "Error",
          description: "Failed to register. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep("payment");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePayment()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
      toast({
        title: "Payment Successful!",
        description: `You have been registered for the event. Amount charged: ₹${ticketPrice}`,
      });
      setTimeout(resetAndClose, 2000);
    } catch {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRazorpayCheckout = useCallback(() => {
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: ticketPrice * 100,
      currency: "INR",
      name: "Founders Connect",
      description: eventTitle,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      handler: (_response: Record<string, string>) => {
        setStep("success");
        toast({
          title: "Payment Successful!",
          description: "You have been registered for the event.",
        });
        setTimeout(resetAndClose, 2000);
      },
      modal: {
        ondismiss: () => {
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. Please try again.",
            variant: "destructive",
          });
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [ticketPrice, eventTitle, formData, toast, resetAndClose]);

  const handleRazorpayPayment = useCallback(() => {
    // Avoid loading the script multiple times
    if ((window as any).Razorpay) {
      openRazorpayCheckout();
      return;
    }

    const existing = document.getElementById("razorpay-script");
    if (existing) {
      existing.addEventListener("load", openRazorpayCheckout);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = openRazorpayCheckout;
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);
  }, [openRazorpayCheckout, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "form" && "Event Registration"}
            {step === "payment" && "Payment Details"}
            {step === "success" && "Registration Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Fill in your details to register for this event"}
            {step === "payment" && "Complete your payment to confirm registration"}
            {step === "success" && "You are all set!"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Event Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Ticket size={18} className="text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{eventTitle}</p>
                    <p className="text-sm text-gray-600 mt-1">{eventSlug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-700 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    {eventDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {eventLocation}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Badge */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {isMember ? (
                  <>
                    <Check size={18} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">Member Account</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} className="text-amber-600" />
                    <span className="text-sm font-semibold text-gray-900">Non-Member Account</span>
                  </>
                )}
              </div>
              {isMember ? (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  FREE ACCESS
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  Payment Required: ₹{ticketPrice}
                </Badge>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="Your city"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="userRole" className="text-sm font-semibold text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <Input
                  id="userRole"
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleFormChange}
                  placeholder="Your role"
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="specialRequirements" className="text-sm font-semibold text-gray-700">
                  Special Requirements (Optional)
                </label>
                <Textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleFormChange}
                  placeholder="Any dietary or accessibility requirements?"
                  className="min-h-20"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : isMember ? (
                  <>
                    <Check size={18} />
                    Register (Free)
                  </>
                ) : (
                  <>Proceed to Payment - ₹{ticketPrice}</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Form */}
        {step === "payment" && (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Event Fee</span>
                  <span className="font-semibold">₹{ticketPrice}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-blue-600">₹{ticketPrice}</span>
                </div>
              </CardContent>
            </Card>

            {/* Razorpay Option */}
            <Button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold gap-2 h-12"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay with Razorpay</>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Card Payment Form */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Card Details</p>

              <div className="space-y-2">
                <label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handlePaymentChange}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    placeholder="123"
                    maxLength={3}
                    type="password"
                  />
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("form")}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${ticketPrice}`
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your payment information is secure and encrypted. No charges will be made without your
              consent.
            </p>
          </form>
        )}

        {/* Step 3: Success Message */}
        {step === "success" && (
          <div className="space-y-6 py-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold text-gray-900">Registration Confirmed!</h3>
              <p className="text-gray-600">
                You have successfully registered for{" "}
                <span className="font-semibold">{eventTitle}</span>
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-gray-900">Confirmation Email:</span> A
                  confirmation has been sent to {formData.email}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Event Date:</span> {eventDate}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Location:</span> {eventLocation}
                </p>
                {!isMember && (
                  <p>
                    <span className="font-semibold text-gray-900">Amount Paid:</span> ₹{ticketPrice}
                  </p>
                )}
              </CardContent>
            </Card>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationForm;