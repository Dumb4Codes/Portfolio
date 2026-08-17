import { useEffect, useState } from "react";

const techStack = [
  { name: "React", icon: "/assets/logos/react.svg" },
  { name: "Three.js", icon: "/assets/logos/threejs.svg" },
  { name: "Tailwind CSS", icon: "/assets/logos/tailwindcss.svg" },
  { name: "Vite", icon: "/assets/logos/vitejs.svg" },
  { name: "JavaScript", icon: "/assets/logos/javascript.svg" },
];

const quickLinks = ["home", "about", "projects", "resume", "contact"];

const Footer = () => {
  const [time, setTime] = useState("");

  // Live local-time chip — a small, low-effort detail that makes the footer
  // feel alive rather than static.
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (id) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden c-space">
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />

      {/* Ambient glow to match the site's aurora aesthetic */}
      <div className="absolute bottom-0 left-1/2 w-[40rem] h-[20rem] -translate-x-1/2 bg-royal/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <a
            href="/"
            className="text-2xl font-semibold tracking-wide text-white w-fit"
          >
            Youvraj.S
          </a>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
            Crafting fast, immersive, and thoughtfully-built web experiences
            one pixel and one commit at a time.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 mt-2 text-xs rounded-full w-fit bg-white/5 border border-white/10 text-neutral-400">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full bg-mint rounded-full opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-mint" />
            </span>
            Based in India {time && `· ${time} IST`}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-wider uppercase text-neutral-300">
            Navigate
          </p>
          <ul className="flex flex-col gap-3">
            {quickLinks.map((id) => (
              <li key={id}>
                <button
                  onClick={() => handleScroll(id)}
                  className="text-sm capitalize transition-colors cursor-pointer text-neutral-400 hover:text-white"
                >
                  {id}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Built with */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-wider uppercase text-neutral-300">
            Built With
          </p>
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                title={tech.name}
                className="flex items-center justify-center transition-all duration-300 border rounded-xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-1"
              >
                <img src={tech.icon} alt={tech.name} className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />

      {/* Bottom bar */}
      <div className="flex flex-col items-center justify-between gap-4 py-6 text-sm sm:flex-row text-neutral-500">
        <p>© {new Date().getFullYear()} Youvraj Singh. All rights reserved.</p>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 border rounded-full cursor-pointer group border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-1"
        >
          Back to top
          <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
            ↑
          </span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;