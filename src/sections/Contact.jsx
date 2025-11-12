import { useState } from "react";
import emailjs from "@emailjs/browser";
import Alert from "../components/Alert";
import { Particles } from "../components/Particles";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlertMessage = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await emailjs.send(
        "service_tdqd4gm",
        "template_cca60wn",
        {
          from_name: formData.name,
          to_name: "Youvraj",
          from_email: formData.email,
          to_email: "youv2002@gmail.com",
          message: formData.message,
        },
        "y5vWKu0Ety6KZECse"
      );
      setIsLoading(false);
      setFormData({ name: "", email: "", message: "" });
      showAlertMessage("success", "Your message has been sent!");
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      showAlertMessage("danger", "Something went wrong!");
    }
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

      {showAlert && <Alert type={alertType} text={alertMessage} />}

      {/* 🔥 Group for focus-within hover glow */}
      <div
        className="group relative flex flex-col items-center justify-center w-full max-w-2xl p-10 mx-auto text-white border border-white/10 rounded-3xl bg-gradient-to-br from-[#01010a]/80 to-[#111827]/80 backdrop-blur-xl 
      shadow-[0_0_50px_-15px_rgba(0,0,0,0.7)] 
      transition-all duration-500 
      hover:shadow-[0_0_80px_-10px_rgba(147,112,255,0.5)] 
      group-focus-within:shadow-[0_0_100px_-15px_rgba(167,139,250,0.7)] 
      group-hover:shadow-[0_0_100px_-15px_rgba(147,112,255,0.7)]"
      >
        {/* Header Section */}
        <div className="flex flex-col items-start w-full gap-6 mb-12 text-left">
          <h2 className="text-5xl font-extrabold md:text-6xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Let’s Connect{" "}
            <span className="bg-none text-transparent-none text-white">🚀</span>
          </h2>
          <p className="text-lg leading-relaxed text-neutral-400">
            I’m all about creating meaningful, well-built web experiences. Drop
            me a message below, and I’ll get back to you soon!
          </p>
        </div>

        {/* Contact Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-semibold text-neutral-300"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-4 py-3 text-base text-white placeholder-neutral-500 bg-[#1a1d29]/70 rounded-xl border border-white/10 transition-all duration-300 
              hover:border-indigo-400 focus:border-indigo-500 
              hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] 
              focus:shadow-[0_0_15px_rgba(99,102,241,0.6)] 
              outline-none"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-4 py-3 text-base text-white placeholder-neutral-500 bg-[#1a1d29]/70 rounded-xl border border-white/10 transition-all duration-300 
              hover:border-indigo-400 focus:border-indigo-500 
              hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] 
              focus:shadow-[0_0_15px_rgba(99,102,241,0.6)] 
              outline-none"
              placeholder="john@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-semibold text-neutral-300"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="w-full px-4 py-3 text-base text-white placeholder-neutral-500 bg-[#1a1d29]/70 rounded-xl border border-white/10 transition-all duration-300 
              hover:border-indigo-400 focus:border-indigo-500 
              hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] 
              focus:shadow-[0_0_15px_rgba(99,102,241,0.6)] 
              outline-none"
              placeholder="Share your thoughts..."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full px-4 py-4 mt-4 text-lg cursor-pointer font-semibold text-white transition-all duration-300 rounded-xl 
  bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 
  hover:opacity-90 hover:scale-[1.02] focus:scale-[1.02] 
  focus:shadow-[0_0_20px_rgba(147,112,255,0.6)] 
  shadow-lg shadow-indigo-500/30"
          >
            {!isLoading ? (
              <>
                Send Message
                <img
                  src="assets/mail.svg"
                  alt="mail icon"
                  className="w-5 h-5 opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </>
            ) : (
              "Sending..."
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
