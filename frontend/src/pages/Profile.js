import React, { useEffect, useRef, useState } from 'react';
import Navbar from 'components/Navbar'; // Adjust the import path as necessary
import Matter from 'matter-js';
import MatterWrap from 'matter-wrap';
import { useAuthContext } from "../hooks/useAuthContext";
import { usePremium } from "../hooks/usePremium";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCrown, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { user, isLoading } = useAuthContext();
  const { startSubscription, cancelSubscription, isLoading: premiumLoading, error: premiumError } = usePremium();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [numGraded, setNumGraded] = useState(0);
  const [board, setBoard] = useState([]);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const navigate = useNavigate();

  const scene = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    handleResize(); // Initial call to set dimensions
    

    console.log("getting oranges")
    if (user) {
      setNumGraded(user.numGraded);
    }
  }, [user]);

  const handleResize = () => {
    if (scene.current) {
      setDimensions({
        width: scene.current.clientWidth,
        height: scene.current.clientHeight - 20,
      });
    }
  };

  useEffect(() => {

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set dimensions

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { Engine, Render, Runner, Composite, Composites, Common, MouseConstraint, Mouse, Bodies } = Matter;

    try {
      Matter.use(MatterWrap);
    } catch (e) {
      console.error(e);
    }

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: scene.current,
      engine: engine,
      options: {
        width: dimensions.width,
        height: dimensions.height,
        showAngleIndicator: false,
        wireframes: false,
        background: 'transparent' // Ensure background is set to transparent
      }
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    let thickness = 40;

    Composite.add(world, [
      Bodies.rectangle(dimensions.width / 2, dimensions.height, dimensions.width, thickness, { isStatic: true, render: { fillStyle: '#6c757d' } }), // Bottom wall
      Bodies.rectangle(dimensions.width, dimensions.height / 2, thickness, dimensions.height, { isStatic: true, render: { fillStyle: '#6c757d' } }), // Right wall
      Bodies.rectangle(0, dimensions.height / 2, thickness, dimensions.height, { isStatic: true, render: { fillStyle: '#6c757d' } }) // Left wall
    ]);

    const fruitTexture = '/orange.png';

    const numberOfCircles = numGraded; // Change this number to get any number of circles
    const columns = Math.ceil(Math.sqrt(numberOfCircles));
    const rows = Math.ceil(numberOfCircles / columns);

    const stack = Composites.stack(20, -200, columns, rows, 1, 1, function (x, y, column, row) {
      if (column * rows + row < numberOfCircles) {
        const radius = Common.random(10, 15);
        const scale = radius / 45 * 0.1; // Calculate the scale based on radius
        const fruitOptions = {
          render: {
            sprite: {
              texture: fruitTexture,
              xScale: scale,
              yScale: scale
            }
          }
        };
        return Bodies.circle(x, y, radius, { ...fruitOptions, restitution: 0, friction: 0.1, mass:0.1 });
      } else {
        return null;
      }
    });

    Composite.add(world, stack);

    const mouse = Mouse.create(render.canvas);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    Composite.add(world, mouseConstraint);

    render.mouse = mouse;

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: dimensions.width, y: dimensions.height }
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(world);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [dimensions, numGraded, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="mb-4 text-indigo-500" />
            <p className="text-lg">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.numGraded == null) {
    return <div>Loading...</div>;
  }
  
  const handleUploadNavigation = () => {
    navigate('/upload-old-essays'); // Adjust the route as necessary
  };

  const handleSubscribe = async () => {
    const checkoutUrl = await startSubscription();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setSuccessMessage('Your subscription has been canceled and will end at the end of the current billing period.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar />
      <div className='flex flex-grow flex-col md:flex-row'>
        <div className="w-full md:w-1/2 bg-gray-800 rounded-3xl m-4 mr-0 flex flex-grow overflow-auto">
          <div ref={scene} className="w-full m-10 overflow-auto" />
        </div>
        <div className="w-full md:w-1/2 m-4 text-white bg-gray-800 rounded-3xl p-5 flex flex-col">
          <h1 className="text-3xl font-bold mb-4 text-center">Your Tallyrus Tracker!</h1>
          
          <div className="text-center mb-8">
            <p className="text-lg">Each <span className="text-orange-500">orange</span> you see represents an essay that Tallyrus has graded!</p>
            <img src="/orange.png" alt="Orange" className="w-16 h-16 mx-auto mt-4 animate-bounce" />
          </div>
          
          {/* Subscription Management Section */}
          <div className="mt-8 bg-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-400 mr-2" />
              Subscription Status
            </h2>
            
            {user.isPremium ? (
              <div>
                <div className="flex items-center mb-4 bg-green-900/50 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                  <span className="text-lg">You have an active premium subscription</span>
                </div>
                
                {user.premiumExpiresAt && (
                  <p className="mb-4">
                    Your subscription renews on: {new Date(user.premiumExpiresAt).toLocaleDateString()}
                  </p>
                )}
                
                <Button 
                  onClick={handleCancelSubscription}
                  disabled={premiumLoading}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  {premiumLoading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4 bg-gray-900/50 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faTimes} className="text-red-500 mr-2" />
                  <span className="text-lg">You do not have a premium subscription</span>
                </div>
                
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-2">Premium Benefits:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Unlimited essay grading</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                    <li>Early access to new features</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleSubscribe}
                  disabled={premiumLoading}
                  className="mt-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white"
                >
                  {premiumLoading ? 'Processing...' : 'Subscribe to Premium - $12/month'}
                </Button>
              </div>
            )}
            
            {/* Success message */}
            {showSuccessMessage && (
              <div className="mt-4 bg-green-900/50 p-3 rounded-lg">
                <p>{successMessage}</p>
              </div>
            )}
            
            {premiumError && (
              <div className="mt-4 bg-red-900/50 p-3 rounded-lg">
                <p>{premiumError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
