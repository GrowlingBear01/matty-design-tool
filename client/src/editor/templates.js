// This file exports an array of predefined template objects.
// Each template has an ID, a name, and an array of objects for the canvas.

export const templates = [
  {
    id: 'template-1',
    name: 'Simple Social Post',
    // A simple preview image for the template browser
    preview: 'https://placehold.co/400x300/7c3aed/ffffff?text=Social+Post',
    objects: [
      {
        id: `rect-${Date.now() + 1}`,
        type: 'shape',
        shapeType: 'rect',
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: '#7c3aed', // A nice purple color
      },
      {
        id: `text-${Date.now() + 2}`,
        type: 'text',
        x: 150,
        y: 250,
        text: 'Your Headline Here',
        fontSize: 60,
        fill: '#ffffff',
        fontFamily: 'Impact',
      },
       {
        id: `text-${Date.now() + 3}`,
        type: 'text',
        x: 150,
        y: 320,
        text: 'Edit this text to add your own message. Make it catchy and engaging!',
        fontSize: 24,
        width: 500,
        fill: '#dddddd',
        fontFamily: 'Arial',
      },
    ],
  },
  {
    id: 'template-2',
    name: 'Minimalist Quote',
    preview: 'https://placehold.co/400x300/f3f4f6/111827?text=Quote+Template',
    objects: [
       {
        id: `rect-${Date.now() + 4}`,
        type: 'shape',
        shapeType: 'rect',
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: '#f3f4f6', // Light gray background
      },
      {
        id: `text-${Date.now() + 5}`,
        type: 'text',
        x: 100,
        y: 200,
        text: '"The only way to do great work is to love what you do."',
        fontSize: 48,
        width: 600,
        fill: '#111827', // Dark text
        fontFamily: 'Georgia',
        fontStyle: 'italic'
      },
      {
        id: `text-${Date.now() + 6}`,
        type: 'text',
        x: 500,
        y: 350,
        text: '- Steve Jobs',
        fontSize: 24,
        fill: '#4b5563', // Medium gray
        fontFamily: 'Georgia',
      },
    ],
  },
   {
    id: 'template-3',
    name: 'Event Announcement',
    preview: 'https://placehold.co/400x300/10b981/ffffff?text=Event+Announce',
    objects: [
      {
        id: `circle-${Date.now() + 7}`,
        type: 'shape',
        shapeType: 'circle',
        x: 200,
        y: 250,
        radius: 150,
        fill: '#10b981', // Emerald green
      },
      {
        id: `text-${Date.now() + 8}`,
        type: 'text',
        x: 400,
        y: 150,
        text: 'You Are Invited!',
        fontSize: 72,
        fill: '#374151',
        fontFamily: 'Impact',
      },
      {
        id: `text-${Date.now() + 9}`,
        type: 'text',
        x: 420,
        y: 250,
        text: 'PARTY OF THE YEAR',
        fontSize: 32,
        fill: '#374151',
        fontFamily: 'Verdana',
      },
    ],
  },
];