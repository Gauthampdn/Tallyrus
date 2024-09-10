import { useState } from "react";

const Terms = () => {
  const [activeSection, setActiveSection] = useState("privacy-policy");

  const handleScroll = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
    setActiveSection(sectionId);
  };

  return (
    <div className="grid grid-cols-3 gap-8 bg-zinc-900 text-white p-8">
      {/* Left Column - Table of Contents */}
      <div className="col-span-1">
        <nav className="space-y-4 sticky top-8">
          <button 
            className={`text-left w-full ${activeSection === "privacy-policy" ? "font-bold" : ""}`} 
            onClick={() => handleScroll("privacy-policy")}
          >
            Privacy Policy
          </button>
          <ul className="ml-4 space-y-2">
            <li>
              <button 
                className={`text-left w-full ${activeSection === "definitions" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("definitions")}
              >
                Definitions
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "data-collection" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("data-collection")}
              >
                Data Collection and Use
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "compliance" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("compliance")}
              >
                Compliance with Laws
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "data-security" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("data-security")}
              >
                Data Security
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "confidentiality" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("confidentiality")}
              >
                Confidentiality
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "data-retention" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("data-retention")}
              >
                Data Retention and Deletion
              </button>
            </li>
          </ul>
          <button 
            className={`text-left w-full ${activeSection === "terms-of-service" ? "font-bold" : ""}`} 
            onClick={() => handleScroll("terms-of-service")}
          >
            Terms of Service
          </button>
          <ul className="ml-4 space-y-2">
            <li>
              <button 
                className={`text-left w-full ${activeSection === "acceptance" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("acceptance")}
              >
                Acceptance of Terms
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "use-of-platform" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("use-of-platform")}
              >
                Use of Platform
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "access-rights" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("access-rights")}
              >
                Access Rights
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "termination" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("termination")}
              >
                Termination
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "limitation" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("limitation")}
              >
                Limitation of Liability
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "indemnification" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("indemnification")}
              >
                Indemnification
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "governing-law" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("governing-law")}
              >
                Governing Law
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "dispute-resolution" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("dispute-resolution")}
              >
                Dispute Resolution
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "amendments" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("amendments")}
              >
                Amendments
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "entire-agreement" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("entire-agreement")}
              >
                Entire Agreement
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "severability" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("severability")}
              >
                Severability
              </button>
            </li>
            <li>
              <button 
                className={`text-left w-full ${activeSection === "assignment" ? "font-bold" : ""}`} 
                onClick={() => handleScroll("assignment")}
              >
                Assignment
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Right Column - Content */}
      <div className="col-span-2 space-y-8">
        <div id="privacy-policy">
          <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
          <p className="mb-6">Welcome to Tallyrus! By accessing or using our platform, you agree to comply with and be bound by the following Privacy Policy and Terms of Service. Please read them carefully.</p>
          
          <div id="definitions">
            <h3 className="text-xl font-semibold mt-8 mb-4">1. Definitions</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data</strong>: Information collected from users as described in this Privacy Policy.</li>
              <li><strong>Personal Data</strong>: Any information relating to an identified or identifiable natural person.</li>
              <li><strong>Confidential Information</strong>: Any non-public information disclosed by one party to the other that is marked as confidential or should reasonably be understood to be confidential.</li>
              <li><strong>Data Controller</strong>: The entity that determines the purposes and means of processing the Data.</li>
              <li><strong>Data Processor</strong>: The entity that processes the Data on behalf of the Data Controller.</li>
            </ul>
          </div>

          <div id="data-collection">
            <h3 className="text-xl font-semibold mt-8 mb-4">2. Data Collection and Use</h3>
            <p>We collect and use data to improve educational outcomes and develop educational tools. This includes but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>User registration information</li>
              <li>Usage data</li>
              <li>Feedback and support queries</li>
            </ul>
          </div>

          <div id="compliance">
            <h3 className="text-xl font-semibold mt-8 mb-4">3. Compliance with Laws</h3>
            <p>We comply with all applicable data protection laws, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Family Educational Rights and Privacy Act (FERPA)</li>
            </ul>
          </div>

          <div id="data-security">
            <h3 className="text-xl font-semibold mt-8 mb-4">4. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your data against unauthorized or unlawful processing and against accidental loss, destruction, or damage. These measures include encryption, access controls, and secure storage.</p>
          </div>

          <div id="confidentiality">
            <h3 className="text-xl font-semibold mt-8 mb-4">5. Confidentiality</h3>
            <p>We keep your data and any related Confidential Information confidential and use it solely for the purposes outlined in this Privacy Policy. Confidentiality obligations do not apply to information that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Becomes public knowledge through no fault of ours</li>
              <li>Is lawfully obtained from a third party without breach of any confidentiality obligation</li>
              <li>Is required to be disclosed by law</li>
            </ul>
          </div>

          <div id="data-retention">
            <h3 className="text-xl font-semibold mt-8 mb-4">6. Data Retention and Deletion</h3>
            <p>We retain your data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. Upon request for deletion, we will permanently delete your specified data without delay, ensuring it is no longer accessible or recoverable from our systems.</p>
          </div>
        </div>

        <div id="terms-of-service">
          <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>

          <div id="acceptance">
            <h3 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h3>
            <p>By accessing or using Tallyrus, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
          </div>

          <div id="use-of-platform">
            <h3 className="text-xl font-semibold mt-8 mb-4">2. Use of Platform</h3>
            <p>You agree to use Tallyrus solely for lawful purposes and in a manner consistent with these Terms of Service.</p>
          </div>

          <div id="access-rights">
            <h3 className="text-xl font-semibold mt-8 mb-4">3. Access Rights</h3>
            <p>You have access to Tallyrus solely for the purposes specified in these terms. Ensure that only authorized personnel have access to your account.</p>
          </div>

          <div id="termination">
            <h3 className="text-xl font-semibold mt-8 mb-4">4. Termination</h3>
            <p>We may terminate your access to Tallyrus at any time for any reason, including but not limited to a breach of these terms. Upon termination, you must cease all use of Tallyrus and comply with our data deletion requirements.</p>
          </div>

          <div id="limitation">
            <h3 className="text-xl font-semibold mt-8 mb-4">5. Limitation of Liability</h3>
            <p>Tallyrus shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform.</p>
          </div>

          <div id="indemnification">
            <h3 className="text-xl font-semibold mt-8 mb-4">6. Indemnification</h3>
            <p>You agree to indemnify, defend, and hold harmless Tallyrus from any claims, damages, or expenses arising out of or related to your breach of these terms.</p>
          </div>

          <div id="governing-law">
            <h3 className="text-xl font-semibold mt-8 mb-4">7. Governing Law</h3>
            <p>These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles.</p>
          </div>

          <div id="dispute-resolution">
            <h3 className="text-xl font-semibold mt-8 mb-4">8. Dispute Resolution</h3>
            <p>Any disputes arising out of or in connection with these terms shall be resolved through mediation, and if mediation fails, through binding arbitration conducted in accordance with the rules of the American Arbitration Association (AAA) in the State of California.</p>
          </div>

          <div id="amendments">
            <h3 className="text-xl font-semibold mt-8 mb-4">9. Amendments</h3>
            <p>These terms may only be amended by a written agreement signed by both parties.</p>
          </div>

          <div id="entire-agreement">
            <h3 className="text-xl font-semibold mt-8 mb-4">10. Entire Agreement</h3>
            <p>These terms constitute the entire agreement between you and Tallyrus with respect to your use of the platform.</p>
          </div>

          <div id="severability">
            <h3 className="text-xl font-semibold mt-8 mb-4">11. Severability</h3>
            <p>If any provision of these terms is found to be invalid or unenforceable, the remainder shall remain in full force and effect.</p>
          </div>

          <div id="assignment">
            <h3 className="text-xl font-semibold mt-8 mb-4">12. Assignment</h3>
            <p>You may not assign or transfer any rights or obligations under these terms without our prior written consent.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
