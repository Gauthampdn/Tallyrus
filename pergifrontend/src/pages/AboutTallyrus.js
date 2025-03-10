import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import './AnimatedLines.css';
import './backgroundColor.css';
import { SizeIcon } from '@radix-ui/react-icons';
import { useState } from "react";
import emailjs from "@emailjs/browser";



const AboutTallyrus = () => {
  const navigate = useNavigate(); // Initialize the navigate function


  // Gradient colors of the background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY; // Position of the scroll
      const scrollHeight = document.documentElement.scrollHeight; // Total height of the page
      const windowHeight = window.innerHeight; // Total visible height of the page
      const scrollFraction = scrollY / (scrollHeight - windowHeight); // Part displaced of the page
    
      // Colors
      const startColor = "#ffffff"; // black
      const endColor = "#ffffff"; // dark navy
    
      // We put the gradient
      const backgroundDiv = document.getElementById("page-background");
      if (backgroundDiv) {
        backgroundDiv.style.background = `linear-gradient(to bottom, ${startColor}, ${endColor})`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 


  // Color of the lines in the animation background
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


  const Header = () => {
    return (
      <>
        <header className="py-4 mt-2 rounded-3xl fade-in w-3/5 h-20 mx-auto" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center space-x-5 bg-gray-100 h-10 rounded-md">
            <div className='flex items-center text-black text-sm'>
              <a href="/AboutTallyrus">
                Home
              </a>
            </div>

            <div className='flex items-center text-gray-700 text-sm'>
              <a href="/About_us">
                About us
              </a>
            </div>

            <div className='flex items-center text-gray-700 text-sm'>
              <a href="/AboutTallyrus">
                How it works
              </a>
            </div>

            <div className='flex items-center text-gray-700 text-sm'>
              <a href="/payment">
                Services
              </a>
            </div>
          </div>
        </header>
      </>
    );
  };

  const Hero = () => {
    return (
      <div className="relative py-16 mb-48 mt-28 fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <div className="flex justify-center space-x-4 mb-6">
            <img src="/tallyrus2green.png" className="w-[80px]" />
          </div>
          <div className="w-full ">
            <h1 className="text-6xl font-extrabold mb-6 text-black">The AI-Powered <br /> Essay Grader </h1>
            <h1 className="text-xl font-semibold mb-6 text-gray-700">
              Tallyrus 2.0 - Efficient grading, deeper feedback, more teaching time.
            </h1>
            
          </div>
          <div className='p-10'>
            <button onClick={() => navigate('/login')} className="flex items-center border-[1px] border-black rounded-lg px-8 py-2 bg-transparent hover:bg-gray-200 hover:text-black">
              <img src="/tryme.gif" alt="Image" className="w-20 h-20 mr-5" />
              <div className=''>
                <h1 className='text-md font-semibold text-black'>Tallyrus 2.0 → </h1>
                <h1 className='text-xs font-normal text-black'> Try our live app!</h1>
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
        hoverColor: "bg-blue-600",
      },
      {
        title: "Personalized Feedback",
        description: "Every student receives detailed, constructive feedback tailored to their specific needs. Our platform analyzes each submission to provide personalized insights, helping students understand their strengths and areas for improvement.",
        
        hoverColor: "bg-yellow-800",
      },
      {
        title: "Classroom Management",
        description: "Streamline your classroom operations with our comprehensive management tools. Assign essays, track submissions, and communicate with students efficiently. Our platform is designed to make classroom management seamless and intuitive.",
        
        hoverColor: "bg-slate-600",
      },
      {
        title: "Bias-Free Assessment",
        description: "Our commitment to fairness is reflected in our bias-free assessment feature. By leveraging objective AI analysis, we ensure that every student is evaluated based on their work, free from unconscious bias.",
        
        hoverColor: "bg-[#937FA3]",
      },
    ];

    return (
      <div className="py-16 fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="bg-green-700 w-screen py-20 px-40 relative fixed justify-center -left-40">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">About us</h1>
          <h1 className="text-xl font-semibold text-center mb-20 text-gray-200"> Here's how Tallyrus works to save both <br /> teachers and students' time</h1>
          <div className="grid grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="w-full cursor-pointer transition-transform duration-200 ease-in-out overflow-hidden rounded-xl hover:scale-105" style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
                <div className={`w-full h-full p-2 transition-transform duration-200 ease-in-out ${feature.hoverColor} text-white text-sm rounded-lg`}>
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
        <div className="py-20 max-w-90 max-h-90">
          <img src="/About_us_light.png" />
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
      <div className="bg-green-700 w-screen py-40 px-40 relative fixed justify-center -left-40 mb-40">
        <div className="relative mx-auto px-4 text-center -top-10">
          <h1 className="text-4xl font-bold mb-20 text-white"> Benefits of Using <br /> Tallyrus in the classroom</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-white">
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
      <div className={`container mx-auto flex flex-col mb-20 mt-20 md:flex-row items-center justify-between fade-in ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-black">{title}</h2>
          <p className="text-lg text-gray-700">{content}</p>
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
        title: "More About Us",
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

  const Prices = () => {
    return ( 
      <div className="bg-green-700 mb-20 mt-40 w-screen py-20 px-40 relative justify-center -left-40">
        <div className="text-6xl font-bold text-white left-52 top-24 relative">
          Prices
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-30 mb-20 fade-in relative left-10 top-10">
          <div>
            {/* Plan Gratis */}
            <div className="bg-gray-200 text-black p-5 rounded-lg shadow-lg w-80 mt-8 md-auto top-28 relative">
              <h2 className="text-3xl font-bold text-black">Free</h2>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center"><span className="mr-2">✔️</span>Limited Grading</li>
                <li className="flex items-center"><span className="mr-2">✔️</span>Limited Assignments</li>
              </ul>
              <Button 
                  className="w-full mt-6 bg-white text-black font-bold py-2 rounded hover:bg-white"
                  onClick={() => navigate('/App')} 
                >
                  TRY NOW
              </Button> 
            </div>
          </div>
        
          

          {/* Plan Pro */}
          <div className="bg-white text-green-700 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-4xl font-extrabold">Tallyrus Pro</h2>
            <p className="text-gray-600 mt-2">Upgrade to Tallyrus Pro and unlock powerful features.</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center"><span className="mr-2">✔️</span>Unlimited Grading</li>
              <li className="flex items-center"><span className="mr-2">✔️</span>Unlimited Assignments</li>
              <li className="flex items-center"><span className="mr-2">✔️</span>Connect to Ed Tech tools</li>
              <li className="flex items-center"><span className="mr-2">✔️</span>AI - Writing Detection</li>
            </ul>
            <div className="mt-8 h-20 bg-green-600 text-white rounded-lg button-center text-2xl font-bold">
            <Button 
                  className="w-full h-full bg-green-600 text-white font-bold text-center text-2xl py-2 rounded-lg hover:bg-transparent"
                  onClick={() => navigate('/Payment')} 
                >
                  $12.00 <span className="text-gray-300 text-lg">/mo</span>
              </Button> 
            </div>
          </div>
        </div>
      </div>
      
    );
  };

  const QyA = () => {
    // States to controll if a question is open or closed
    const [openIndex, setOpenIndex] = useState(null);

    // Q&A
    const sections = [
      {
        question: "How can I contact Tallyrus?",
        answer: "You can reach us through our contact form on our website or by emailing us at tallyrus@gmail.com We typically respond within 24 hours."
      },
      {
        question: "What if I already have Rubrics I have made?",
        answer: "If you have already created your own rubrics, you can submit them directly through our contact form or by email. We will review them and incorporate them into the grading process."
      },
      {
        question: "How long does it take to grade the essays?",
        answer: "The grading process typically takes between <strong>48 to 72 hours</strong>, depending on the number of essays to grade."
      },
      {
        question: "Do you require a deposit for projects?",
        answer: "Yes, we do require a deposit before starting any project. The deposit amount will depend on the scope and complexity of the project. Please contact us for more details."
      }
    ];
    // open/close
    const toggleSection = (index) => {
      setOpenIndex(openIndex === index ? null : index); 
    };

    return(
      <div className="flex justify-center p-8 fade-in mt-40">
        <div className="flex flex-col md:flex-row items-start justify-start max-w-6xl w-full mx-auto gap-16 mb-20 mt-20">
          {/* Title */}
          <h1 className="text-5xl font-extrabold text-black mt-20"> 
            Frequently <br /> Asked <br /> Questions 
          </h1>

          {/* Questions */}
          <div className="flex flex-col w-full md:w-[700px] ml-40">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white w-full shadow-lg rounded-lg p-6 transition-all duration-300 mb-4 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSection(index)}
              >
                {/* Answers */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-black">{section.question}</h2>
                  <span className="text-gray-900 text-lg">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>

                {/* Respuesta (solo si está abierta) */}
                {openIndex === index && (
                  <p className="mt-4 text-gray-600 text-base" dangerouslySetInnerHTML={{ __html: section.answer }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    );
  };



  const Contact = () => {
    const [from_name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [from_email, setEmail] = useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault(); // Evita que la página se recargue
  
      const templateParams = {
        from_name,
        from_email,
        message,
      };
  
      emailjs
        .send(
          "service_wu86g4o", // Service ID
          "template_e47c32m", // Template ID
          templateParams,
          "YKTVhqZYkNfiWIzmz" // Public Key
        )
        .then((response) => {
          console.log("Email sent successfully", response);
          alert("Email sent successfully");
        })
        .catch((error) => {
          console.error("Error: we couldn't process your request, try again later", error);
          alert("Error: we couldn't process your request, try again later");
        });
  
        // Configuración de la respuesta automática al usuario
    const autoResponseParams = {
      to_email: from_email,    // Correo del remitente
      from_name: from_name,    // Nombre del remitente
      message: message,        // El mensaje que envió
    };

    // Enviar la respuesta automática
    emailjs
      .send(
        'service_wu86g4o',   // ID del servicio
        'template_vjliyje',  // ID de la plantilla de respuesta automática
        autoResponseParams,   // Parámetros para la respuesta automática
        'YKTVhqZYkNfiWIzmz'   // Clave pública
      )
      .then((response) => {
        console.log('Automatic response sent', response);
      })
      .catch((error) => {
        console.error('Error: we couldn\'t send the automatic response', error);
      });


      // reset after sending
      setEmail("");
      setName("");
      setMessage("");
    };
  
    return (
      <div className="bg-green-700 mt-40 w-screen py-10 px-40 relative justify-center -left-40">
        <div className="flex flex-col md:flex-row justify-between items-start">
          {/* Sección Izquierda */}
          <div className="max-w-lg">
            <div className="relative top-5 -left-12 mb-32">
              <img src="/tallyrus2white.png" className="w-10" alt="Tallyrus" />
              <div className="text-2xl font-extrabold text-white relative">
                Tallyrus
              </div>
            </div>
  
            <div className="text-l text-white relative -top-16 -left-12 mb-32">
              Transform grading from a time-consuming task <br />
              into a seamless, AI-powered process with <br />
              Tallyrus
            </div>
  
            <p className="relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <a
                href="https://docs.google.com/forms/d/1u6flS76PDzomzjtAG1S_AI5Mh8RDi5JoP4EnZFCelFI/edit"
                className="text-white text-sm hover:underline"
              >
                Join Our Team!
              </a>
            </p>
  
            <div className="text-white relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <span className="text-l">Email:</span>
              <span className="text-sm">tallyrus@gmail.com</span>
            </div>
  
            <div className="text-l text-white relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-4 mt-3 items-center max-w-lg">
              Social:
              <div className="flex flex-row gap-4">
                <a href="https://www.instagram.com/tallyrus.official/">
                  <img
                    src="/instagram.svg"
                    alt="Instagram"
                    className="w-6 h-6 hover:opacity-80 invert"
                  />
                </a>
  
                <a href="https://www.tiktok.com/@tallyrus.ai">
                  <img
                    src="/tiktok.svg"
                    alt="TikTok"
                    className="w-6 h-6 hover:opacity-80 invert"
                  />
                </a>
              </div>
            </div>
          </div>
  
          {/* Formulario */}
          <div className="mt-10 ml-auto fade-in bg-transparent">
            <h1 className="text-3xl font-extrabold text-white mx-20">
              Let us know if you have any questions!
            </h1>
  
            <form onSubmit={handleSubmit} className="mt-5 ml-20">
              <div>
                <label className="block font-medium mt-7 text-white">Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-[700px] p-2 border rounded mt-2 mb-3 bg-white text-black"
                  value={from_email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
  
              <div>
                <label className="block font-medium text-white">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-[700px] p-2 border rounded mt-1 mb-3 bg-white text-black"
                  value={from_name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
  
              <div>
                <label className="block font-medium text-white">Message</label>
                <textarea
                  placeholder="Write your message..."
                  className="w-[700px] h-40 p-2 border rounded mt-1 mb-3 bg-white text-black"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
  
              <button
                type="submit"
                className="bg-blue-800 text-white text-center font-semibold py-3 px-10 rounded-lg hover:bg-blue-600 transition mx-auto block mb-10 mt-10"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  
  return (
    <div id="page-background" className="min-h-screen w-full h-full bg-white">
      <handleScroll />
      <div className='px-40'>
        {/*<AnimatedLines />*/}
        {/*<Header />*/}
        <Hero />
        <FeaturesSection />
        <Time />
        <AdditionalSections />
        <Prices />
        <QyA />
        <Contact />
      </div>
    </div>
  );
};


export default AboutTallyrus;
