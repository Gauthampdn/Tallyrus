import React, { useState, useEffect, useRef } from 'react';
import { useTemplatesContext } from "../hooks/useTemplatesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from 'react-router-dom';
import TemplateDetails from "../components/TemplateDetails";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OpenAI from 'openai'; // Ensure you have imported OpenAI correctly
import ReactMarkdown from 'react-markdown';



const Home = () => {
  const navigate = useNavigate();
  const { templates, dispatch } = useTemplatesContext();
  const { user } = useAuthContext();
  const [currTemplate, setCurrTemplate] = useState(null);
  const [interactText, setInteractText] = useState('');
  const [convos, setConvos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const textboxRef = useRef(null);

  useEffect(() => {
    // Automatically focus the textbox when the component mounts
    if (textboxRef.current) {
      textboxRef.current.focus();
    }
  }, []);


  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_API_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Be cautious with this in a production environment
  });

  const handleInteractKeyPress = async (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault(); // Prevent default to avoid newline in textarea
      setIsSubmitting(true);

      // Temporarily disable the textbox
      if (textboxRef.current) {
        textboxRef.current.disabled = true;
      }

      const newConvo = { role: 'user', content: interactText };
      const updatedConvos = [...convos, newConvo];
      let str = "";
      setInteractText(''); // Clear the textbox


      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          temperature: 0,
          messages: updatedConvos.map(c => ({ role: c.role, content: c.content })),
          stream: true
        });

        for await (const chunk of completion) {
          if (chunk.choices[0].delta.content === undefined) {
            break;
          }
          str += chunk.choices[0].delta.content;
          setConvos([...updatedConvos, { role: "assistant", content: str }])
        }

        setConvos([...updatedConvos, { role: 'assistant', content: str }]);
      } catch (error) {
        console.error('Error with OpenAI API:', error);
      }

      if (textboxRef.current) {
        textboxRef.current.disabled = false;
        textboxRef.current.focus(); // Refocus the textbox
      }

      setIsSubmitting(false);
    }
  };


  const resetCurrentTemplate = () => {
    setCurrTemplate(null);
  };


  useEffect(() => {
    const fetchTemplates = async () => {
      console.log("fetching templates")
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/templates`, {
        credentials: 'include'
      });


      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_TEMPLATES', payload: json });
      }
    };

    if (user) {
      fetchTemplates();
    }

  }, [dispatch, user]);


  const handleTemplateClick = (template) => {
    setCurrTemplate(template);
    console.log(template)
  };

  const handleBackClick = () => {
    navigate('/library');
  };

  return (
    <div className="home">
      <div className="side side-scrollable">
        <Link to="/about">
          <h1 className="centered-header">Pergi</h1>
        </Link>
        <a href="https://forms.gle/WcCG1oUesh9h2Him7" target="_blank" rel="noopener noreferrer">
          <p className="centered-para">Send us your feedback! ↗</p>
        </a>

        <Navbar resetTemplate={resetCurrentTemplate} />

        

        {templates && templates.map(template => (
          <Sidebar
            template={template}
            key={template._id}
            onClick={() => handleTemplateClick(template)}
          />
        ))}

        <a onClick={handleBackClick} className="centered-para">The Gallery... ↗</a>


      </div>

      <div className="templates">
        <div className="conversation-container">
        {currTemplate && <TemplateDetails template={currTemplate} onDeleted={() => setCurrTemplate(null)} />}

          {!currTemplate && (
            <div className="convosstart">
              {convos.map((convo, index) => (
                <div key={index} className={`message ${convo.role}`}>
                  {/* Render the content as Markdown */}
                  <ReactMarkdown>{convo.content}</ReactMarkdown>
                </div>
              ))}
              <textarea
                ref={textboxRef}
                className="chattext"
                placeholder="Type here and press Enter to interact..."
                value={interactText}
                onChange={e => setInteractText(e.target.value)}
                onKeyPress={handleInteractKeyPress}
                disabled={isSubmitting} // Disable textarea during API streaming
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Home;
