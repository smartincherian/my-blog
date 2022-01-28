import express, { application } from 'express';
import { MongoClient} from 'mongodb';
import path from 'path';
// const articlesInfo = {
//     'learn-react' : {
//         upvotes : 0,
//         comments : [],
//     },

//     'learn-node' : {
//         upvotes : 0,
//         comments : [],
//     },

//     'my-thoughts-on-resumes' : {
//         upvotes : 0,
//         comments : [],
//     },
// }

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'src/build')));

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// app.get('/hello', (req,res) => {
//     res.send("Hello");
// });

// app.get('/hello/:name', (req,res) => {
//     res.send(`Hello ${req.params.name}`);
// });

// app.post('/hello', (req,res) => {
//     res.send(`Hello ${req.body.name} !!`);
// });

//Function for connecting db
const withDb = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true});
        const db = client.db('my-blog');
        
        await operations(db);
        
        await client.close();
    } catch(error) {
        res.status(500).send({message: "Error connecting ", error});
    }

}

// app.get('/api/articles/:name', async (req,res) => {

// try {
//     const articleName = req.params.name;

//     const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true});
//     const db = client.db('my-blog');

//     const articleInfo = await db.collection('article').findOne({name : articleName});
//     res.status(200).send(articleInfo);
    
//     await client.close();
// } catch(error) {
//     res.status(500).send({message: "Error connecting ", error});
// }
// });

app.get('/api/articles/:name', async (req,res) => {

    withDb(async (db) =>{
        const articleName = req.params.name;

        const articleInfo = await db.collection('article').findOne({name : articleName});
        res.status(200).send(articleInfo);
    }, res) //response as an argument

});


// app.post('/api/articles/:name/upvote', (req,res) => {
//     const articleName = req.params.name;

//     articlesInfo[articleName].upvotes += 1;
//     res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`)

// });

// app.post('/api/articles/:name/add-comment', (req,res) => {
//     const articleName = req.params.name;
//     const {username, text} = req.body;

//     articlesInfo[articleName].comments.push({username, text});

//     res.status(200).send(articlesInfo[articleName]);

// });

// app.post('/api/articles/:name/upvote', async (req,res) => {
//     try {
//         const articleName = req.params.name;
    
//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser : true});
//         const db = client.db('my-blog');
    
//         const articleInfo = await db.collection('article').findOne({name : articleName});
//         await db.collection('article').updateOne({name : articleName}, {
//             '$set': {
//                 upvotes: articleInfo.upvotes + 1,
//             },
//         });

//         const updatedArticleInfo = await db.collection('article').findOne({name : articleName});

//         res.status(200).json(updatedArticleInfo);
        
//         await client.close();
//     } catch(error) {
//         res.status(500).send({message: "Error connecting ", error});
//     }
//     });


    app.post('/api/articles/:name/upvote', async (req,res) => {
        withDb(async (db) => {
            const articleName = req.params.name;
        
            const articleInfo = await db.collection('article').findOne({name : articleName});
            await db.collection('article').updateOne({name : articleName}, {
                '$set': {
                    upvotes: articleInfo.upvotes + 1,
                },
            });
    
            const updatedArticleInfo = await db.collection('article').findOne({name : articleName});
    
            res.status(200).json(updatedArticleInfo);
            
          
        }, res);
        });


        app.post('/api/articles/:name/add-comment', (req,res) => {
            
            const articleName = req.params.name;
            const {username, text} = req.body;

            withDb(async (db) => {
                

                const articleInfo = await db.collection('article'). findOne({name: articleName});
                await db.collection('article').updateOne({name: articleName}, {
                    '$set' : {
                        comments: articleInfo.comments.concat({username, text}),

                    },
                });

                const updatedArticleInfo = await db.collection('article'). findOne({name: articleName});
                res.status(200).json(updatedArticleInfo);
            }, res)
        });
    
app.get('*', (req,res)=> {
    res.sendFile(path.join(__dirname + 'src/build/index.html'));
})

app.listen(8000, () => console.log('Server running on port 8000'));