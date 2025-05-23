import React, { useEffect, useRef, useState } from "react";
import Navbar from "components/Navbar"; // Adjust the import path as necessary
import Matter from "matter-js";
import MatterWrap from "matter-wrap";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const { user, isLoading } = useAuthContext();
  const [numGraded, setNumGraded] = useState(0);
  const [board, setBoard] = useState([]);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const navigate = useNavigate();

  const scene = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    handleResize(); // Initial call to set dimensions

    console.log("getting oranges");
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
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set dimensions

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const {
      Engine,
      Render,
      Runner,
      Composite,
      Composites,
      Common,
      MouseConstraint,
      Mouse,
      Bodies,
    } = Matter;

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
        background: "transparent", // Ensure background is set to transparent
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    let thickness = 40;

    Composite.add(world, [
      Bodies.rectangle(
        dimensions.width / 2,
        dimensions.height,
        dimensions.width,
        thickness,
        { isStatic: true, render: { fillStyle: "#6c757d" } }
      ), // Bottom wall
      Bodies.rectangle(
        dimensions.width,
        dimensions.height / 2,
        thickness,
        dimensions.height,
        { isStatic: true, render: { fillStyle: "#6c757d" } }
      ), // Right wall
      Bodies.rectangle(0, dimensions.height / 2, thickness, dimensions.height, {
        isStatic: true,
        render: { fillStyle: "#6c757d" },
      }), // Left wall
    ]);

    const fruitTexture = "/orange.png";

    const numberOfCircles = numGraded; // Change this number to get any number of circles
    const columns = Math.ceil(Math.sqrt(numberOfCircles));
    const rows = Math.ceil(numberOfCircles / columns);

    const stack = Composites.stack(
      20,
      -200,
      columns,
      rows,
      1,
      1,
      function (x, y, column, row) {
        if (column * rows + row < numberOfCircles) {
          const radius = Common.random(10, 15);
          const scale = (radius / 45) * 0.1; // Calculate the scale based on radius
          const fruitOptions = {
            render: {
              sprite: {
                texture: fruitTexture,
                xScale: scale,
                yScale: scale,
              },
            },
          };
          return Bodies.circle(x, y, radius, {
            ...fruitOptions,
            restitution: 0,
            friction: 0.1,
            mass: 0.1,
          });
        } else {
          return null;
        }
      }
    );

    Composite.add(world, stack);

    const mouse = Mouse.create(render.canvas);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(world, mouseConstraint);

    render.mouse = mouse;

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: dimensions.width, y: dimensions.height },
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
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="3x"
              className="mb-4 text-indigo-500"
            />
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
    navigate("/upload-old-essays"); // Adjust the route as necessary
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-grow">
        <div className="w-1/2 bg-gray-800 rounded-3xl m-4 mr-0 flex flex-grow overflow-auto">
          <div ref={scene} className="w-full m-10 overflow-auto" />
        </div>
        <div className="w-1/2 m-4 text-white bg-gray-800 rounded-3xl p-5 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Your Tallyrus Tracker!</h1>
          <div className="text-center">
            <p className="text-lg">
              Each <span className="text-orange-500">orange</span> you see
              represents an essay that Tallyrus has graded!
            </p>
            <img
              src="/orange.png"
              alt="Orange"
              className="w-16 h-16 mx-auto mt-4 animate-bounce"
            />
            {/* {user && user.authority === "teacher" && (
              <Button onClick={handleUploadNavigation} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                Upload Old Graded Essays
              </Button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
