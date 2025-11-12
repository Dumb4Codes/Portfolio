import { motion } from "motion/react";

const Resume = () => {
  const education = [
    {
      title: "Bachelor of Science (Computer Science)",
      place: "St. Aloysius College, Jabalpur (RDVV University)",
      year: "2020 - 2023",
    },
    {
      title: "Higher Secondary (PCM)",
      place: "Kendriya Vidyalaya C.O.D.",
      year: "2020",
    },
  ];

  const skills = [
    "React.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL",
    "HTML & CSS",
    "Tailwind CSS",
    "Figma",
    "Git & GitHub",
  ];

  const certifications = [
    "The Web Developer Bootcamp 2025 – Colt Steele (Udemy)",
    "Full Stack Web Development – Dr. Angela Yu (Udemy)",
    "Solana Bootcamp – Rise.in",
  ];

  return (
    <section
      id="resume"
      className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20 md:px-20 overflow-hidden bg-[#01020c]"
    >
      {/* Soft gradient bg */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#060815] via-[#090b16] to-[#0d0f1e]" />

      <div className="max-w-6xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold mb-14 text-white text-center">
          Resume
        </h2>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          <motion.div
            className="p-6 rounded-2xl bg-[#0c0e19]/70 border border-white/5 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-10px_rgba(147,112,255,0.4)] transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Education</h3>
            <div className="space-y-5">
              {education.map((item, index) => (
                <div key={index}>
                  <p className="text-neutral-300 font-medium">{item.title}</p>
                  <p className="text-neutral-500 text-sm">{item.place}</p>
                  <p className="text-indigo-400 text-sm mt-1">{item.year}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            className="p-6 rounded-2xl bg-[#0c0e19]/70 border border-white/5 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-10px_rgba(147,112,255,0.4)] transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 text-sm text-white/90 bg-[#1a1c27]/70 rounded-full border border-white/10 hover:border-indigo-400/60 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all duration-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            className="p-6 rounded-2xl bg-[#0c0e19]/70 border border-white/5 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-10px_rgba(147,112,255,0.4)] transition-all duration-500 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Certifications
            </h3>
            <ul className="space-y-3 list-disc list-inside text-neutral-300">
              {certifications.map((cert, i) => (
                <li key={i} className="hover:text-indigo-400 transition-colors">
                  {cert}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Optional Download Button */}
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-5 mt-12">
          {/* 🔹 View Resume Button */}
          <motion.a
            href="/Youvraj_Singh_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 min-w-[300px] sm:min-w-[220px] px-6 py-3 text-white font-semibold rounded-xl 
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
      shadow-[0_0_20px_rgba(147,112,255,0.3)] 
      hover:shadow-[0_0_30px_rgba(147,112,255,0.5)] 
      transition-all duration-300 hover:scale-[1.05]"
            whileHover={{ scale: 1.05 }}
          >
            View Resume
          </motion.a>

          {/* 🔹 Download Resume Button */}
          <motion.a
            href="/Youvraj_Singh_CV.pdf"
            download="Youvraj_Singh_CV.pdf"
            className="flex items-center justify-center gap-2 min-w-[300px] sm:min-w-[220px] px-6 py-3 text-white font-semibold rounded-xl 
      bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600
      shadow-[0_0_20px_rgba(147,112,255,0.3)] 
      hover:shadow-[0_0_30px_rgba(147,112,255,0.5)] 
      transition-all duration-300 hover:scale-[1.05]"
            whileHover={{ scale: 1.05 }}
          >
            Download Resume
            <img
              src="assets/download.svg"
              alt="download icon"
              className="w-5 h-5 opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Resume;
