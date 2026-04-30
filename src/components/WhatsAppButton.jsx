import React from 'react';

export default function WhatsAppButton() {
  const phoneNumber = '0794023480';
  const message = 'Hello!';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="currentColor">
        <path d="M16.004 0h-.008C7.164 0 0 7.163 0 16c0 3.5 1.131 6.742 3.047 9.382L1.4 31.647l6.472-1.696A15.9 15.9 0 0016.004 32C24.836 32 32 24.838 32 16S24.836 0 16.004 0zm9.336 22.594c-.39 1.1-1.93 2.014-3.174 2.279-.852.18-1.964.324-5.71-1.228-4.792-1.986-7.874-6.83-8.112-7.148-.228-.318-1.922-2.56-1.922-4.88 0-2.32 1.214-3.46 1.644-3.934.39-.4281.924-.624 1.234-.624.15 0 .284.008.404.014.428.018.642.044.924.714.354.842 1.218 2.968 1.324 3.184.108.218.218.508.072.798-.136.298-.256.432-.474.684-.218.254-.428.446-.646.726-.198.24-.42.496-.18.924.24.428 1.064 1.762 2.286 2.848 1.572 1.4 2.894 1.834 3.308 2.04.428.18.678.152.924-.108.254-.272 1.072-1.252 1.358-1.68.282-.428.57-.354.958-.218.394.142 2.486 1.174 2.912 1.388.428.218.714.324.82.508.108.18.108 1.04-.282 2.14z" />
      </svg>
    </a>
  );
}
