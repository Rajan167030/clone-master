import { Link } from "react-router-dom";

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps?q=India&z=4&output=embed";

type JoinUsSectionProps = {
  showSocial?: boolean;
};

const JoinUsSection = ({ showSocial = true }: JoinUsSectionProps) => {
  if (!showSocial) return null;

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/5 p-6 md:p-8">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Join Our Community
                </p>
                <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                  Become Part of Founders Connect
                </h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  Join our vibrant founder community and connect with builders, founders, and innovators who are shaping what's next.
                </p>

                <div className="mt-8 flex flex-col items-center md:items-start gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link
                    to="/join-us"
                    className="rounded-md border border-border bg-primary px-8 py-3 text-base font-semibold text-foreground transition-all hover:brightness-95"
                  >
                    Join our community
                  </Link>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                <div className="aspect-[4/3] w-full">
                  <iframe
                    title="India map"
                    src={GOOGLE_MAPS_EMBED_URL}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
