import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PixelTransition from "@/components/ui/PixelTransition";
import { useSEO } from "@/hooks/useSEO";

const teamMembers = [
  {
    name: "Ashish Shah",
    role: "Visionary Leader",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Piyush Kanth",
    role: "Tech Guru",
    imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Rajan Jha",
    role: "Creative Head",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac5c?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Kedarnath",
    role: "Marketing Maestro",
    imageUrl: "https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Unnati Verma",
    role: "Product Lead",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Shalni",
    role: "Design Expert",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Tushar",
    role: "Frontend Wizard",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=300&fit=crop",
  },
  {
    name: "Shivansh",
    role: "Backend Rockstar",
    imageUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=300&h=300&fit=crop",
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900 bg-opacity-75 p-4">
                  <h3 className="font-heading text-2xl font-bold text-white">{member.name}</h3>
                  <p className="text-lg text-purple-200">{member.role}</p>
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