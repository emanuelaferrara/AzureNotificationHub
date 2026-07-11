import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  console.log({
    body: req.body,
    headers: req.rawHeaders    
  })

  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Azure Notification Backend listening on port ${port}`);
});