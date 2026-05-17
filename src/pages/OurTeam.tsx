import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PixelTransition from "@/components/ui/PixelTransition";
import { useSEO } from "@/hooks/useSEO";

const Linkedin = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const teamMembers = [
  {
    name: "Ashish Shah",
    role: "Visionary Leader",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/ashishshah",
  },
  {
    name: "Piyush Kanth",
    role: "Tech Guru",
    imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/piyushkanth",
  },
  {
    name: "Rajan Jha",
    role: "Creative Head",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac5c?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/rajanjha",
  },
  {
    name: "Kedarnath",
    role: "Marketing Maestro",
    imageUrl: "https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/kedarnath",
  },
  {
    name: "Unnati Verma",
    role: "Product Lead",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/unnativerma",
  },
  {
    name: "Shalni",
    role: "Design Expert",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/shalni",
  },
  {
    name: "Tushar",
    role: "Frontend Wizard",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/tushar",
  },
  {
    name: "Shivansh",
    role: "Backend Rockstar",
    imageUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=300&h=300&fit=crop",
    linkedinUrl: "https://linkedin.com/in/shivansh",
  },
];

const OurTeam = () => {
  useSEO({
    title: "Our Team",
    description: "Meet the talented team behind our success.",
  });

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground tracking-tight">
            Meet Our Team
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            The passionate individuals driving our vision forward.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
          {teamMembers.map((member) => (
            <PixelTransition
              key={member.name}
              firstContent={
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
              }
              secondContent={
                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950 bg-opacity-80 p-4 text-center">
                  <h3 className="font-heading text-2xl font-bold text-white">{member.name}</h3>
                  <p className="text-sm text-purple-200 mt-1">{member.role}</p>
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 p-2.5 rounded-full bg-white bg-opacity-10 hover:bg-opacity-25 text-white hover:text-blue-400 transition-all duration-300 transform hover:scale-110 shadow-sm"
                      title={`Connect with ${member.name} on LinkedIn`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="fill-current" size={20} />
                    </a>
                  )}
                </div>
              }
              pixelColor="#8b5cf6"
              className="mx-auto"
              aspectRatio="100%"
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OurTeam;