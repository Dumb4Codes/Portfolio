import { useState, useEffect } from "react";
import { motion } from "motion/react";

function Navigation({ handleScroll }) {
  return (
    <ul className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10 text-lg font-medium text-neutral-300">
      {["home", "about", "projects", "resume", "contact"].map((id) => (
        <li key={id}>
          <button
            className="relative cursor-pointer group"
            onClick={() => handleScroll(id)}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
          </button>
        </li>
      ))}
    </ul>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  const handleScroll = (id) => {
    setIsOpen(false); // close menu when navigating

    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.25; // 25% scroll threshold
      setIsBlurred(window.scrollY > heroHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-20 w-full"
      animate={{
        backgroundColor: isBlurred ? "rgba(6,8,21,0.85)" : "rgba(0,0,0,0)",
        backdropFilter: isBlurred ? "blur(12px)" : "blur(0px)",
        boxShadow: isBlurred
          ? "0 0 25px -8px rgba(128,90,213,0.4)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto py-4 px-6 md:px-10">
        {/* 🟣 Left - Name */}
        <a
          href="/"
          className="flex items-center gap-3 text-lg md:text-xl font-semibold tracking-wide text-white transition-colors hover:text-indigo-300"
        >
          Youvraj.S
        </a>

        {/* 🟣 Desktop Navigation */}
        <nav className="hidden sm:flex">
          <Navigation handleScroll={handleScroll} />
        </nav>

        {/* 🟣 Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer text-neutral-400 hover:text-white focus:outline-none sm:hidden px-3 py-2 rounded-xl backdrop-blur-md bg-[#0b0d17]/70 shadow-[0_0_20px_-8px_rgba(128,90,213,0.35)] transition-all duration-300"
        >
          <img
            src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
            className="w-6 h-6 transition-transform duration-200 hover:scale-110"
            alt="toggle menu"
          />
        </button>
      </div>

      {/* 🟣 Mobile Dropdown Menu */}
      {isOpen && (
        <motion.div
          className="absolute top-[70px] w-[90%] left-1/2 transform -translate-x-1/2 text-center bg-[#0b0d17]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_-10px_rgba(128,90,213,0.35)] sm:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <nav className="py-6">
            <Navigation handleScroll={handleScroll} />
          </nav>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Navbar;
