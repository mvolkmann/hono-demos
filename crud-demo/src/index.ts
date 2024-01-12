import {Hono, type Context} from 'hono';
import {serveStatic} from 'hono/bun';

interface NewDog {
  name: string;
  breed: string;
}

interface Dog extends NewDog {
  id: number;
}

let lastId = 0;
const dogs: {[id: number]: Dog} = {};

function addDog(name: string, breed: string): Dog {
  const id = ++lastId;
  const dog = {id, name, breed};
  dogs[id] = dog;
  return dog;
}

addDog('Comet', 'Whippet');
addDog('Oscar', 'German Shorthaired Pointer');

const app = new Hono();

// Try browsing http://localhost:3000/demo.html
app.use('/*', serveStatic({root: './public'}));

app.get('/dog', (c: Context) => {
  return c.json(dogs);
});

app.get('/dog/:id', (c: Context) => {
  const id = Number(c.req.param('id'));
  const dog = dogs[id];
  c.status(dog ? 200 : 404);
  return c.json(dog);
});

app.post('/dog', async (c: Context) => {
  const data = (await c.req.json()) as unknown as NewDog;
  const dog = addDog(data.name, data.breed);
  return c.json(dog);
});

app.put('/dog/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  const data = (await c.req.json()) as unknown as NewDog;
  const dog = dogs[id];
  if (dog) {
    dog.name = data.name;
    dog.breed = data.breed;
  }
  c.status(dog ? 200 : 404);
  return c.json(dog);
});

app.delete('/dog/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  const dog = dogs[id];
  if (dog) delete dogs[id];
  c.status(dog ? 200 : 404);
  return c.text('');
});

export default app;
