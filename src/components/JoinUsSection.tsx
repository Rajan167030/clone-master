import { Link } from "react-router-dom";

const JoinUsSection = ({ showSocial = true }) => {
  if (!showSocial) return null;

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/5 p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Join Our Community
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                Become Part of Founders Connect
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Join our vibrant founder community and connect with builders, founders, and innovators who are shaping what's next.
              </p>
              
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/join-us"
                  className="rounded-md border border-border bg-primary px-8 py-3 text-base font-semibold text-foreground transition-all hover:brightness-95"
                >
                  Join our community
                </Link>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
