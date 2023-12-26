import React, { useState, useEffect } from "react";
import Gallery from "../components/Gallery"; // Importing the Gallery component
import { useNavigate } from "react-router-dom";


const Library = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/templates/publics`, {
          credentials: 'include'
        });
        const data = await response.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return <p>Select a template to view its preview.</p>;
  
    return (
      <div>
        <h4>Selected template:</h4>
        <hr />
        <h1>{selectedTemplate.title}</h1>
        <h2>{selectedTemplate.description}</h2>
        {selectedTemplate.template.map((item, index) => {
          switch (item.type) {
            case "header":
              return <h3 key={index}>{item.context}</h3>;
            case "textbox":
              return <textarea key={index} placeholder={item.context} readOnly />;
            case "selector":
              return (
                <div key={index}>
                  {item.context.map((option, idx) => (
                    <span key={idx} className="tag">
                      {option}
                    </span>
                  ))}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  
  };

  const handleGetTemplate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/templates`, {
        credentials: 'include',
        method: "POST",
        body: JSON.stringify(selectedTemplate),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Error fetching template:', await response.text());
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="gallery">
      <div className="gallerypad">
        <a onClick={handleBackClick} className="backbuttongallery">← Go Back</a>
        <h1 className="galleryheader">The Gallery!</h1>
        <p className="gallerypara">Welcome to our curated collection of ready-to-use templates, thoughtfully designed for those wanting to dive right in and an effortless start!</p>
        <hr/>

        {templates.map((template) => (
          <Gallery
            template={template}
            key={template._id}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>

      <div className="live-template-preview">
        {selectedTemplate && <button onClick={handleGetTemplate}>Get Template</button>}
        {renderTemplatePreview()}
      </div>
    </div>
  );
};

export default Library;
