import { useState } from "react";
import { Particles } from "../components/Particles";
import { mySocials } from "../constants";

const EMAIL = "youv2002@gmail.com";

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contact"
      className="relative flex items-center justify-center min-h-screen px-6 py-20 overflow-hidden md:px-20"
    >
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />

      <div
        className="group relative flex flex-col items-center justify-center w-full max-w-3xl p-10 mx-auto text-white border border-white/10 rounded-3xl bg-gradient-to-br from-[#01010a]/80 to-[#111827]/80 backdrop-blur-xl
      shadow-[0_0_50px_-15px_rgba(0,0,0,0.7)]
      transition-all duration-500
      hover:shadow-[0_0_80px_-10px_rgba(147,112,255,0.5)]
      group-focus-within:shadow-[0_0_100px_-15px_rgba(167,139,250,0.7)]
      group-hover:shadow-[0_0_100px_-15px_rgba(147,112,255,0.7)]"
      >
        {/* Availability badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full bg-mint rounded-full opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-mint" />
          </span>
          <span className="text-xs font-medium tracking-wide text-neutral-300">
            Open to new opportunities
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center w-full gap-4 mb-12 text-center">
          <h2 className="text-5xl font-extrabold md:text-6xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Let's Connect <span className="text-white">🚀</span>
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-neutral-400">
            Got a project in mind, an opportunity, or just want to say hi? Pick
            whatever's easiest — I read everything and reply fast.
          </p>
        </div>

        {/* Direct-contact cards */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Email — click to copy */}
          <button
            onClick={copyEmail}
            className="flex items-center gap-4 p-5 text-left transition-all duration-300 border rounded-2xl group/card border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <img
                src="/assets/socials/gmail.svg"
                alt="Email"
                className="w-5 h-5"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {copied ? "Copied to clipboard!" : "Email"}
              </p>
              <p className="text-sm truncate text-neutral-400">{EMAIL}</p>
            </div>
          </button>

          {/* WhatsApp — fastest response */}
          <a
            href="https://wa.me/+917869905752"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 text-left transition-all duration-300 border rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-mint/50 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-mint/20 to-aqua/20">
              <img
                src="/assets/socials/whatsApp.svg"
                alt="WhatsApp"
                className="w-5 h-5"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">WhatsApp</p>
              <p className="text-sm text-neutral-400">
                Fastest way to reach me
              </p>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/youvraj-singh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 text-left transition-all duration-300 border rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-sky-400/50 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20">
              <img
                src="/assets/socials/linkedIn.svg"
                alt="LinkedIn"
                className="w-5 h-5"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">LinkedIn</p>
              <p className="text-sm text-neutral-400">
                Let's connect professionally
              </p>
            </div>
          </a>

          {/* Resume download */}
          <a
            href="/Youvraj_Singh_CV.pdf"
            download="Youvraj_Singh_CV.pdf"
            className="flex items-center gap-4 p-5 text-left transition-all duration-300 border rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-fuchsia/50 hover:-translate-y-1"
          >
            <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia/20 to-coral/20">
              <img
                src="/assets/download.svg"
                alt="Download resume"
                className="w-5 h-5 brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Resume</p>
              <p className="text-sm text-neutral-400">Download my CV</p>
            </div>
          </a>
        </div>

        {/* Remaining socials, if any beyond the cards above */}
        {mySocials.some(
          (s) => !["WhatsApp", "Linkedin", "Gmail"].includes(s.name),
        ) && (
          <div className="flex gap-3 mt-8">
            {mySocials
              .filter(
                (s) => !["WhatsApp", "Linkedin", "Gmail"].includes(s.name),
              )
              .map((social, index) => (
                <a
                  href={social.href}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 transition-colors border rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <img
                    src={social.icon}
                    className="w-4 h-4"
                    alt={social.name}
                  />
                </a>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;