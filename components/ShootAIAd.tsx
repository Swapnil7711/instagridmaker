import React from "react";

const ShootAIAd = () => {
  return (
    <div className="absolute top-0 right-0 w-[300px] h-screen bg-[#1A1B23] p-6 overflow-y-auto">
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#FF5F50] to-[#3BCCE1] bg-clip-text text-transparent">
            ShootAIPhoto
          </h3>
          <p className="text-gray-400 mt-2">AI-Powered Photo Generation</p>
        </div>

        {/* 2 Easy Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-[#0B0B14] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00BCD4] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h5 className="text-white font-semibold">Upload Photos</h5>
            </div>
            <p className="text-gray-400 text-sm">
              Upload your photos to build an AI model that captures your look
              and features.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0B0B14] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00BCD4] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h5 className="text-white font-semibold">Generate Photos</h5>
            </div>
            <p className="text-gray-400 text-sm">
              Use text prompts (or pick a theme) to create AI photos from the
              trained model.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex-grow space-y-6">
          {/* Feature 1 */}
          <div className="bg-[#0B0B14] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-[#FF7043]">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H15M12 3C8.13401 3 5 6.13401 5 10C5 12.7614 6.67893 15.1175 9.12751 16.1214C9.68334 16.3454 10 16.8927 10 17.5V17.5C10 18.3284 10.6716 19 11.5 19H12.5C13.3284 19 14 18.3284 14 17.5V17.5C14 16.8927 14.3167 16.3454 14.8725 16.1214C17.3211 15.1175 19 12.7614 19 10C19 6.13401 15.866 3 12 3Z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold">
                AI Influencer Creation
              </h4>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Create your AI persona for social media and monetize through brand
              partnerships.
            </p>
          </div>

          {/* <div className="bg-[#0B0B14] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-[#FF4081]">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold">Social Media Growth</h4>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Generate scroll-stopping profile pictures and consistent branding
              images.
            </p>
          </div>

          <div className="bg-[#0B0B14] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-[#FFB300]">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6L6 3M21 6L18 3M21 18L18 21M3 18L6 21" />
                  <path d="M12 8V16M8 12H16" />
                </svg>
              </div>
              <h4 className="text-white font-semibold">Modeling Portfolio</h4>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Build a diverse modeling portfolio with different styles and
              settings.
            </p>
          </div> */}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="bg-[#E91E63] text-white px-6 py-3 rounded-lg hover:bg-[#D81B60] transition-colors w-full">
            Try ShootAIPhoto Now
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Create stunning AI photos in minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShootAIAd;
