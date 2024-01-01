import React from 'react';
import Cards from "../components/Cards";


import Header from '../components/Header';

const About = () => {
  const projects = [
    {
      title: 'Hi👋, This is Pergi!',
      description: 'Pergi is an easy-to-use app that makes it faster and simpler to handle ChatGPT prompts. With Pergi, you don\'t have to keep typing the same things over and over, making your work with ChatGPT smoother and quicker.',
      theme: 'dark',
      gridClass: 'card-2x1',
      backgroundColor: 'bg-color-black',
      textPosition: 'bottom-left', // Added this
    },
    {
      theme: 'light',
      gridClass: 'card-1x1',
      backgroundImage: './yaypergi.png',
      backgroundColor: 'bg-color-green'
    },
    {
      title: 'Does This Sound Like a Familiar Problem??',
      description: 'Do you often find yourself typing the same prompts into ChatGPT over and over such as edit this essay..., edit this essay..., EDIT THIS ES#%@*!!!? This can be REALLY annoying and slow down your work.',
      theme: 'dark',
      gridClass: 'card-1x1',
      backgroundColor: 'bg-color-blue',
      textPosition: 'top-left',
    },
    {
      title: 'How Does Pergi Solve This ;)',
      description: 'At Pergi, we tackle the challenge of managing your prompts by providing customizable templates. These templates let you create and save your favorite prompts, so you can use them again and again with ease.',
      theme: 'dark',
      gridClass: 'card-2x1',
      backgroundColor: 'bg-color-red',
      textPosition: 'bottom-left',
    }
  ];

  const details = [  
  {
    title: 'The Creator of Pergi and Who is it For???',
    description: 'Pergi.app was created by Gautham Pandian, a CS student at UC Davis. He created this app out of his frustrations with ChatGPT and designed it for students that had the same issues as him. On top of that Pergi was made for a wide range of users, from content creators and digital marketers to AI hobbyists. So whether you\'re editting essays, needing help with code, or drafting the perfect cover letter, our app provides the tools to make prompt management effortless and efficient.',
    theme: 'dark',
    gridClass: 'card-1x2',
    backgroundColor: 'bg-color-lavender',
    textPosition: 'top-left',
    link: "https://gauthampdn.onrender.com/",
    linknote: "About the Creator"
  },

  {
    title: 'So What is Prompt Engineering',
    description: 'Prompt engineering is the art of crafting effective prompts to communicate with AI models. It\'s about understanding how to frame questions and statements in a way that leverages the AI\'s capabilities to produce the desired output.',
    theme: 'light',
    gridClass: 'card-1x1',
    backgroundColor: 'bg-color-yellow',
    textPosition: 'top-left',
  },

  {
    title: 'The Power of Precision in AI Interactions',
    description: 'Mastering prompt engineering with Pergi.app brings numerous benefits: Enhanced Accuracy, Creative Freedom, Time Efficiency, Consistency in Results, Learning and Improvement.',
    theme: 'dark',
    gridClass: 'card-1x1',
    backgroundColor: 'bg-color-red',
    textPosition: 'top-left',
  },
  {
    title: 'Pergi.app\'s Core Offerings: Enhancing Your AI Experience',
    description: 'Pergi.app comes packed with features to revolutionize your AI interactions: Prompt Library, Efficiency Tools, Customizable Templates, Collaboration Enabled, Usage Analytics. These features are designed to not only save time but also to enhance the quality of your AI interactions.',
    theme: 'light',
    gridClass: 'card-2x1',
    backgroundColor: 'bg-color-green',
    textPosition: 'bottom-left',
  }
];

  return (
    <div className='aboutsection'>
      <Header/>
      {/* <section className="about-section">
        <div className="about-content">
          <div className="text-container">
            <h1 className="about-heading-1"><span className="about-span">PERGI</span></h1>
            <h2 className="about-heading-2">The Assistant to Save Your ChatGPT Prompts!</h2>
            <h2 className="about-heading-2">Go ahead and try out Beta V1.0</h2>
            <div className="about-button-container">
              <button type="button" onClick={() => window.location.href = '/'}
                className="about-button">
                Log in and try!
              </button>
            </div>
          </div>
          <div className="image-container">
            <img src="/yaypergi.png" alt="Pergi Bird" />
          </div>
        </div>
      </section> */}
      <section id="home" className="cards-section">
        <Cards projects={projects} />
      </section>

      <section id="more" className="cards-section">
        <h1 className="cards-heading-1">More Details</h1>
        <h2 className="cards-heading-2">Here's some more details on prompt engineering, AI, ChatGPT, and even full-stack development on how we built Pergi soon to come, as well as much more!</h2>
        <Cards projects={details} />
      </section>
    </div>

  );
}

export default About;
