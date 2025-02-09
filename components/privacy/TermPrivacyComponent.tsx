'use client';

export default function TermsPrivacy() {

  return (
    <div className=" flex items-center justify-center">
      <div className=" p-6 rounded-2xl dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-center text-purple-500">Cloudinator - Terms & Privacy</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-purple-500">Terms and Conditions</h2>
          <p className=" dark:text-gray-300 text-[17px] leading-8 tracking-wide">
            Cloudinator is a cloud deployment platform that allows users to deploy frontend applications, backend services,
            databases, and specifically Spring Microservices. By using our platform, you agree to comply with all applicable
            laws and refrain from any unauthorized, illegal, or abusive activities. Users are responsible for the security
            and legality of their deployments.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-purple-500">Privacy Policy</h2>
          <p className=" dark:text-gray-300 text-[17px] leading-8 tracking-wide">
            Cloudinator values user privacy and collects only the necessary data required for service operation.
            We do not sell, share, or distribute user data to third parties. All personal and deployment-related
            data is securely stored and protected against unauthorized access. Users can request data deletion
            upon account termination.
          </p>
        </section>

    
      </div>
    </div>
  );
}
