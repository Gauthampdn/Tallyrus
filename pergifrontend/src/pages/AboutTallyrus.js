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
      <div className="flex justify-between items-center text-xl font-serif mx-10 bg-transparent">
        <div className="flex justify-start text-xl font-serif mx-20 mt-10">
          Tallyrus
        </div>

        <div className='flex justify-end pr-10 mt-10 '>
          <div className='flex mr-5 text-gray-900 text-sm'>
            <a href="/About_us">
              About us
            </a>  
          </div>

          <div className='flex text-gray-900 text-sm'>
            <a href="/payment">
              Services
            </a>
          </div>
        </div>
      </div>
    );
  };

  const Hero = () => {
    return (
      <div className="relative py-16 mb-32 fade-in bg-transparent" style={{ animationDelay: '0.4s' }}>
        <div className="mx-auto flex justify-between items-center ">
          <div className="w-full text-left justify-start mx-14">
            <h1 className="text-6xl font-serif font-extrabold mb-6 text-[#231c15]">Revolutionizing Essay Grading with AI </h1>
            <h1 className="text-xl font-serif mb-2 text-[#231c15]">
              At Tallyrus 2.0, we're transforming education by streamlining the grading process with AI-powered feedback. 
              Our mission is to give educators more time to teach, while students receive personalized and actionable 
              insights to improve their writing.
            </h1>

            <div className='p-16'>
              <button onClick={() => navigate('/login')} className="flex items-center rounded-full left-8 px-10 py-4 bg-[#231c15] hover:bg-gray-200 hover:text-black">
                <div className=''>
                  <h1 className='text-m font-normal text-[#bb9d7a] '> Try our live app!</h1>
                </div>
              </button>
            </div>
            
          </div>
          
          <div className="flex justify-end pr-24 space-x-4 mb-6">
            {/*<img src="/tallyrus2green.png" className="w-[80px]" />*/}
            <img src="/landing_page_img.png" 
            style={{ 
              height: '80vh',  // 80% del alto de la pantalla
              maxHeight: '800px',  // Máximo 800px de altura
              width: '60vh',   // Mantener proporciones
              maxWidth: '800px',
              objectFit: 'cover'  // Recortar si es necesario
            }}  />
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
        
      },
      {
        title: "Personalized Feedback",
        description: "Every student receives detailed, constructive feedback tailored to their specific needs. Our platform analyzes each submission to provide personalized insights, helping students understand their strengths and areas for improvement.",
        
      },
      {
        title: "Classroom Management",
        description: "Streamline your classroom operations with our comprehensive management tools. Assign essays, track submissions, and communicate with students efficiently. Our platform is designed to make classroom management seamless and intuitive.",
        
      },
      {
        title: "Bias-Free Assessment",
        description: "Our commitment to fairness is reflected in our bias-free assessment feature. By leveraging objective AI analysis, we ensure that every student is evaluated based on their work, free from unconscious bias.",
        
      },
    ];

    return (
      <div className="py-16 fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="bg-transparent w-screen px-40 relative fixed justify-center mt-20 mb-32">
          {/* Title */}
          <h1 className="text-6xl font-bold text-start mb-10 text-[#46392b]">About us</h1>
          
          <div className="grid grid-cols-2 gap-10 relative mt-20 text-start">
            {features.map((feature, index) => (
              <div key={index} >
                <div className={`w-full h-full p-2 transition-transform duration-200 ease-in-out ${feature.hoverColor} text-white text-sm rounded-lg`}>
                  <div className="p-4">
                    <h2 className="text-2xl text-[#46392b] font-serif font-semibold">{feature.title}</h2>
                  </div>
                  <div className="p-4 text-l text-[#46392b] font-serif ">
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/*<div className="py-20 max-w-90 max-h-90">
          <img src="/About_us_light.png" />
        </div>*/}
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
      <div className="bg-transparent w-screen py-40 relative fixed justify-center mb-20">
        <div className="relative mx-auto px-4 text-center -top-10">
          <h1 className="text-4xl font-serif font-bold mb-20 text-[#46392b]"> Benefits of Using <br /> Tallyrus in the classroom</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-[#46392b] font-serif">
                <h1 className="text-8xl font-bold mb-2">{item.number}</h1>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 mx-8 mt-40">
          <img src="/landing_page_2.png" alt="Image 1" 
                style={{ 
                  height: '60vh',  // 80% del alto de la pantalla
                  maxHeight: '800px',  // Máximo 800px de altura
                  width: '50vh',   // Mantener proporciones
                  maxWidth: '800px',
                  objectFit: 'cover',  // Recortar si es necesario
                  
                }}  
          />

          <img src="/landing_page_6.jpg" alt="Image 2" 
                style={{ 
                  height: '60vh',  // 80% del alto de la pantalla
                  maxHeight: '800px',  // Máximo 800px de altura
                  width: '60vh',   // Mantener proporciones
                  maxWidth: '800px',
                  objectFit: 'cover',  // Recortar si es necesario
                  
                }} 
          />
          
          <img src="/landing_page_5.jpg" alt="Image 3" 
                style={{ 
                  height: '60vh',  // 80% del alto de la pantalla
                  maxHeight: '800px',  // Máximo 800px de altura
                  width: '50vh',   // Mantener proporciones
                  maxWidth: '800px',
                  objectFit: 'cover',  // Recortar si es necesario
                  marginLeft: '20px',
                  
                }}  
          />

        </div>
            
      </div>
    );
  };

  const InfoSection = ({ title, content, imageSrc, imageAlt, reverse }) => {
    return (
      <div className={`container mx-auto flex flex-col mb-20 mt-20 md:flex-row items-center justify-between fade-in ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-serif font-bold mb-6 text-[#46392b]">{title}</h2>
          <p className="text-lg font-serif text-[#46392b]">{content}</p>
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
      <div className="flex justify-center p-8 fade-in mt-20 mb-32 py-32">
        <div className="flex flex-col md:flex-row items-start justify-start max-w-6xl w-full mx-auto gap-16 mb-20 mt-20">
          {/* Title */}
          <h1 className="text-5xl font-serif font-extrabold text-[#46392b] mt-20"> 
            FAQ 
          </h1>

          {/* block */}
          <div className="flex flex-col w-full md:w-[700px] ml-40">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-[#bb9d7a] w-full shadow-lg rounded-lg p-6 transition-all duration-300 mb-4 cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                {/* questions */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif font-bold text-[#46392b]">{section.question}</h2>
                  <span className="text-gray-900 text-lg">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>

                {/* Answers (only if open) */}
                {openIndex === index && (
                  <p className="mt-4 text-[#46392b] font-serif text-base" dangerouslySetInnerHTML={{ __html: section.answer }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    );
  };


  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

  const verifyEmailExists = async (email) => {
      const API_KEY = "TU_API_KEY";
      const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${API_KEY}`;

      try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.data.status === "valid") {
              return true; // El email existe y es válido
          } else {
              return false; // El email no es válido o no existe
          }
      } catch (error) {
          console.error("Error verifying email:", error);
          return false;
      }
  };


  const Contact = () => {
    const [from_name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [from_email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault(); // Evita que la página se recargue
  
      if (!validateEmail(from_email)) {
        setEmailError(true);  // Marcar el campo en rojo si el email es inválido
        alert("Please enter a valid email address.");
        return;
      }

      const isValidEmail = await verifyEmailExists(from_email);
        if (!isValidEmail) {
          setEmailError(true);  // Marcar el campo en rojo si el email no existe
          alert("The email address does not exist. Please enter a valid one.");
          return;
        }

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
      setEmailError(false);  // Restablecer el error después de enviar
    };
  
    return (
      <div className="bg-transparent w-screen py-20 px-40 relative justify-center ">
        <div className="flex flex-col md:flex-row justify-between items-start mt-10">
          {/* Sección Izquierda */}
          <div className="max-w-lg">
            <div className="relative top-5 -left-12 mb-32">
              <img src="/tallyrus2white.png" className="w-10" alt="Tallyrus" />
              <div className="text-2xl font-serif font-extrabold text-[#46392b] relative">
                Tallyrus
              </div>
            </div>
  
            <div className="text-l text-[#46392b] font-serif relative -top-16 -left-12 mb-32">
              Transform grading from a time-consuming task <br />
              into a seamless, AI-powered process with <br />
              Tallyrus
            </div>
  
            <p className="relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <a
                href="https://docs.google.com/forms/d/1u6flS76PDzomzjtAG1S_AI5Mh8RDi5JoP4EnZFCelFI/edit"
                className="text-[#46392b] font-serif text-sm hover:underline"
              >
                Join Our Team!
              </a>
            </p>
  
            <div className="text-[#46392b] font-serif relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <span className="text-l">Email:</span>
              <span className="text-sm">tallyrus@gmail.com</span>
            </div>
  
            <div className="text-l text-[#46392b] font-serif relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-4 mt-3 items-center max-w-lg">
              Social:
              <div className="flex flex-row gap-4">
                <a href="https://www.instagram.com/tallyrus.official/">
                  <img
                    src="/instagram.svg"
                    alt="Instagram"
                    className="w-6 h-6 hover:opacity-80"
                  />
                </a>
  
                <a href="https://www.tiktok.com/@tallyrus.ai">
                  <img
                    src="/tiktok.svg"
                    alt="TikTok"
                    className="w-6 h-6 hover:opacity-80"
                  />
                </a>
              </div>
            </div>
          </div>
  
          {/* Formulario */}
          <div className="mt-10 ml-auto fade-in bg-transparent">
            <h1 className="text-3xl font-extrabold text-[#46392b] font-serif mx-20">
              Let us know if you have any questions!
            </h1>
  
            <form onSubmit={handleSubmit} className="mt-5 ml-20">
              <div>
                <label className="block font-medium mt-7 text-[#46392b] font-serif">Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`w-[700px] p-2 rounded mt-2 mb-3 bg-[#d2bd99] placeholder:text-[#46392b] text-[#46392b] font-serif placeholder:font-serif ${emailError ? "border-red-600 text-red-600" : ""}`}
                  value={from_email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
  
              <div>
                <label className="block font-medium text-[#46392b] font-serif">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-[700px] p-2 rounded mt-1 mb-3 bg-[#d2bd99] placeholder:text-[#46392b] placeholder:font-serif text-[#46392b] font-serif"
                  value={from_name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
  
              <div>
                <label className="block font-medium text-[#46392b] font-serif">Message</label>
                <textarea
                  placeholder="Write your message..."
                  className="w-[700px] h-40 p-2  rounded mt-1 mb-3 bg-[#d2bd99] placeholder:text-[#46392b] placeholder:font-serif text-[#46392b] font-serif"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
  
              <button
                type="submit"
                className="text-m font-normal text-[#bb9d7a] text-center px-10 py-4 bg-[#231c15] rounded-full transition mx-auto block mb-10 mt-10"
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
    //<div id="page-background">
    //  <handleScroll />
      <div className=''>
        {/*<AnimatedLines />*/}
        <div className='bg-[#bb9d7a] w-full h-full'> 
          <Header />
          <Hero />
        </div>
        <div className='bg-[#d2bd99] w-full h-full'> 
          <FeaturesSection />
          <Time />
          {/*<AdditionalSections />
          <Prices />*/}
          <QyA />
        </div>
        <div className='bg-[#bb9d7a] w-full h-full'> 
          <Contact />
        </div>
      </div>
   // </div>
  );
};


export default AboutTallyrus;
