import * as dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') 
{
    dotenv.config();
}

import * as express from 'express';
import { store, router as apiRouter } from './routes';
import { initialize } from "./migration";


const app = express();

store.open();
initialize(store);

app.use(express.static('public'));
app.use(express.json()); // this middlewre must come first
app.use(apiRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Started, Currently listening on port: ${port}`));

process.on( 'SIGTERM', function () 
{
    store.close();
 
    setTimeout( function () {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1); 
    }, 30*1000);
 
});
