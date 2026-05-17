import { AlertCircle, Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PhysicalCardOrderingProps {
  profileId: string;
  fullName: string;
  email: string;
  city: string;
  cardColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    backgroundColor?: string;
  };
}

export const PhysicalCardOrdering = ({
  profileId,
  fullName,
  email,
  city,
  cardColors,
}: PhysicalCardOrderingProps) => {
  const handleOrderWithPrintful = () => {
    // In production, this would integrate with Printful API
    // For now, we'll open a pre-filled order form or support email
    const subject = encodeURIComponent(
      `Physical Business Card Order - ${fullName}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to order physical Founders Connect profile cards.\n\nProfile Details:\n- Name: ${fullName}\n- Profile ID: ${profileId}\n- Email: ${email}\n- City: ${city}\n\nPlease let me know about available options and pricing.\n\nThank you!`
    );

    window.open(`mailto:support@foundersconnect.in?subject=${subject}&body=${body}`);
  };

  const handleOrderWithVistaprint = () => {
    // Vistaprint custom card design link
    const vistaprintUrl = new URL(
      "https://www.foundersconnect.co.in/"
    );
    vistaprintUrl.searchParams.set("cm_mmc", "email-edi-upsell");
    window.open(vistaprintUrl.toString(), "_blank");
  };

  const handleDownloadTemplate = () => {
    // Generate a downloadable template for custom printing
    const template = {
      name: fullName,
      role: "Founders Connect Member",
      profileId: profileId,
      email: email,
      city: city,
      website: "foundersconnect.in",
      cardColors: cardColors,
      notes: "Print this card with QR code linking to your Founders Connect profile",
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullName}-card-template.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Coming Soon Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Physical card ordering is currently under development. We're partnering
          with premium printing services to bring you high-quality business cards!
        </AlertDescription>
      </Alert>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Option 1: Official Printful Partnership */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer size={18} />
              Official Partner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Premium Quality</p>
              <p className="text-2xl font-bold text-gray-900">$29.99</p>
              <p className="text-xs text-gray-500">for 250 cards</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Professional finish</li>
              <li>✓ Matte or glossy</li>
              <li>✓ QR code included</li>
              <li>✓ 7-10 day shipping</li>
              <li>✓ 100% satisfaction guaranteed</li>
            </ul>
            <Button
              onClick={handleOrderWithPrintful}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Request Quote
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: DIY with Vistaprint */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink size={18} />
              Vistaprint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Budget Friendly</p>
              <p className="text-2xl font-bold text-gray-900">$7.99</p>
              <p className="text-xs text-gray-500">for 250 cards</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Customizable design</li>
              <li>✓ Various finishes</li>
              <li>✓ Bulk discount available</li>
              <li>✓ Fast turnaround</li>
              <li>✓ Frequent promotions</li>
            </ul>
            <Button
              onClick={handleOrderWithVistaprint}
              variant="outline"
              className="w-full"
            >
              Design on Vistaprint
            </Button>
          </CardContent>
        </Card>

        {/* Option 3: Download Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer size={18} />
              DIY Printing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Print Anywhere</p>
              <p className="text-2xl font-bold text-gray-900">Free</p>
              <p className="text-xs text-gray-500">design template</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Download template</li>
              <li>✓ Use local printer</li>
              <li>✓ Full customization</li>
              <li>✓ Print any quantity</li>
              <li>✓ Instant availability</li>
            </ul>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full"
            >
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features & Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Order Physical Cards?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🎯 Stand Out</h4>
              <p className="text-sm text-gray-600">
                Make a lasting impression at networking events with your
                personalized Founders Connect card.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🔗 Direct Connection</h4>
              <p className="text-sm text-gray-600">
                QR code instantly connects people to your profile and portfolio
                when they scan.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">💼 Professional</h4>
              <p className="text-sm text-gray-600">
                Showcase your role and personal branding with premium card
                designs.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">📊 Trackable</h4>
              <p className="text-sm text-gray-600">
                See analytics for every scan from your physical cards and track
                engagement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Design Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Card Design Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your card will look like this when printed:
            </p>
            <div
              className="rounded-lg shadow-lg p-6 text-white flex flex-col justify-between min-h-[250px]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${cardColors?.primary || "#667eea"} 0%, ${cardColors?.secondary || "#764ba2"} 100%)`,
              }}
            >
              <div>
                <h3 className="text-xl font-bold">{fullName}</h3>
                <p className="text-sm opacity-90">Founders Connect Member</p>
              </div>
              <div className="text-xs opacity-75 space-y-1">
                <p>{city}</p>
                <p>{email}</p>
                <p>foundersconnect.in</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Standard business card size: 3.5" × 2"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">
              How do the QR codes work?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Each card includes your unique QR code that links directly to your
              Founders Connect profile. When someone scans it, they'll see your
              complete profile with analytics tracked.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              Can I customize the design?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Yes! Use your custom card colors and profile photo. For advanced
              customization, download our template and use any local printing service.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              How long does shipping take?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Official orders typically ship within 7-10 business days. Express
              options may be available during checkout.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              What's included in the price?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Our official service includes design, printing, and shipping. QR
              code placement and your profile branding are included.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicalCardOrdering;
