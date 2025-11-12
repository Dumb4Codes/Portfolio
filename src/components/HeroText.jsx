import { FlipWords } from "./FlipWords";
import { motion } from "motion/react";

const HeroText = () => {
  const words = ["Secure", "Modern", "Scalable"];

  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  // 🟣 Smooth scroll with offset (prevents navbar overlap)
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Adjust for navbar height
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="z-10 mt-20 text-center md:mt-80 md:text-left rounded-3xl bg-clip-text">
      {/* Desktop View */}
      <div className="flex-col hidden md:flex c-space">
        <motion.h1
          className="text-6xl font-medium"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1 }}
        >
          Hi, I'm <span className="font-bold text-8xl">Youvraj</span>
        </motion.h1>

        <div className="flex flex-col items-start">
          <motion.p
            className="text-6xl font-medium text-neutral-300"
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2 }}
          >
            A Developer <br /> Dedicated to Crafting
          </motion.p>

          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.5 }}
          >
            <FlipWords
              words={words}
              className="font-black text-white text-8xl"
            />
          </motion.div>

          <motion.p
            className="text-4xl font-medium text-neutral-300"
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.8 }}
          >
            Web Applications
          </motion.p>
        </div>

        {/* 💫 New Subtext & CTA */}
        <motion.div
          className="mt-10 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8, ease: "easeInOut" }}
        >
          <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
            Passionate about building interactive, high-performance digital
            experiences using modern technologies and clean architecture.
          </p>

          <motion.button
            onClick={() => scrollToSection("projects")}
            className="inline-block px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_-5px_rgba(167,139,250,0.4)] hover:shadow-[0_0_35px_-10px_rgba(167,139,250,0.7)] transition-all duration-300 hover:scale-[1.03]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            View My Work 🔥
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile View */}
      <div className="flex flex-col space-y-6 md:hidden">
        <motion.p
          className="text-4xl font-medium"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1 }}
        >
          Hi, I'm <span className="font-bold">Youvraj</span>
        </motion.p>

        <div>
          <motion.p
            className="text-5xl font-black text-neutral-300"
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.2 }}
          >
            Building
          </motion.p>

          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.5 }}
          >
            <FlipWords
              words={words}
              className="font-bold text-white text-7xl"
            />
          </motion.div>

          <motion.p
            className="text-4xl font-black text-neutral-300"
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.8 }}
          >
            Web Applications
          </motion.p>
        </div>

        {/* Mobile Subtext & CTA */}
        <motion.div
          className="mt-8 space-y-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <p className="text-base text-neutral-400 leading-relaxed px-4">
            Focused on creating responsive, modern web apps with a strong eye
            for design and performance.
          </p>

          <button
            onClick={() => scrollToSection("projects")}
            className="inline-block cursor-pointer px-6 py-3 text-base font-semibold rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_-5px_rgba(167,139,250,0.4)] hover:shadow-[0_0_35px_-10px_rgba(167,139,250,0.7)] transition-all duration-300 hover:scale-[1.03]"
          >
            View My Work
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroText;
