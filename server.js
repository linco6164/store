const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});