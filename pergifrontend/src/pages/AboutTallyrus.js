import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import './AnimatedLines.css';
import './backgroundColor.css';
import { SizeIcon } from '@radix-ui/react-icons';
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { validateEmail} from './Validation';

const AboutTallyrus = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const Header = () => {
    return (
      <div className="flex justify-between items-center text-lg font-serif bg-transparent text-white py-10">
      {/* Logo */}
      <div className="flex justify-start mx-16 items-center gap-2">
        <img src="/tallyrus2white.png" className="w-8 h-7" alt="Tallyrus" />
        <span className="">Tallyrus</span>
      </div>
    
      {/* links*/}
      <div className="flex justify-end gap-8 mx-16">
        <a href="/About_us" className="hover:underline">About us</a>
        <a href="/payment" className="hover:underline">Services</a>
      </div>
    </div>
    
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
            <h1 className="text-6xl font-extrabold mb-6 text-white">Revolutionizing Essay <br />Grading with AI</h1>
            <h1 className="text-lg font-semibold mb-6 text-gray-400">
              At Tallyrus 2.0, we're transforming education by streamlining the grading process with AI-powered feedback. 
              <br />
              Our mission is to give educators more time to teach, while students receive personalized and actionable 
              insights to improve their writing.
            </h1>
          </div>
          <div className='p-10'>
            <button onClick={() => navigate('/login')} className="flex items-center rounded-lg left-8 px-10 py-4 bg-green-800 text-white hover:bg-gray-400">
              <div className=''>
                <h1 className='text-m font-normal '> Try our live app!</h1>
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
          <h1 className="text-4xl font-bold text-center mb-4 text-white">About</h1>
          <h1 className="text-xl font-semibold text-center mb-20 text-gray-400"> Here's how Tallyrus works to save both <br /> teachers and students' time</h1>
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
      <div className={`container mx-auto flex flex-col md:flex-row items-center justify-between fade-in ${reverse ? 'md:flex-row-reverse' : ''}`} style={{ animationDelay: '2.0s' }}>
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-white">{title}</h2>
          <p className="text-lg text-gray-400">{content}</p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img src={imageSrc} alt={imageAlt} className="rounded-3xl max-w-md" />
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
      <div className="flex justify-center p-8 fade-in mt-20 py-32">
        <div className="flex flex-col md:flex-row items-start justify-start max-w-6xl w-full mx-auto gap-20 mb-20 mt-20">
          {/* Title */}
          <h1 className="text-5xl font-serif font-extrabold text-white mt-20"> 
            FAQ 
          </h1>

          {/* block */}
          <div className="flex flex-col w-full md:w-[700px] ml-40">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white w-full shadow-lg rounded-lg p-6 transition-all duration-300 mb-4 cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                {/* questions */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif font-bold text-black">{section.question}</h2>
                  <span className="text-black text-lg">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>

                {/* Answers (only if open) */}
                {openIndex === index && (
                  <p className="mt-4 text-gray-900 font-serif text-base" dangerouslySetInnerHTML={{ __html: section.answer }} />
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
    const [emailError, setEmailError] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault(); // Evita que la página se recargue
  
      if (!validateEmail(from_email)) {
        setEmailError(true);  // Marcar el campo en rojo si el email es inválido
        alert("Please enter a valid email address.");
        return;
      }


      const templateParams = {
        from_name,
        from_email,
        message,
      };
  
      emailjs
        .send(
          process.env.REACT_APP_SECRET_KEY_EMAIL, // Service ID
          process.env.REACT_APP_MESSAGE, // Template ID
          templateParams,
          process.env.REACT_APP_PUBLICK_KEY_EMAIL // Public Key
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
        process.env.REACT_APP_SECRET_KEY_EMAIL,   // ID del servicio
        process.env.REACT_APP_RECEIVED_MESSAGE,  // ID de la plantilla de respuesta automática
        autoResponseParams,   // Parámetros para la respuesta automática
        process.env.REACT_APP_PUBLICK_KEY_EMAIL   // Clave pública
      )
      .then((response) => {
        console.log('Automatic response sent', response);
      })
      .catch((error) => {
        console.error('Error: we couldn\'t send the automatic response', error);
      });

      console.log("Service ID:", process.env.REACT_APP_SERVICE_ID);
      console.log("Template ID:", process.env.REACT_APP_TEMPLATE_ID);
      console.log("Public Key:", process.env.REACT_APP_PUBLIC_KEY);
      console.log("Params:", templateParams);

      // reset after sending
      setEmail("");
      setName("");
      setMessage("");
      setEmailError(false);  // Restablecer el error después de enviar
    };
  
    return (
      <div className="bg-black w-screen h-screen py-20 px-40 relative justify-center fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start mt-10 font-serif">
          {/* Sección Izquierda */}
          <div className="max-w-lg text-white">
            <div className="relative top-5 -left-12 mb-32">
              <img src="/tallyrus2white.png" className="w-10" alt="Tallyrus" />
              <div className="text-2xl font-serif font-extrabold relative">
                Tallyrus
              </div>
            </div>
  
            <div className="text-l relative -top-16 -left-12 mb-32">
              Transform grading from a time-consuming task <br />
              into a seamless, AI-powered process with <br />
              Tallyrus
            </div>
  
            <p className="relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <a
                href="https://docs.google.com/forms/d/1u6flS76PDzomzjtAG1S_AI5Mh8RDi5JoP4EnZFCelFI/edit"
                className="text-sm hover:underline"
              >
                Join Our Team!
              </a>
            </p>
  
            <div className="relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-2 mt-3 items-center max-w-lg">
              <span className="text-l">Email:</span>
              <span className="text-sm">tallyrus@gmail.com</span>
            </div>
  
            <div className="text-l relative -top-20 -left-12 mb-3 flex flex-row md:flex-row gap-4 mt-3 items-center max-w-lg">
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
            <h1 className="text-3xl font-extrabold text-white font-serif mx-20">
              Let us know if you have any questions!
            </h1>
  
            <form onSubmit={handleSubmit} className="mt-5 ml-20">
              {/* EMAIL */}
              <div>
                <label className="block font-medium mt-7 text-white font-serif">Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`w-[700px] p-2 rounded mt-2 mb-3 bg-gray-600 placeholder:text-white text-white font-serif placeholder:font-serif ${emailError ? "border-red-600 text-red-600" : ""}`}
                  value={from_email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
  
              {/* NAME */}
              <div>
                <label className="block font-medium text-white font-serif">Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-[700px] p-2 rounded mt-1 mb-3 bg-gray-600 placeholder:text-white placeholder:font-serif text-white font-serif"
                  value={from_name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
  
              {/* MESSAGE */}
              <div>
                <label className="block font-medium text-white font-serif">Message</label>
                <textarea
                  placeholder="Write your message..."
                  className="w-[700px] h-40 p-2  rounded mt-1 mb-3 bg-gray-600 placeholder:text-white placeholder:font-serif text-white font-serif"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
  
              <button
                type="submit"
                className="text-m font-serif text-white text-center px-10 py-4 bg-green-800 text-white hover:bg-gray-400 rounded-lg transition mx-auto block mb-2 mt-10"
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
    <div className='pt-2 bg-black text-white'>
      <AnimatedLines />
      <div className=''>
        <Header />
        <Hero />
        <FeaturesSection />
        <Time />
        <QyA />
        <Contact />
      </div>
    </div>
  );
};

export default AboutTallyrus;