import React, { useEffect, useRef, useState } from 'react';
import Navbar from 'components/Navbar'; // Adjust the import path as necessary
import Matter from 'matter-js';
import MatterWrap from 'matter-wrap';

const Profile = () => {
  const scene = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (scene.current) {
        setDimensions({
          width: scene.current.clientWidth,
          height: scene.current.clientHeight - 20,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set dimensions

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
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

    const numberOfCircles = 100; // Change this number to get any number of circles
    const columns = Math.ceil(Math.sqrt(numberOfCircles));
    const rows = Math.ceil(numberOfCircles / columns);

    const stack = Composites.stack(100, 100, columns, rows, 2, 2, function(x, y, column, row) {
      if (column * rows + row < numberOfCircles) {
        const radius = Common.random(15, 20);
        const scale = radius / 42 * 0.1; // Calculate the scale based on radius
        const fruitOptions = {
          render: {
            sprite: {
              texture: fruitTexture,
              xScale: scale,
              yScale: scale
            }
          }
        };
        return Bodies.circle(x, y, radius, { ...fruitOptions, restitution: 0, friction: 0.1 });
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
  }, [dimensions]);

  return (
    <div className="flex flex-col h-screen bg-neutral-200">
      <Navbar />
      <div className="bg-white rounded-3xl m-3 flex flex-grow overflow-auto bg-neutral-100">
        <div ref={scene} className="w-1/2 m-10 "/>
        <div className="w-1/2 p-5 flex items-center justify-center bg-white ">
          <h1 className="text-3xl font-bold">Hi there, welcome!</h1>
        </div>
      </div>
    </div>
  );
}

export default Profile;
