// Import React and Tailwind CSS components
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';


const gradientStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '300px',
  background: 'linear-gradient(to right, #058C42, #16db65)',
  transform: 'skewY(-3deg)',
  transformOrigin: 'top left',
  bottom: '-280px',
};

const Header = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <header className="bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="text-xl font-bold">Tallyrus</div>
        <nav>
          {/* Navigation could be uncommented and used here */}
        </nav>
        <div>
        <Button
            className="ml-4 text-white px-4 py-2 rounded-md hover:bg-white-700"
            onClick={() => navigate('/')} // Navigate to root path on click
          >
            Go To App
          </Button>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <div className="relative bg-white py-16 mb-96">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2">
          <h1 className="text-5xl font-bold mb-6">Welcome to Tallyrus</h1>
          <p className="text-lg mb-6">Stripe Apps lets you embed custom user experiences directly in the Stripe Dashboard and orchestrate the Stripe API. Create an app to streamline operations just for your team or for the more than one million businesses using Stripe.</p>
          <div className="flex">
            <a href="https://docs.google.com/forms/d/1u6flS76PDzomzjtAG1S_AI5Mh8RDi5JoP4EnZFCelFI/edit" target="_blank" rel="noopener noreferrer">
              <Button className="text-white hover:underline mr-4">Join Our Team</Button>
            </a>
          </div>
        </div>
        <div className="md:w-1/2">
          <img src="/tallyrus2.png" alt="Tally Illustration" className="rounded-3xl" />
        </div>
      </div>
      <div style={gradientStyle}></div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: "AI-Powered Grading",
      description: "Utilize cutting-edge AI technology for quick and accurate assessments. Our AI-powered grading system is designed to understand the nuances of your rubric, ensuring that every submission is evaluated fairly and thoroughly.",
      icon: "check_circle",
      hoverColor: "bg-blue-500",
    },
    {
      title: "Personalized Feedback",
      description: "Every student receives detailed, constructive feedback tailored to their specific needs. Our platform analyzes each submission to provide personalized insights, helping students understand their strengths and areas for improvement.",
      icon: "precision_manufacturing",
      hoverColor: "bg-yellow-700",
    },
    {
      title: "Classroom Management",
      description: "Streamline your classroom operations with our comprehensive management tools. Assign essays, track submissions, and communicate with students efficiently. Our platform is designed to make classroom management seamless and intuitive.",
      icon: "school",
      hoverColor: "bg-red-500",
    },
    {
      title: "Bias-Free Assessment",
      description: "Our commitment to fairness is reflected in our bias-free assessment feature. By leveraging objective AI analysis, we ensure that every student is evaluated based on their work, free from unconscious bias.",
      icon: "extension_off",
      hoverColor: "bg-green-500",
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-10">Tallyrus Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`w-full cursor-pointer overflow-hidden`}>
              <Card className={`w-full h-full bg-white hover:${feature.hoverColor} hover:text-white`}>
                <CardHeader>
                  <span className="material-symbols-outlined text-xl">
                    {feature.icon}
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// InfoSection component for additional content sections
const InfoSection = ({ title, content, imageSrc, imageAlt, reverse }) => {
  return (
    <div className={`container mx-auto flex flex-col md:flex-row items-center justify-between py-16 mb-16 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className="md:w-1/2">
        <h2 className="text-4xl font-bold mb-6">{title}</h2>
        <p className="text-lg">{content}</p>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img src={imageSrc} alt={imageAlt} className="rounded-3xl max-w-md" />
      </div>
    </div>
  );
};

const AdditionalSections = () => {
  // Sample sections array, replace imageSrc with actual paths
  const sections = [
    {
      title: "Benefits for Teachers",
      content: "Tallyrus empowers educators by: Reducing grading time, allowing for more direct student interaction. Providing consistent and personalized feedback. Streamlining classroom management tasks.",
      imageSrc: "/teacherup.png",
      imageAlt: "Benefits for Teachers",
      reverse: false,
    },
    {
      title: "Benefits for Students",
      content: "Students receive timely, detailed feedback on their essays, promoting better understanding and growth. Our unbiased approach ensures every student is evaluated fairly, helping to support a more inclusive learning environment.",
      imageSrc: "/studentmed.png",
      imageAlt: "Benefits for Students",
      reverse: true,
    },
    {
      title: "About Us",
      content: "Tallyrus was founded by educators and technologists passionate about improving the educational experience. Our AI-powered tool is designed to address the challenges of essay grading, making the process quicker, more accurate, and unbiased.",
      imageSrc: "/desk.png",
      imageAlt: "About Us",
      reverse: false,
    },
    {
      title: "Pricing",
      content: "Tallyrus offers flexible pricing plans tailored to meet the needs of individual educators, schools, and districts. Experience the benefits with our trial version, and choose the plan that best supports your educational goals.",
      imageSrc: "/money.png",
      imageAlt: "Pricing",
      reverse: true,
    },
  ];

  return (
    <div>
      {sections.map((section, index) => (
        <InfoSection className="mb-96"
          key={index}
          title={section.title}
          content={section.content}
          imageSrc={section.imageSrc}
          imageAlt={section.imageAlt}
          reverse={section.reverse}
        />
      ))}
    </div>
  );
};

const AboutTallyrus = () => {
  return (
    <div>
      <Header />
      <Hero />
      <FeaturesSection />
      <AdditionalSections />
    </div>
  );
};

export default AboutTallyrus;
