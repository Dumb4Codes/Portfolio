import { useEffect } from "react";
import { motion } from "motion/react";

const ProjectDetails = ({
  title,
  description,
  subDescription,
  image,
  tags,
  href,
  closeModal,
}) => {
  // Lock background scroll while the modal is open, and allow closing with Escape.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-full p-4 overflow-hidden backdrop-blur-sm"
      onClick={closeModal}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] overflow-y-auto border shadow-sm rounded-2xl bg-gradient-to-l from-midnight to-navy border-white/10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute z-10 p-2 rounded-full top-4 right-4 bg-midnight/90 hover:bg-gray-500 backdrop-blur-sm"
        >
          <img src="assets/close.svg" className="w-5 h-5" alt="" />
        </button>

        <img
          src={image}
          alt={title}
          className="w-full h-48 rounded-t-2xl sm:h-64 object-cover"
        />

        <div className="flex flex-col flex-1 p-5 sm:p-6">
          <h5 className="mb-2 text-2xl font-bold text-white">{title}</h5>
          <p className="mb-3 font-normal text-neutral-400">{description}</p>
          {subDescription.map((subDesc, index) => (
            <p key={index} className="mb-3 font-normal text-neutral-400">
              {subDesc}
            </p>
          ))}

          {/* Tags + CTA — stack on mobile, side-by-side on larger screens,
              so they never collide regardless of tag count or screen width. */}
          <div className="flex flex-col gap-5 pt-4 mt-auto border-t sm:flex-row sm:items-center sm:justify-between border-white/10">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <img
                  key={tag.id}
                  src={tag.path}
                  alt={tag.name}
                  title={tag.name}
                  className="rounded-lg size-9 sm:size-10 hover-animation"
                />
              ))}
            </div>

            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center flex-shrink-0 gap-1 px-4 py-2.5 font-medium text-center rounded-full cursor-pointer bg-white/5 border border-white/10 hover-animation hover:bg-white/10"
              >
                View Project
                <img src="assets/arrow-up.svg" className="size-4" alt="" />
              </a>
            ) : (
              <span className="inline-flex items-center justify-center flex-shrink-0 gap-1 px-4 py-2.5 font-medium text-center rounded-full text-neutral-500 bg-white/5 border border-white/10">
                Link coming soon
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;