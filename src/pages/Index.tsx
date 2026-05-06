import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import GallerySection from "@/components/GallerySection";
import StatsSection from "@/components/StatsSection";
import PortfolioMarquee from "@/components/PortfolioMarquee";
import ExploreNetwork from "@/components/ExploreNetwork";
import JourneySection from "@/components/JourneySection";
import Testimonials from "@/components/Testimonials";
import JoinUsSection from "@/components/JoinUsSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPublicSiteNoticeApi, type SiteNotice } from "@/lib/api";

const Index = () => {
  const [siteNotice, setSiteNotice] = useState<SiteNotice | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getPublicSiteNoticeApi()
      .then((response) => {
        if (!isMounted) return;

        setSiteNotice(response.notice);
        setIsNoticeOpen(Boolean(response.notice?.isActive && response.notice?.message));
      })
      .catch(() => {
        if (!isMounted) return;
        setSiteNotice(null);
        setIsNoticeOpen(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
        <DialogContent className="max-w-xl overflow-hidden border-violet-100 p-0 sm:max-w-2xl">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Announcement</p>
            <DialogTitle className="mt-2 text-2xl font-heading font-bold text-white">
              {siteNotice?.title || "Announcement"}
            </DialogTitle>
          </div>
          <div className="space-y-5 px-6 py-6">
            <DialogDescription className="whitespace-pre-wrap text-base leading-7 text-slate-600">
              {siteNotice?.message}
            </DialogDescription>
            {siteNotice?.buttonLabel && siteNotice?.buttonUrl && (
              <DialogFooter className="sm:justify-start">
                <Button asChild className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white sm:w-auto">
                  <a
                    href={siteNotice.buttonUrl}
                    target={siteNotice.buttonUrl.startsWith("/") ? undefined : "_blank"}
                    rel={siteNotice.buttonUrl.startsWith("/") ? undefined : "noreferrer"}
                  >
                    {siteNotice.buttonLabel}
                  </a>
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Navbar />
      <HeroSlider />
      <StatsSection />
      <PortfolioMarquee />
      <ExploreNetwork />
      <JourneySection />
      <GallerySection />
      <Testimonials />
      <JoinUsSection showSocial={true} />
      <Footer />
    </div>
  );
};

export default Index;
