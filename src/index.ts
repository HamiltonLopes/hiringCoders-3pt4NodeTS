import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { writeFile, readFile, unlink } from 'fs';

const PORT = 5000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = parse(req.url ? req.url : '', true);
    const user = url.query;
    const userID = `./src/data/${user.id}.txt`;
    switch (url.pathname) {
        case '/create-user':
        case '/update-user':
            readFile(userID, (err:any, _) => {
                res.statusCode = (err && url.pathname?.includes('update')) ? 404 : 200;
                res.setHeader('Content-Type', 'text/plain');
                if((!err && url.pathname?.includes('create')) || (err && url.pathname?.includes('update'))){
                    res.end(`This user ${err ? 'doesnt exist' : 'has already been created'}!`);
                }else{
                    writeFile(userID, JSON.stringify(user), () => {
                        res.end(`User ${err ? 'Created' : 'Updated'}!`);
                    });
                }
            });
            break;

        case '/select-user':
            readFile(userID, (err:any, data:Buffer) => {
                res.statusCode = err ? 404 : 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(err ? "User not found!" : data);
            });
            break;

        case '/delete-user':
            unlink(userID, (err:any) => {
                res.statusCode = err ? 404 : 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end(`User ${err ? 'not found' : 'Deleted'}!`);
            });
            break;

        default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Command not found");
            break;
    }
});

server.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
});