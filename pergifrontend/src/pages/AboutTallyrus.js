import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import './AnimatedLines.css';

const AboutTallyrus = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const Header = () => {
    return (
      <header className="py-4 mt-2 rounded-3xl fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="container mx-auto flex items-center justify-between">
          <div className='flex'>
            <img src="/tallyrus2white.png" alt="Tally Illustration" className="m-0.5 mr-2 w-5 h-5" />
            <div className="text-xl font-bold">Tallyrus</div>
          </div>

          <div>
            <Button
              className="ml-4 text-white px-4 py-2 rounded-md hover:bg-green-400"
              onClick={() => navigate('/app')} // Navigate to root path on click
            >
              Go To App
            </Button>
          </div>
        </div>
      </header>
    );
  };

  const colors = ['#F5B700', '#DC0073', '#008BF8', '#04E762'];

  const getRandom = (min, max) => Math.random() * (max - min) + min;

  const AnimatedLines = () => {
    const containerRef = useRef(null);

    useEffect(() => {
      const container = containerRef.current;

      const createLine = () => {
        const line = document.createElement('div');
        line.className = 'line';
        const angle = Math.random() * 360;
        const width = getRandom(20, 35);
        const height = getRandom(1, 2.5);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = getRandom(20, 30);
        line.style.width = `${width}px`;
        line.style.height = `${height}px`;
        line.style.backgroundColor = color;
        line.style.setProperty('--angle', `${angle}deg`);
        line.style.animationDuration = `${duration}s`;

        container.appendChild(line);

        setTimeout(() => {
          container.removeChild(line);
        }, duration * 1000); // Remove the line after its animation duration
      };

      for (let i = 0; i < 30; i++) {
        createLine();
      }
      // Create new lines at regular intervals
      const intervalId = setInterval(() => {
        createLine();
      }, 250); // Adjust the interval as needed

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }, []);

    return <div className="lines-container" ref={containerRef}></div>;
  };

  const Hero = () => {
    return (
      <div className="relative py-16 mb-48 fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <div className="flex justify-center space-x-4 mb-6">
            <img src="/tallyrus2green.png" className="w-[80px]" />
          </div>
          <div className="w-full ">
            <h1 className="text-6xl font-extrabold mb-6">The AI-Powered <br /> Essay Grader.</h1>
            <h1 className="text-xl font-semibold mb-6 text-gray-500">
              Tallyrus 2.0 -  saving teachers time and providing more in-depth feedback
            </h1>
            <div className="flex justify-center gap-4">
              {/* <Button
                className="ml-4 text-white px-4 py-2 rounded-md bg-green-600 hover:bg-green-800"
                onClick={() => navigate('/')} // Navigate to root path on click
              >
                Go To App →
              </Button>  */}
              <a href="https://docs.google.com/forms/d/1u6flS76PDzomzjtAG1S_AI5Mh8RDi5JoP4EnZFCelFI/edit" target="_blank" rel="noopener noreferrer">
                <Button className="text-white bg-blue-600 hover:bg-blue-800 mr-4">Join Our Team!</Button>
              </a>
            </div>
          </div>
          <div className='p-10'>
            <button onClick={() => navigate('/login')} className="flex items-center border-[1px] border-white rounded-lg px-8 py-2 bg-transparent hover:bg-gray-200 hover:text-black">
              <img src="/tryme.gif" alt="Image" className="w-20 h-20 mr-5" />
              <div className=''>
                <h1 className='text-md font-semibold'>Tallyrus 2.0 → </h1>
                <h1 className='text-xs font-normal'> Try our live app!</h1>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FeaturesSection = () => {
    const features = [
      {
        title: "AI-Powered Grading",
        description: "Utilize cutting-edge AI technology for quick and accurate assessments. Our AI-powered grading system is designed to understand the nuances of your rubric, ensuring that every submission is evaluated fairly and thoroughly.",
        icon: "check_circle",
        hoverColor: "bg-blue-600",
      },
      {
        title: "Personalized Feedback",
        description: "Every student receives detailed, constructive feedback tailored to their specific needs. Our platform analyzes each submission to provide personalized insights, helping students understand their strengths and areas for improvement.",
        icon: "precision_manufacturing",
        hoverColor: "bg-yellow-800",
      },
      {
        title: "Classroom Management",
        description: "Streamline your classroom operations with our comprehensive management tools. Assign essays, track submissions, and communicate with students efficiently. Our platform is designed to make classroom management seamless and intuitive.",
        icon: "school",
        hoverColor: "bg-slate-600",
      },
      {
        title: "Bias-Free Assessment",
        description: "Our commitment to fairness is reflected in our bias-free assessment feature. By leveraging objective AI analysis, we ensure that every student is evaluated based on their work, free from unconscious bias.",
        icon: "extension_off",
        hoverColor: "bg-green-600",
      },
    ];

    return (
      <div className="py-16 fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">About</h1>
          <h1 className="text-xl font-semibold text-center mb-20 text-gray-500"> Here's how Tallyrus works to save both <br /> teachers and students' time</h1>
          <div className="grid grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="w-full cursor-pointer transition-transform duration-200 ease-in-out overflow-hidden rounded-xl hover:scale-105" style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
                <div className={`w-full h-full p-2 transition-transform duration-200 ease-in-out ${feature.hoverColor} text-white`}>
                  <div className="p-4">
                    <h2 className="text-xl font-bold">{feature.title}</h2>
                  </div>
                  <div className="p-4">
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Time = () => {
    const items = [
      {
        number: "400+",
        title: "Essays Graded",
        details: [
          "How to present designs",
          "Using AI tools for design",
          "Balancing composition",
          "Creating color palettes",
        ],
      },
      {
        number: "63+",
        title: "Hours Optimized",
        details: [
          "Config poster breakdown",
          "Prompt engineering",
          "Motion design with Lottie",
          "Intro to type design",
        ],
      },
      {
        number: "20+",
        title: "Teachers using Tallyrus",
        details: [
          "Spatial UI",
          "Making a statement",
          "All about the footer",
          "Design a VEST platform",
        ],
      },
    ];

    return (
      <div className="py-16 fade-in" style={{ animationDelay: '1.6s' }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-20"> Benefits of Using <br /> Tallyrus in the classroom</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <h1 className="text-8xl font-bold mb-2">{item.number}</h1>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const InfoSection = ({ title, content, imageSrc, imageAlt, reverse }) => {
    return (
      <div className={`container mx-auto flex flex-col md:flex-row items-center justify-between fade-in ${reverse ? 'md:flex-row-reverse' : ''}`} style={{ animationDelay: '2.0s' }}>
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
          <InfoSection
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

  return (
    <div className='pt-2 bg-gray-950 text-white'>
      <AnimatedLines />
      <div className='px-40'>
        <Header />
        <Hero />
        <FeaturesSection />
        <Time />
        <AdditionalSections />
      </div>
    </div>
  );
};

export default AboutTallyrus;
