import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/')
          }
        }}
        className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-accent hover:text-foreground hover:border-border/80 active:scale-95"
      >
        <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
        Go Back
      </button>
    </div>
  );
}
